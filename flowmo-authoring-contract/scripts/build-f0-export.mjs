#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { crossPageMotionWarnings, lintHiddenAssetRefs } from './handoff-lint.mjs';

/**
 * Package a finished handoff into per-page folders the client can drag
 * straight onto f0's "Recreate from HTML" drop zone (`HtmlDropModal.tsx`) in
 * one motion — the page's HTML plus only the local media files it actually
 * references, named so f0's own basename matcher
 * (`src/utils/importWebsite/droppedAssets.ts`) resolves every one of them
 * automatically. No manual Asset Browser uploads, no separate media pass.
 *
 * This mirrors that matcher's real rules (same extension set, same
 * basename-only / lowercase / absolute-URL-skips matching, including CSS
 * `url(...)` refs inside `style="..."`/`<style>` and referenced `.css` files
 * themselves) rather than inventing a parallel convention — a mismatch here
 * is exactly the kind of "missing" badge this script exists to catch before
 * delivery, not after.
 *
 * `HtmlDropModal` now also accepts the WHOLE `f0-export/` folder (or a
 * `.zip` of it) dropped/picked in one motion — f0 groups it back into one
 * page per subfolder automatically (`src/utils/importWebsite/
 * bundleIntake.ts`). Dropping one page's subfolder still works too.
 *
 * An asset referenced by 2+ pages (a shared hero video, a shared
 * design-system.css) is written ONCE into a top-level `_shared/` folder
 * instead of being copied into every page folder that references it — f0's
 * own basename-only matching (`bundleIntake.ts`'s `groupIntoPages`, which
 * folds `_shared/` into every page's own asset pool) needs no HTML/CSS
 * rewriting for this to resolve. This only works when the WHOLE folder (or
 * its zip) is dropped together — a page folder dropped alone won't see
 * `_shared/`, so anything it needs from there shows as missing.
 *
 * A `.zip` of the output (`<out>.zip`, alongside the folder) is produced on
 * every run — no separate manual zip step.
 *
 * Usage:
 *   node build-f0-export.mjs [projectDir] \
 *     [--pages a.html,b.html] [--assets dir1,dir2] \
 *     [--design DESIGN.md] [--out f0-export] [--allow-missing]
 *
 * Defaults: projectDir = cwd; pages = every *.html/*.htm found anywhere
 * under projectDir (recursive - covers both a flat `page.html` per route
 * AND a static-export `route/index.html` per route shape), except inside
 * SKIP_DIR_NAMES and the output folder itself; assets = projectDir itself,
 * walked recursively; design = DESIGN.md at projectDir root if present;
 * out = <projectDir>/f0-export.
 *
 * Output folder naming mirrors the source layout rather than flattening it,
 * since that is what makes slugs collision-free without any renaming
 * scheme: a plain `about.html` becomes `about/`; a `contact/index.html`
 * becomes `contact/` (the parent folder's name, since `index` itself says
 * nothing); the project root's own `index.html` becomes `home/`; a nested
 * `articles/some-post/index.html` becomes `articles/some-post/` - f0's
 * bundle importer groups by each file's immediate parent directory
 * regardless of nesting depth, so preserving the real path costs nothing.
 */

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/i;
const FONT_EXT = /\.(woff2?|ttf|otf|eot)$/i;
const CSS_EXT = /\.css$/i;
const JS_EXT = /\.m?js$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)$/i;
const ASSET_EXT = new RegExp(
  `${IMAGE_EXT.source}|${FONT_EXT.source}|${CSS_EXT.source}|${JS_EXT.source}|${VIDEO_EXT.source}`,
  'i',
);

// Used when WALKING FOR ASSETS: real media can legitimately live under any of
// these except the ones that are never final-build output (wireframes have no
// CSS/media per the authoring contract; f0-export is this script's own prior
// output). Deliberately does NOT include `reference/` - a `reference/fonts/`
// or `reference/css/` can hold real files a final page's CSS still needs.
const SKIP_DIR_NAMES = new Set(['node_modules', '.git', 'wireframes', 'f0-export']);

// Used when WALKING FOR PAGES: additionally skips `reference/`, since that
// convention holds raw scraped/"as served" source captures, not final build
// output - a page found there would be a near-duplicate of the real one and
// should never be exported as if it were a route.
const SKIP_PAGE_DIR_NAMES = new Set([...SKIP_DIR_NAMES, 'reference']);

// Hidden folders are never walked either: agent tooling keeps whole copies of
// the project there (`.claude/worktrees/<name>/` is a full git worktree), and
// with first-match-wins basename resolution an OLDER `design-system.css` from
// such a copy was bundled in place of the real one (found on a real handoff:
// the newest CSS rules were missing after import).
const isHiddenDir = (name) => name.startsWith('.');

function parseArgs(argv) {
  const opts = { pages: null, assets: null, design: null, out: null, allowMissing: false, projectDir: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--pages') opts.pages = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg === '--assets') opts.assets = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg === '--design') opts.design = argv[++i];
    else if (arg === '--out') opts.out = argv[++i];
    else if (arg === '--allow-missing') opts.allowMissing = true;
    else rest.push(arg);
  }
  if (rest.length) opts.projectDir = rest[0];
  return opts;
}

function isAbsoluteRef(ref) {
  return /^(https?:)?\/\//i.test(ref) || ref.startsWith('data:') || ref.startsWith('mailto:')
    || ref.startsWith('tel:') || ref.startsWith('#') || ref.startsWith('javascript:');
}

function basenameOf(ref) {
  const clean = ref.split(/[?#]/)[0];
  const last = clean.split('/').pop() || clean;
  return last.toLowerCase();
}

/** Filters+shapes a batch of raw url/src/href strings into refs, applying
 *  the one rule every ref extractor below shares: skip absolute/data/etc.
 *  refs, skip anything without a recognized asset extension. */
function refsFromRawUrls(rawUrls) {
  const refs = [];
  for (const ref of new Set(rawUrls)) {
    if (isAbsoluteRef(ref)) continue;
    const base = basenameOf(ref);
    if (!ASSET_EXT.test(base)) continue;
    refs.push({ raw: ref, basename: base });
  }
  return refs;
}

/** Every local asset ref the handoff HTML actually makes - same shape f0's own matcher looks for. */
function extractRefs(html) {
  const raw = [];
  const attrPattern = /\b(?:src|href|poster|data|srcset)\s*=\s*(["'])(.*?)\1/gi;
  let match;
  while ((match = attrPattern.exec(html))) {
    const value = match[2];
    if (!value) continue;
    // srcset is a comma-separated "url descriptor" list.
    for (const entry of value.split(',')) {
      const url = entry.trim().split(/\s+/)[0];
      if (url) raw.push(url);
    }
  }
  const urlPattern = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
  while ((match = urlPattern.exec(html))) {
    if (match[2]) raw.push(match[2].trim());
  }
  return refsFromRawUrls(raw);
}

/** Every `id`/`class` attribute value found in a page's HTML - enough to
 *  approximate whether a CSS selector could match something on THIS page.
 *  Same DOM-free, regex-based approach as this skill's own
 *  validate-handoff.mjs's `collectDomSignatures` (a real parser buys nothing
 *  extra for a relevance filter that only needs to avoid false negatives on
 *  the ordinary case - a rule this can't confidently read is treated as
 *  relevant, never silently dropped). */
function collectDomSignatures(html) {
  const ids = new Set();
  const classes = new Set();
  const withoutScripts = html.replace(/<script\b[\s\S]*?<\/script\s*>/gi, '');
  for (const tag of withoutScripts.matchAll(/<[a-z][^>]*>/gi)) {
    for (const attribute of tag[0].matchAll(/\b([:\w-]+)(?:\s*=\s*(["'])(.*?)\2)?/g)) {
      const name = attribute[1].toLowerCase();
      const value = attribute[3] ?? '';
      if (name === 'id' && value) ids.add(value);
      if (name === 'class') for (const c of value.split(/\s+/).filter(Boolean)) classes.add(c);
    }
  }
  return { ids, classes };
}

/** Whether a (possibly comma-separated) CSS selector could match something
 *  on this page. A branch with no id/class token at all (a bare tag, `*`,
 *  `:root`, a pseudo-class-only selector, ...) is global by construction and
 *  always counts as relevant - same conservative fallback the selector
 *  check in validate-handoff.mjs uses, so an unreadable selector never
 *  silently drops a real asset. */
function selectorRelevant(selectorText, dom) {
  return selectorText.split(',').some((branch) => {
    const ids = [...branch.matchAll(/#([\w-]+)/g)].map((m) => m[1]);
    const classes = [...branch.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
    if (!ids.length && !classes.length) return true;
    return ids.every((id) => dom.ids.has(id)) && classes.every((c) => dom.classes.has(c));
  });
}

/** Splits CSS text into top-level `{selectorText, body}` blocks, brace-depth
 *  aware so it works correctly on minified/single-line CSS (real-world
 *  builder output, never pretty-printed). `selectorText` for an at-rule is
 *  the whole `@media (...)` / `@font-face` / etc. header. */
function splitCssBlocks(cssText) {
  const blocks = [];
  let i = 0;
  const n = cssText.length;
  while (i < n) {
    while (i < n && /\s/.test(cssText[i])) i++;
    if (i >= n) break;
    const selStart = i;
    while (i < n && cssText[i] !== '{' && cssText[i] !== '}') i++;
    if (i >= n) break;
    if (cssText[i] === '}') { i++; continue; }
    const selectorText = cssText.slice(selStart, i).trim();
    i++;
    const bodyStart = i;
    let depth = 1;
    while (i < n && depth > 0) {
      if (cssText[i] === '{') depth++;
      else if (cssText[i] === '}') depth--;
      i++;
    }
    const body = cssText.slice(bodyStart, i - 1);
    if (selectorText) blocks.push({ selectorText, body });
  }
  return blocks;
}

// `@media`/`@supports`/`@layer`/`@container` wrap ordinary selector rules -
// recurse into them rather than treating the wrapper itself as a selector.
const RECURSE_AT_RULES = /^@(media|supports|layer|container)\b/i;
// Any OTHER at-rule (`@font-face`, `@keyframes`, `@page`, `@property`, ...)
// is global/non-page-scoped by nature - always include its refs rather than
// trying to match a keyframe percentage or a font weight against the DOM.
const GLOBAL_AT_RULE = /^@/;

/** Every local asset ref inside CSS text that could actually apply to THIS
 *  page. This is the fix for the over-inclusion a flat "every url() in any
 *  linked stylesheet" scan causes on a real shared, whole-site stylesheet:
 *  a rule only counts if it's global (`@font-face`, `:root`, a bare-tag
 *  selector, ...) or its selector matches an id/class this page's HTML
 *  actually has. Recurses into `@media`/`@supports` so a responsive-only
 *  rule for a relevant selector still counts. */
// Comments go first: splitCssBlocks takes everything before a `{` as the
// selector, so a header comment glued onto the first rule (`/* see
// DESIGN.md */ @font-face`) made it a non-@ "selector" whose fake `.md` class
// matched nothing - and the font that rule loads was silently left out.
const stripCssComments = (cssText) => cssText.replace(/\/\*[\s\S]*?\*\//g, ' ');

function extractRelevantCssRefs(cssText, dom) {
  cssText = stripCssComments(cssText);
  const raw = [];
  const walk = (text) => {
    for (const block of splitCssBlocks(text)) {
      if (RECURSE_AT_RULES.test(block.selectorText)) { walk(block.body); continue; }
      const relevant = GLOBAL_AT_RULE.test(block.selectorText) || selectorRelevant(block.selectorText, dom);
      if (!relevant) continue;
      for (const m of block.body.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
        if (m[2]) raw.push(m[2].trim());
      }
    }
  };
  walk(cssText);
  return refsFromRawUrls(raw);
}

/** One ref, rewritten to its flat basename IF it was actually bundled for
 *  this page - absolute refs and anything not in `resolvedBasenames`
 *  (missing, or filtered out as not relevant) pass through completely
 *  unchanged. This is the one rule every rewrite below shares, so a ref
 *  extraction and its rewrite can never disagree on what counts. */
function rewriteOneRef(ref, resolvedBasenames) {
  if (!ref || isAbsoluteRef(ref)) return ref;
  const base = basenameOf(ref);
  if (!ASSET_EXT.test(base) || !resolvedBasenames.has(base)) return ref;
  return base;
}

/** Rewrites every bundled local ref in a page's HTML to its flat basename -
 *  the exact same attribute/`url()` surface `extractRefs` reads, so nothing
 *  this script bundles is left pointing at a path that no longer exists once
 *  the folder is flat. `srcset`'s per-entry size/density descriptor (`1x`,
 *  `480w`, ...) is preserved; only the URL token of each comma-separated
 *  entry is rewritten. Everything not in `resolvedBasenames` - an absolute
 *  URL, a ref this run couldn't resolve - passes through untouched. */
function rewriteHtmlRefs(html, resolvedBasenames) {
  let out = html.replace(
    /\b(src|href|poster|data|srcset)(\s*=\s*)(["'])(.*?)\3/gi,
    (full, attr, eq, quote, value) => {
      if (!value) return full;
      if (attr.toLowerCase() === 'srcset') {
        const rewritten = value.split(',').map((entry) => {
          const trimmed = entry.trim();
          if (!trimmed) return trimmed;
          const [url, ...descriptor] = trimmed.split(/\s+/);
          return [rewriteOneRef(url, resolvedBasenames), ...descriptor].join(' ');
        }).join(', ');
        return `${attr}${eq}${quote}${rewritten}${quote}`;
      }
      return `${attr}${eq}${quote}${rewriteOneRef(value, resolvedBasenames)}${quote}`;
    },
  );
  out = out.replace(
    /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi,
    (full, quote, raw) => `url(${quote}${rewriteOneRef(raw.trim(), resolvedBasenames)}${quote})`,
  );
  return out;
}

/** Same rewrite, scoped to CSS text: a bundled stylesheet's OWN `url(...)`
 *  refs (fonts, background images) are relative to ITS original location,
 *  not the page's - copying the file verbatim after flattening would leave
 *  those pointing one level too high. Nothing else in CSS syntax carries a
 *  local-file ref. */
function rewriteCssRefs(cssText, resolvedBasenames) {
  return cssText.replace(
    /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi,
    (full, quote, raw) => `url(${quote}${rewriteOneRef(raw.trim(), resolvedBasenames)}${quote})`,
  );
}

/** basename (lowercase) -> absolute path. First match wins; later duplicates are reported. */
function buildAssetIndex(roots) {
  const index = new Map();
  const ambiguous = [];
  const walk = (dir) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const entry of entries) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      if (entry.isDirectory() && isHiddenDir(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!ASSET_EXT.test(entry.name)) continue;
      const key = entry.name.toLowerCase();
      if (index.has(key) && index.get(key) !== full) ambiguous.push({ basename: key, kept: index.get(key), skipped: full });
      else if (!index.has(key)) index.set(key, full);
    }
  };
  for (const root of roots) walk(root);
  return { index, ambiguous };
}

/** Every `.html`/`.htm` file under `dir`, skipping SKIP_DIR_NAMES and
 *  `skipAbsolute` (the resolved output folder, so a rerun never re-ingests
 *  its own prior output). Covers both a flat `page.html` per route and a
 *  static-export `route/index.html` per route in one pass. */
function findHtmlFiles(dir, skipAbsolute) {
  const out = [];
  const walk = (current) => {
    if (current === skipAbsolute) return;
    let entries;
    try { entries = fs.readdirSync(current, { withFileTypes: true }); }
    catch { return; }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_PAGE_DIR_NAMES.has(entry.name) || isHiddenDir(entry.name) || full === skipAbsolute) continue;
        walk(full);
      } else if (/\.html?$/i.test(entry.name)) {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out;
}

/** Where a page's export folder lives, relative to `outDir` - see the module
 *  doc comment above for the naming rule and why it can't collide. */
function slugFor(pagePath, projectDir) {
  const rel = path.relative(projectDir, pagePath);
  const dir = path.dirname(rel);
  const base = path.basename(pagePath).replace(/\.html?$/i, '');
  if (base.toLowerCase() === 'index') return dir === '.' ? 'home' : dir;
  return dir === '.' ? base : path.join(dir, base);
}

// ─── Zip writer ──────────────────────────────────────────────────────────
// This script has zero npm dependencies by design (a portable, standalone
// skill script - see PACKAGE_FORMAT.md), which rules out `jszip` here even
// though the main f0 repo already depends on it elsewhere. What follows is a
// minimal but standard-compliant ZIP writer (local file headers + DEFLATE
// data + central directory + end-of-central-directory record, per the PKZIP
// APPNOTE format) built only on `node:fs`/`node:zlib` - any zip tool
// (Finder, Explorer, `unzip`) can open the result.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** DOS date/time bit-packing (the timestamp format every zip entry carries). */
function dosDateTime(date) {
  const time = ((date.getHours() & 0x1f) << 11) | ((date.getMinutes() & 0x3f) << 5) | ((Math.floor(date.getSeconds() / 2)) & 0x1f);
  const dosDate = (((date.getFullYear() - 1980) & 0x7f) << 9) | (((date.getMonth() + 1) & 0xf) << 5) | (date.getDate() & 0x1f);
  return { time, dosDate };
}

/** Every file under `dir`, recursive, as `{absPath, relPath}` with
 *  forward-slash relative paths (the zip-standard separator regardless of
 *  host OS) in a stable (sorted) order, so two runs over the same content
 *  produce byte-identical archives. */
function listFilesRecursively(dir, base = dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursively(full, base));
    else out.push({ absPath: full, relPath: path.relative(base, full).split(path.sep).join('/') });
  }
  return out;
}

// General-purpose bit 11 (0x0800): "filename/comment are UTF-8" - without it,
// a zip tool falls back to a legacy code page and can garble a non-ASCII
// filename (a real case here: Hebrew asset names survive intact today only
// because of this flag).
const GPBF_UTF8 = 0x0800;

/** Zips `sourceDir` into `zipPath`. See the module comment above this
 *  section for why this is hand-rolled instead of a dependency. */
function writeZipSync(sourceDir, zipPath) {
  const files = listFilesRecursively(sourceDir);
  const { time, dosDate } = dosDateTime(new Date());
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const { absPath, relPath } of files) {
    const data = fs.readFileSync(absPath);
    const crc = crc32(data);
    const compressed = zlib.deflateRawSync(data);
    const method = compressed.length < data.length ? 8 : 0; // 8 = deflate, 0 = store
    const payload = method === 8 ? compressed : data;
    const nameBuf = Buffer.from(relPath, 'utf8');

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(GPBF_UTF8, 6);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(payload.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localChunks.push(localHeader, nameBuf, payload);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(GPBF_UTF8, 8);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(payload.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38); // external attrs: regular file, rw-r--r--
    centralHeader.writeUInt32LE(offset, 42);
    centralChunks.push(centralHeader, nameBuf);

    offset += localHeader.length + nameBuf.length + payload.length;
  }

  const centralDirStart = offset;
  const centralDirBuf = Buffer.concat(centralChunks);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirBuf.length, 12);
  eocd.writeUInt32LE(centralDirStart, 16);
  eocd.writeUInt16LE(0, 20);

  fs.writeFileSync(zipPath, Buffer.concat([...localChunks, centralDirBuf, eocd]));
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const projectDir = path.resolve(opts.projectDir || process.cwd());
  const outDir = path.resolve(projectDir, opts.out || 'f0-export');

  const pageFiles = opts.pages
    ? opts.pages.map((p) => path.resolve(projectDir, p))
    : findHtmlFiles(projectDir, outDir);

  if (!pageFiles.length) {
    console.error(`f0 export: no .html pages found in ${projectDir} (pass --pages to be explicit)`);
    process.exit(1);
  }

  const slugs = new Map(pageFiles.map((p) => [p, slugFor(p, projectDir)]));
  const bySlug = new Map();
  for (const [pagePath, slug] of slugs) {
    if (bySlug.has(slug)) {
      console.error(
        `f0 export: two pages both resolve to export folder "${slug}/":\n`
        + `  ${bySlug.get(slug)}\n  ${pagePath}\n`
        + 'Pass --pages explicitly to disambiguate, or rename one file.',
      );
      process.exit(1);
    }
    bySlug.set(slug, pagePath);
  }

  const assetRoots = (opts.assets ? opts.assets.map((a) => path.resolve(projectDir, a)) : [projectDir]);
  const { index: assetIndex, ambiguous } = buildAssetIndex(assetRoots);

  const designPath = opts.design
    ? path.resolve(projectDir, opts.design)
    : (fs.existsSync(path.join(projectDir, 'DESIGN.md')) ? path.join(projectDir, 'DESIGN.md') : null);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  if (designPath) fs.copyFileSync(designPath, path.join(outDir, 'DESIGN.md'));

  // Pass 1: resolve every page's refs (no writes yet) - the write pass below
  // needs to know, for EVERY page at once, how many distinct pages need each
  // basename, so it can decide `_shared/` vs. that page's own folder before
  // it copies anything.
  const pagePlans = [];
  for (const pagePath of pageFiles) {
    const pageName = path.basename(pagePath);
    const pageSlug = slugs.get(pagePath);
    const html = fs.readFileSync(pagePath, 'utf8');

    // Refs found directly in the page's own HTML, plus (transitively) refs
    // found inside any of ITS bundled `.css` files - a linked stylesheet
    // like design-system.css can reference further local files
    // (`@font-face src url(...)`) that never appear in the page's own HTML
    // text at all, so scanning only the page misses them. The CSS half is
    // RELEVANCE-FILTERED (extractRelevantCssRefs), not a flat scan: a
    // shared, whole-site stylesheet's per-page hero/section rules only
    // count for a page whose HTML actually has the matching class/id -
    // without this, every page sharing one stylesheet inherits every OTHER
    // page's images too (confirmed on a real site: a text-only page picked
    // up a dozen unrelated hero backgrounds this way).
    const dom = collectDomSignatures(html);
    const byBasename = new Map();
    const queue = extractRefs(html);
    const scannedCss = new Set();
    while (queue.length) {
      const ref = queue.shift();
      if (byBasename.has(ref.basename)) continue;
      byBasename.set(ref.basename, ref);
      if (CSS_EXT.test(ref.basename) && !scannedCss.has(ref.basename)) {
        scannedCss.add(ref.basename);
        const source = assetIndex.get(ref.basename);
        if (source) queue.push(...extractRelevantCssRefs(fs.readFileSync(source, 'utf8'), dom));
      }
    }
    const resolved = [];
    const missing = [];
    for (const [basename, ref] of byBasename) {
      if (assetIndex.get(basename)) resolved.push(basename);
      else missing.push(ref);
    }
    pagePlans.push({ pageName, pageSlug, html, resolved, missing });
  }

  // A basename referenced by 2+ pages goes to `_shared/` once instead of
  // being physically duplicated into every one of those page folders - see
  // the module doc comment above. `assetIndex` already maps each basename to
  // exactly one canonical source file, so "referenced by 2+ pages" already
  // unambiguously means the same bytes twice; no separate content hash is
  // needed to tell them apart.
  const refCounts = new Map();
  for (const plan of pagePlans) {
    for (const basename of plan.resolved) refCounts.set(basename, (refCounts.get(basename) ?? 0) + 1);
  }
  const sharedBasenames = new Set([...refCounts].filter(([, n]) => n >= 2).map(([b]) => b));
  // The union of every page's own resolved set - used ONLY when rewriting a
  // SHARED css file's internal url()s (see below), since that file is
  // written once but must still carry every ref any of the pages sharing it
  // needs, not just whichever page happens to write it first.
  const allResolvedBasenames = new Set(pagePlans.flatMap((p) => p.resolved));
  if (sharedBasenames.size) fs.mkdirSync(path.join(outDir, '_shared'), { recursive: true });

  // Pass 2: write files now that every page's shared-vs-own basenames are
  // known. A CSS file's OWN internal `url(...)`s get rewritten too (see
  // rewriteCssRefs), not just copied verbatim, since they're relative to its
  // original location and would otherwise point one level too high once
  // flattened alongside the page. Everything else (images, fonts, JS) has no
  // internal local-file refs to rewrite, so a plain copy is correct for
  // those.
  const pageReports = [];
  let anyMissing = false;
  const writtenShared = new Set();

  for (const plan of pagePlans) {
    const { pageName, pageSlug, html, resolved, missing } = plan;
    const pageOutDir = path.join(outDir, pageSlug);
    fs.mkdirSync(pageOutDir, { recursive: true });
    const resolvedBasenames = new Set(resolved);

    for (const basename of resolved) {
      const source = assetIndex.get(basename);
      const shared = sharedBasenames.has(basename);
      if (shared && writtenShared.has(basename)) continue;
      const destPath = path.join(shared ? path.join(outDir, '_shared') : pageOutDir, basename);
      if (CSS_EXT.test(basename)) {
        const scope = shared ? allResolvedBasenames : resolvedBasenames;
        fs.writeFileSync(destPath, rewriteCssRefs(fs.readFileSync(source, 'utf8'), scope));
      } else {
        fs.copyFileSync(source, destPath);
      }
      if (shared) writtenShared.add(basename);
    }
    fs.writeFileSync(path.join(pageOutDir, pageName), rewriteHtmlRefs(html, resolvedBasenames));

    if (missing.length) anyMissing = true;
    pageReports.push({ pageName, pageSlug, resolved: resolved.length, missing });
  }

  const readmeLines = [
    '# f0 import',
    '',
    designPath
      ? '1. Drop `DESIGN.md` (this folder) into f0 once to import the design system.'
      : '1. (No DESIGN.md in this handoff — skip straight to page import.)',
    `2. Drag the generated \`${path.basename(outDir)}.zip\` (or this whole`,
    '   folder) onto f0\'s "Recreate from HTML" drop zone in one motion — f0',
    '   groups it back into one page per subfolder automatically. A single',
    '   page folder can still be dropped on its own the same way, UNLESS it',
    '   depends on something in `_shared/` below (that only resolves when the',
    '   whole folder/zip is dropped together).',
    '',
    '## Pages',
    '',
    ...pageReports.map((r) => `- \`${r.pageSlug}/\` (${r.pageName}) — ${r.resolved} asset(s)${r.missing.length ? `, **${r.missing.length} MISSING** (see build output)` : ''}`),
    ...(sharedBasenames.size
      ? [
        '',
        '## `_shared/`',
        '',
        `${sharedBasenames.size} asset(s) referenced by 2+ pages live here once instead of being`,
        'duplicated into every page that uses them. Resolves automatically when the',
        'whole folder or zip is dropped together; not visible to a lone page-folder drop.',
      ]
      : []),
  ];
  fs.writeFileSync(path.join(outDir, 'README.md'), readmeLines.join('\n') + '\n');

  console.log(`f0 export built at ${outDir}`);
  for (const r of pageReports) {
    console.log(`- ${r.pageSlug}/ (${r.pageName}): ${r.resolved} asset(s) resolved${r.missing.length ? `, ${r.missing.length} MISSING` : ''}`);
    for (const m of r.missing) console.log(`    missing: ${m.raw} (looked for "${m.basename}" under ${assetRoots.join(', ')})`);
  }
  if (ambiguous.length) {
    console.log('Ambiguous basenames (first match kept — rename to disambiguate):');
    for (const a of ambiguous) console.log(`    ${a.basename}: kept ${a.kept}, skipped ${a.skipped}`);
  }
  if (sharedBasenames.size) {
    console.log(`Shared: ${sharedBasenames.size} asset(s) referenced by 2+ pages written once to _shared/ instead of duplicated per page.`);
  }

  for (const warning of crossPageMotionWarnings(pagePlans)) console.log(`Warning: ${warning}`);
  // "Every referenced asset resolved" only covers the refs this script can
  // see; paths held in data-* attributes or inline scripts are neither
  // bundled here nor rewritten by f0's importer.
  for (const plan of pagePlans) {
    for (const warning of lintHiddenAssetRefs(plan.html)) console.log(`Warning: ${plan.pageName}: ${warning}`);
  }

  if (anyMissing && !opts.allowMissing) {
    console.error(
      '\nf0 export failed: some pages reference local files this run could not find.\n'
      + 'Add the missing files under one of the --assets roots and rerun, or pass\n'
      + '--allow-missing to ship anyway (not recommended — the client will see the\n'
      + 'same "missing" badge in f0\'s import dialog).',
    );
    process.exit(1);
  }

  const zipPath = `${outDir}.zip`;
  writeZipSync(outDir, zipPath);
  const zipSizeMb = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(1);
  console.log(`Zipped: ${zipPath} (${zipSizeMb} MB)`);

  console.log('\nf0 export ready — every referenced local asset resolved.');
}

main();
