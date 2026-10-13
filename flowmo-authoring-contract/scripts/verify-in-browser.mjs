#!/usr/bin/env node

/**
 * BROWSER VERIFICATION for an f0 handoff - advisory, never the release gate.
 *
 * validate-handoff.mjs reads the source and runs the importer's routing. It
 * cannot see what only a rendered page shows: a font that never loaded, a
 * section that overflows a phone, a heading that paints at opacity 0, or a
 * scroll timeline that looks right going down and wrong coming back up. This
 * script loads the page in headless Chromium and checks those, at 1440x900 and
 * 390x844, each with reduced motion off and on. The same recipe, step by step
 * with the in-page snippets, is in references/browser-verify.md for agents
 * that have a browser tool but no shell.
 *
 * Two targets, two meanings:
 *  - the RAW handoff file runs plain GSAP, not f0's runtime: native payloads
 *    are inert and data-f0-*-scrub markers do nothing (unless the author ships
 *    a local stand-in). Trust it for layout, fonts, overflow, console, first
 *    paint and converter-safe GSAP.
 *  - the f0 Preview / published URL (pass --f0) is authoritative for motion.
 *    Imported GSAP is never gated by reduced motion there, so motion seen in a
 *    reduce run is reported as a note, not a warning.
 *
 * Usage:
 *   node verify-in-browser.mjs <file-or-url> [--track .a,.b] [--steps 30]
 *        [--settle 100] [--out dir] [--channel chrome] [--f0]
 *
 * Exit: 0 clean, 2 warnings, 1 could not run.
 */

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// Arguments and Playwright
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { target: '', track: '', steps: 30, settle: 100, out: '', channel: '', f0: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--track') opts.track = argv[++i] || '';
    else if (arg === '--steps') opts.steps = Math.max(4, Number(argv[++i]) || 30);
    else if (arg === '--settle') opts.settle = Math.max(0, Number(argv[++i]) || 0);
    else if (arg === '--out') opts.out = argv[++i] || '';
    else if (arg === '--channel') opts.channel = argv[++i] || '';
    else if (arg === '--f0') opts.f0 = true;
    else if (!opts.target) opts.target = arg;
  }
  return opts;
}

/** playwright-core, then playwright, then an explicit path in F0_PLAYWRIGHT_CORE. */
async function loadChromium() {
  const candidates = ['playwright-core', 'playwright'];
  if (process.env.F0_PLAYWRIGHT_CORE) candidates.push(pathToFileURL(process.env.F0_PLAYWRIGHT_CORE).href);
  for (const name of candidates) {
    try {
      const mod = await import(name);
      const chromium = mod.chromium || mod.default?.chromium;
      if (chromium) return chromium;
    } catch { /* try the next one */ }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tiny static server: a file target is served over http, not file://, so
// fetch()/XHR-based scripts and module imports behave as they will when hosted.
// ---------------------------------------------------------------------------

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.lottie': 'application/zip',
};

function serveDirectory(root) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(root, path.normalize(rel));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    const size = fs.statSync(file).size;
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    // Range support, so video seeking works the way a real host allows it.
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Number(range[2]) : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': size });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// ---------------------------------------------------------------------------
// In-page probes. Each runs inside the page via page.evaluate; the same logic
// is written out as standalone snippets in references/browser-verify.md.
// ---------------------------------------------------------------------------

const DEFAULT_TRACK = 'h1, h2, h3, [class*="reveal"], [class*="rise"], [class*="fade"], img, video, .ds-button';

/** Font faces that failed, and headline/body families the browser did not load. */
function probeFonts() {
  const faces = [...document.fonts].map((f) => ({ family: f.family.replace(/["']/g, ''), weight: f.weight, status: f.status }));
  const generic = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[\w-]+|-apple-system|blinkmacsystemfont|arial|helvetica|georgia|times new roman)$/i;
  const used = ['body', 'h1', 'h2', 'p', 'button'].map((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const family = getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/["']/g, '');
    const loaded = generic.test(family)
      || (document.fonts.check(`16px "${family}"`) && faces.some((f) => f.family === family && f.status === 'loaded'));
    return { selector: sel, family, loaded };
  }).filter(Boolean);
  return { failed: faces.filter((f) => f.status === 'error'), used };
}

/** Horizontal page overflow plus the elements that stick out past the viewport. */
function probeOverflow() {
  const width = document.documentElement.clientWidth;
  const overflow = document.documentElement.scrollWidth - width;
  const offenders = [];
  if (overflow > 1) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || (r.right <= width + 1 && r.left >= -1)) continue;
      let clipped = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX !== 'visible') { clipped = true; break; }
      }
      if (!clipped) offenders.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''} (${Math.round(r.left)}..${Math.round(r.right)})`);
      if (offenders.length >= 10) break;
    }
  }
  return { overflow: Math.max(0, overflow), offenders };
}

/** Effective opacity (own times ancestors) and document-relative rect for each tracked element. */
function probeSample(selector) {
  const eff = (el) => {
    let o = 1;
    for (let a = el; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      o *= Number(cs.opacity);
    }
    return o;
  };
  return [...document.querySelectorAll(selector)].slice(0, 80).map((el) => {
    const r = el.getBoundingClientRect();
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '';
    return {
      name: el.tagName.toLowerCase() + (cls ? '.' + cls : ''),
      opacity: Number(eff(el).toFixed(3)),
      top: Math.round(r.top + scrollY), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height),
      inView: r.bottom > 0 && r.top < innerHeight && r.width > 0,
      transform: getComputedStyle(el).transform,
    };
  });
}

/** Important content in the first viewport that is (still) invisible. */
function probeFirstPaint() {
  const sel = 'h1, h2, .ds-button-primary, [class*="button-primary"], [class*="btn-primary"]';
  const out = [];
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= innerHeight || r.width === 0) continue;
    let o = 1;
    for (let a = el; a; a = a.parentElement) o *= Number(getComputedStyle(a).opacity);
    if (o < 0.1) out.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 40)}" opacity ${o.toFixed(2)}`);
  }
  return out;
}

/** Visible text blocks in the viewport whose boxes overlap by more than minArea px.
 *  A pair only counts when both are hit-testable at the overlap's centre and no
 *  other painted box sits between them (so a clipped or covered layer of a
 *  pinned story is not reported as a collision). */
function probeOverlap(minArea) {
  const blocks = [...document.querySelectorAll('h1, h2, h3, p')].filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.bottom <= 0 || r.top >= innerHeight || !el.textContent.trim()) return false;
    let o = 1;
    for (let a = el; a; a = a.parentElement) o *= Number(getComputedStyle(a).opacity);
    return o > 0.5;
  });
  const opaque = (el) => {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    return m && (m.length < 4 || Number(m[3]) > 0.9) && !/^rgba\(0, 0, 0, 0\)$/.test(getComputedStyle(el).backgroundColor);
  };
  const hits = [];
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i]; const b = blocks[j];
      if (a.contains(b) || b.contains(a)) continue;
      const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect();
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (w <= 0 || h <= 0 || w * h <= minArea) continue;
      const stack = document.elementsFromPoint(Math.max(ra.left, rb.left) + w / 2, Math.max(ra.top, rb.top) + h / 2);
      const ia = stack.findIndex((e) => a.contains(e)); const ib = stack.findIndex((e) => b.contains(e));
      if (ia < 0 || ib < 0) continue; // one of them is clipped away or off the hit-test path
      const between = stack.slice(Math.min(ia, ib) + 1, Math.max(ia, ib));
      if (between.some((e) => !e.contains(a) && !e.contains(b) && opaque(e))) continue; // covered
      hits.push(`"${a.textContent.trim().slice(0, 30)}" x "${b.textContent.trim().slice(0, 30)}" (${Math.round(w * h)}px2)`);
    }
  }
  return hits;
}

/** readyState / currentTime / paused for every video, plus whether it carries a scrub marker. */
function probeVideos() {
  return [...document.querySelectorAll('video')].map((v) => ({
    readyState: v.readyState, currentTime: Number(v.currentTime.toFixed(3)), paused: v.paused,
    scrubMarker: v.hasAttribute('data-f0-video-scrub'),
  }));
}

// ---------------------------------------------------------------------------
// One run: one viewport, one reduced-motion setting.
// ---------------------------------------------------------------------------

const OPACITY_TOL = 0.05;
const RECT_TOL = 2;
const OVERLAP_MIN_AREA = 400;

async function settle(page, ms) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  if (ms) await page.waitForTimeout(ms);
}

async function scrollToY(page, y, ms) {
  await page.evaluate((top) => window.scrollTo({ top, left: 0, behavior: 'instant' }), y);
  await settle(page, ms);
}

async function runOnce(browser, url, viewport, reduce, opts, outDir) {
  const label = `${viewport.width}x${viewport.height}-${reduce ? 'reduce' : 'motion'}`;
  const context = await browser.newContext({ viewport, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 160)} ${m.location()?.url || ''}`.trim()); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${String(e.message || e).slice(0, 200)}`));
  page.on('requestfailed', (r) => {
    const why = r.failure()?.errorText || '?';
    // Media elements cancel and re-issue range requests as they buffer; an abort there is normal.
    if (/ERR_ABORTED/.test(why) && ['media', 'fetch'].includes(r.resourceType())) return;
    errors.push(`request failed: ${r.url()} (${why})`);
  });
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });

  const run = { label, viewport, reducedMotion: reduce, warnings: [], notes: [], screenshots: [] };
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await settle(page, 1200); // let load-time intros finish before judging first paint

  const shot = async (name) => {
    const file = path.join(outDir, `${label}-${name}.png`);
    await page.screenshot({ path: file });
    run.screenshots.push(file);
  };

  // Fonts, overflow, first paint.
  run.fonts = await page.evaluate(probeFonts);
  for (const f of run.fonts.failed) run.warnings.push(`font failed to load: ${f.family} ${f.weight}`);
  for (const u of run.fonts.used) if (!u.loaded) run.warnings.push(`${u.selector} renders in "${u.family}", which is not a loaded face (fallback font showing)`);
  run.overflow = await page.evaluate(probeOverflow);
  if (run.overflow.overflow > 1) run.warnings.push(`horizontal overflow ${run.overflow.overflow}px; offenders: ${run.overflow.offenders.join(', ') || 'none found unclipped'}`);
  run.firstPaint = await page.evaluate(probeFirstPaint);
  for (const f of run.firstPaint) run.warnings.push(`first viewport content invisible after load: ${f} (fine if a scroll story reveals it later; otherwise a from-state or the import left it hidden)`);

  // Scroll down and back up, sampling at the same positions both ways.
  const track = opts.track || DEFAULT_TRACK;
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const positions = Array.from({ length: opts.steps + 1 }, (_, i) => Math.round((max * i) / opts.steps));
  const down = []; const up = []; const videoDown = []; const videoUp = []; const overlaps = new Set();
  for (const [i, y] of positions.entries()) {
    await scrollToY(page, y, opts.settle);
    down.push(await page.evaluate(probeSample, track));
    videoDown.push(await page.evaluate(probeVideos));
    for (const hit of await page.evaluate(probeOverlap, OVERLAP_MIN_AREA)) overlaps.add(hit);
    if (i === 0) await shot('down-000');
    if (i === Math.round(opts.steps / 2)) await shot('down-050');
    if (i === opts.steps) await shot('down-100');
  }
  for (const y of [...positions].reverse()) {
    await scrollToY(page, y, opts.settle);
    up.unshift(await page.evaluate(probeSample, track));
    videoUp.unshift(await page.evaluate(probeVideos));
  }
  await shot('up-000');

  // A mismatch is only judged where the element is on screen in either pass.
  // Down partly faded / up fully shown is a play-once reveal caught mid-tween
  // on the way down (not reversed by design): a note. Anything else - hidden
  // on the way up, a different position, a stale start - is a warning.
  const mismatches = []; const onceReveals = [];
  positions.forEach((y, i) => {
    const a = down[i]; const b = up[i];
    for (let k = 0; k < Math.min(a.length, b.length); k++) {
      if (!a[k].inView && !b[k].inView) continue;
      const dOp = Math.abs(a[k].opacity - b[k].opacity);
      const dRect = Math.max(...['top', 'left', 'width', 'height'].map((p) => Math.abs(a[k][p] - b[k][p])));
      if (dOp <= OPACITY_TOL && dRect <= RECT_TOL) continue;
      const entry = { scrollY: y, element: `#${k} ${a[k].name}`, down: a[k], up: b[k] };
      if (b[k].opacity >= 0.99 && a[k].opacity < b[k].opacity) onceReveals.push(entry);
      else mismatches.push(entry);
    }
  });
  run.scrollMismatches = mismatches;
  run.onceReveals = onceReveals;
  if (mismatches.length) {
    const first = mismatches[0];
    run.warnings.push(`${mismatches.length} down/up mismatch(es); first at scrollY ${first.scrollY}: ${first.element} opacity ${first.down.opacity} -> ${first.up.opacity}, top ${first.down.top} -> ${first.up.top}, transform ${first.down.transform} -> ${first.up.transform}`
      + ' (with scrub smoothing, scrub: <seconds>, rerun with --settle above that lag before trusting this)');
  }
  if (onceReveals.length) {
    const names = [...new Set(onceReveals.map((m) => m.element))];
    run.notes.push(`${names.length} element(s) still revealing on the way down but settled on the way up (play-once reveals, or raise --settle): ${names.slice(0, 6).join(', ')}`);
  }

  // Every tracked element should be fully visible at some point while in view
  // (either pass, so a reveal that simply had not finished on the way down counts).
  const neverVisible = [];
  const count = Math.min(...down.map((s) => s.length));
  for (let k = 0; k < count; k++) {
    const seen = [...down, ...up].filter((s) => s[k] && s[k].inView);
    if (seen.length && Math.max(...seen.map((s) => s[k].opacity)) < 0.9) neverVisible.push(k);
  }
  run.neverVisible = neverVisible;
  if (neverVisible.length) run.warnings.push(`tracked element(s) ${neverVisible.map((k) => `#${k} ${down[0][k].name}`).join(', ')} never reached opacity 0.9 while in view (reveal stuck or ends mid-tween)`);

  run.overlaps = [...overlaps].slice(0, 20);
  for (const o of run.overlaps) run.warnings.push(`text blocks overlap: ${o}`);

  // Media scrub: currentTime must follow scroll in both directions.
  const videoCount = videoDown[0]?.length || 0;
  run.media = [];
  for (let v = 0; v < videoCount; v++) {
    const d = videoDown.map((s) => s[v]); const u = videoUp.map((s) => s[v]);
    const moved = new Set(d.map((s) => s.currentTime)).size > 1;
    const playing = d.some((s) => !s.paused);
    const backwards = d.some((s, i) => i && s.currentTime < d[i - 1].currentTime - 0.05);
    const forwardsUp = u.some((s, i) => i && s.currentTime < u[i - 1].currentTime - 0.05); // up[] is in position order
    const entry = { index: v, scrubMarker: d[0].scrubMarker, maxReadyState: Math.max(...d.map((s) => s.readyState)), moved, playing };
    run.media.push(entry);
    if (playing) continue; // autoplay video: not a scrub, nothing to compare
    if (moved && (backwards || forwardsUp)) run.warnings.push(`video ${v}: currentTime is not monotonic with scroll (${backwards ? 'down' : 'up'} pass)`);
    if (d[0].scrubMarker && !moved) {
      const msg = `video ${v}: has data-f0-video-scrub but currentTime never moved`;
      if (opts.f0) run.warnings.push(msg); else run.notes.push(`${msg} (expected on the raw file without a local stand-in)`);
    }
    if (entry.maxReadyState < 2) run.warnings.push(`video ${v}: never reached readyState 2 (no frame decoded)`);
  }

  // Reduced motion: content visible at rest, nothing moving between two samples.
  if (reduce) {
    const restIssues = [];
    for (const y of [0, positions[Math.round(opts.steps / 2)], max]) {
      await scrollToY(page, y, 300);
      const a = await page.evaluate(probeSample, track);
      await page.waitForTimeout(500);
      const b = await page.evaluate(probeSample, track);
      a.forEach((s, k) => {
        if (!b[k]) return;
        if (s.inView && s.opacity < 0.1) restIssues.push(`scrollY ${y}: #${k} ${s.name} hidden at rest`);
        if (Math.abs(s.opacity - b[k].opacity) > OPACITY_TOL || s.transform !== b[k].transform || Math.abs(s.top - b[k].top) > RECT_TOL) {
          restIssues.push(`scrollY ${y}: #${k} ${s.name} still animating`);
        }
      });
    }
    run.restIssues = restIssues;
    for (const r of restIssues) {
      if (opts.f0 && /animating/.test(r)) run.notes.push(`${r} (imported GSAP is not gated by reduced motion in f0 unless a native media scope was used)`);
      else run.warnings.push(r);
    }
  }

  // The browser asks for /favicon.ico on its own; a page that never links one is not broken.
  run.errors = errors.filter((e) => !/\/favicon\.ico\b/.test(e));
  for (const e of run.errors.slice(0, 20)) run.warnings.push(e);
  await context.close();
  return run;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const opts = parseArgs(process.argv.slice(2));
if (!opts.target) {
  console.error('usage: verify-in-browser.mjs <file-or-url> [--track .a,.b] [--steps 30] [--settle 100] [--out dir] [--channel chrome] [--f0]');
  process.exit(1);
}

const chromium = await loadChromium();
if (!chromium) {
  console.error('f0 browser verify: Playwright is not available. Install playwright-core (npm i -D playwright-core) '
    + 'or follow references/browser-verify.md by hand. F0_PLAYWRIGHT_CORE=<path to playwright-core index.mjs> also works.');
  process.exit(1);
}

let server = null;
let url = opts.target;
if (!/^https?:\/\//i.test(opts.target)) {
  const file = path.resolve(opts.target);
  if (!fs.existsSync(file)) {
    console.error(`f0 browser verify: no such file ${file}`);
    process.exit(1);
  }
  server = await serveDirectory(path.dirname(file));
  url = `http://127.0.0.1:${server.address().port}/${encodeURIComponent(path.basename(file))}`;
}

const outDir = path.resolve(opts.out || 'browser-verify');
fs.mkdirSync(outDir, { recursive: true });

const report = { target: opts.target, url, authoritativeForMotion: opts.f0, runs: [] };
let browser;
try {
  browser = await chromium.launch(opts.channel ? { channel: opts.channel } : {});
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    for (const reduce of [false, true]) {
      report.runs.push(await runOnce(browser, url, viewport, reduce, opts, outDir));
    }
  }
} catch (error) {
  console.error(`f0 browser verify could not run: ${(error && error.message) || error}`);
  if (browser) await browser.close();
  if (server) server.close();
  process.exit(1);
}
await browser.close();
if (server) server.close();

const reportFile = path.join(outDir, 'report.json');
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

let warningCount = 0;
for (const run of report.runs) {
  warningCount += run.warnings.length;
  console.log(`${run.label}: ${run.warnings.length} warning(s), ${run.notes.length} note(s)`);
  for (const w of run.warnings) console.log(`  - ${w}`);
  for (const n of run.notes) console.log(`  . ${n}`);
}
if (!opts.f0) console.log('Raw file run: plain GSAP, native payloads and scrub markers inert. Re-run with --f0 on the f0 Preview URL for motion.');
console.log(`Report: ${reportFile}`);
process.exit(warningCount ? 2 : 0);
