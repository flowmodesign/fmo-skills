/**
 * IMPORT-FIDELITY LINT for an f0 handoff: the shapes that pass the routing gate
 * (validate-handoff.mjs) and still import WRONG. Every check here is a warning,
 * not a failure - the file imports, it just does not look or move like the
 * source. Each one was found on a real handoff (Genesis, 2026-10) and traced to
 * the f0 importer or runtime; the message names the mechanism and the fix.
 *
 * Exports the small source parsers the validator shares (matchingParen,
 * splitArgs) plus lintCss, lintMotion and lintLocalScripts.
 */

import fs from 'node:fs';
import path from 'node:path';

export function matchingParen(source, open) {
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let index = open; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '(') depth++;
    else if (char === ')' && --depth === 0) return index;
  }
  return -1;
}

export function splitArgs(source) {
  const parts = [];
  let start = 0;
  let round = 0;
  let square = 0;
  let curly = 0;
  let quote = '';
  let escaped = false;
  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '(') round++;
    else if (char === ')') round--;
    else if (char === '[') square++;
    else if (char === ']') square--;
    else if (char === '{') curly++;
    else if (char === '}') curly--;
    else if (char === ',' && round === 0 && square === 0 && curly === 0) {
      parts.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(source.slice(start).trim());
  return parts.filter(Boolean);
}

const isRemote = (ref) => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref);

/** Local stylesheets the page links, read from disk (remote ones are never imported). */
export function readLinkedCss(html, htmlPath) {
  const out = [];
  for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
    if (!/\brel\s*=\s*["']?stylesheet/i.test(tag[0])) continue;
    const href = tag[0].match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (!href || isRemote(href)) continue;
    const file = path.resolve(path.dirname(htmlPath), href.split(/[?#]/)[0]);
    if (fs.existsSync(file)) out.push({ label: href, css: fs.readFileSync(file, 'utf8') });
  }
  return out;
}

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

/** Size-only media conditions become page container queries (rules go into
 *  f0's rule store); anything else - prefers-reduced-motion, hover, print,
 *  mixed - is shipped VERBATIM as global CSS, ahead of the page CSS. */
function isVerbatimMedia(prelude) {
  const rest = prelude
    .replace(/^@media/i, '')
    .replace(/\(\s*(?:min-|max-)?(?:width|height)\s*:[^)]*\)/gi, '')
    .replace(/\b(?:and|screen|all|only)\b/gi, '')
    .replace(/[\s,]/g, '');
  return rest.length > 0;
}

function splitSelectors(text) {
  const out = [];
  let depth = 0;
  let current = '';
  for (const char of text) {
    if (char === '(' || char === '[') depth++;
    else if (char === ')' || char === ']') depth--;
    if (char === ',' && depth === 0) { out.push(current); current = ''; }
    else current += char;
  }
  out.push(current);
  return out.map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean);
}

function parseDecls(body) {
  return body.split(';').map((d) => d.trim()).filter((d) => d.includes(':')).map((d) => {
    const at = d.indexOf(':');
    return { prop: d.slice(0, at).trim().toLowerCase(), value: d.slice(at + 1).trim() };
  });
}

/** Walk CSS into rules (with the scope f0 will file them under), keyframes and at-rule notes. */
function walkCss(text, label) {
  const rules = [];
  const keyframes = new Map();
  const notes = [];
  const visit = (src, scope, verbatim) => {
    let i = 0;
    while (i < src.length) {
      const open = src.indexOf('{', i);
      if (open < 0) break;
      const raw = src.slice(i, open);
      const head = raw.slice(raw.lastIndexOf(';') + 1).replace(/}/g, ' ').trim();
      let depth = 1;
      let p = open + 1;
      while (p < src.length && depth) { if (src[p] === '{') depth++; else if (src[p] === '}') depth--; p++; }
      const body = src.slice(open + 1, p - 1);
      i = p;
      if (head.startsWith('@')) {
        const name = head.match(/^@([\w-]+)/)?.[1]?.toLowerCase() || '';
        if (name === 'media') {
          const v = verbatim || isVerbatimMedia(head);
          visit(body, v ? head : `${scope} ${head}`.trim(), v);
        } else if (name === 'container') {
          visit(body, `${scope} ${head}`.trim(), verbatim);
        } else if (name === 'supports' || name === 'starting-style') {
          if (!verbatim) notes.push({ kind: name, label, head });
          visit(body, scope, verbatim); // f0 unwraps both into the enclosing scope
        } else if (/keyframes$/.test(name)) {
          const kfName = head.replace(/^@[\w-]+\s*/, '').trim();
          const stops = [];
          for (const m of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) stops.push(parseDecls(m[2]));
          keyframes.set(kfName, stops);
        }
        continue;
      }
      rules.push({ selectors: splitSelectors(head), decls: parseDecls(body), scope: scope || 'base', verbatim, label });
    }
  };
  visit(text.replace(/\/\*[\s\S]*?\*\//g, ''), '', false);
  return { rules, keyframes, notes };
}

const isBareTag = (sel) => !/[.#[:]/.test(sel);

function animationLayers(rule, keyframes) {
  const layers = [];
  for (const { prop, value } of rule.decls) {
    if (prop !== 'animation' && prop !== 'animation-name') continue;
    for (const layer of splitArgs(value)) {
      const name = layer.split(/\s+/).find((token) => keyframes.has(token));
      layers.push({ layer, name });
    }
  }
  return layers;
}

export function lintCss(sources, relevant = () => true) {
  const warnings = [];
  // A shared stylesheet carries every page's rules; only report this page's.
  const here = (selectors) => selectors.some((sel) => relevant(sel));
  const all = sources.map(({ label, css }) => walkCss(css, label));
  const keyframes = new Map();
  for (const w of all) for (const [k, v] of w.keyframes) keyframes.set(k, v);

  for (const { rules, notes } of all) {
    // 1. Selector-group bleed (rule store only; verbatim blocks are untouched).
    const byScope = new Map();
    for (const r of rules) if (!r.verbatim) {
      if (!byScope.has(r.scope)) byScope.set(r.scope, []);
      byScope.get(r.scope).push(r);
    }
    for (const [scope, list] of byScope) {
      const reported = new Set();
      list.forEach((group, gi) => {
        if (group.selectors.length < 2 || !here(group.selectors)) return;
        for (const later of list.slice(gi + 1)) {
          for (const member of later.selectors) {
            if (!group.selectors.includes(member) || isBareTag(member)) continue;
            const key = `${scope}|${group.selectors.join(',')}|${member}`;
            if (reported.has(key)) continue;
            reported.add(key);
            const props = later.decls.map((d) => d.prop).join(', ');
            warnings.push(
              `${group.label}: \`${member}\` is restyled after the group \`${group.selectors.join(', ')}\``
              + `${scope === 'base' ? '' : ` (${scope})`}. f0 shares one declaration list across a selector `
              + `group and merges the later rule into it, so ${props} bleed onto every selector in the `
              + 'group. Give each selector its own full rule.',
            );
          }
        }
      });
    }
    // 2-3. At-rules the rule store flattens.
    for (const note of notes) {
      warnings.push(note.kind === 'starting-style'
        ? `${note.label}: a top-level @starting-style is flattened by f0 into ordinary rules, so its entry `
          + 'state becomes permanent (e.g. an open menu stuck at opacity 0). Put it inside '
          + '@media (prefers-reduced-motion: no-preference) { ... }, which f0 ships verbatim, and give its '
          + 'selectors extra specificity (that block is emitted before the page CSS).'
        : `${note.label}: ${note.head} is unwrapped by f0 - its condition is dropped and its rules always `
          + 'apply. Do not rely on @supports to choose between two layouts.');
    }
    for (const r of rules) {
      // 4. Vendor mask compositing.
      if (!here(r.selectors)) continue;
      if (!r.verbatim && r.decls.some((d) => d.prop === '-webkit-mask-composite')) {
        warnings.push(`${r.label}: \`${r.selectors.join(', ')}\` uses -webkit-mask-composite. f0 renames it to `
          + 'mask-composite but keeps the webkit value (source-in, xor), which is invalid there. Use only the '
          + 'standard mask / mask-composite (intersect, exclude).');
      }
      // 5. CSS animations the converter takes - and what it loses.
      if (!r.verbatim) {
        const layers = animationLayers(r, keyframes);
        if (layers.length) {
          const reasons = [];
          if (r.selectors.some((s) => s.includes('::'))) reasons.push('it targets a pseudo-element, which f0 interactions cannot animate');
          if (layers.length > 1) reasons.push('only the first of its comma-separated animations converts and the rest are dropped');
          if (r.decls.some((d) => d.prop === 'animation-timeline' || d.prop === 'animation-range')) reasons.push('its scroll/view timeline becomes a 1s on-load animation');
          if (r.decls.some((d) => /steps\(/.test(d.value) && d.prop.startsWith('animation'))) reasons.push('steps() becomes linear');
          for (const { name } of layers) {
            const stops = name ? keyframes.get(name) : null;
            if (!stops) continue;
            const decls = stops.flat();
            if (decls.length && decls.every((d) => d.prop.startsWith('--'))) reasons.push(`@keyframes ${name} animates only custom properties`);
            if (decls.some((d) => /translate[XY3d]*\([^)]*%/.test(d.value) || (d.prop === 'translate' && /%/.test(d.value)))) reasons.push(`@keyframes ${name} translates by %, which becomes px`);
          }
          if (reasons.length) {
            warnings.push(`${r.label}: \`${r.selectors.join(', ')}\` runs a CSS animation outside a `
              + `prefers-reduced-motion block, so f0 converts it into an interaction and ${[...new Set(reasons)].join('; ')}. `
              + 'Move the animation declaration into @media (prefers-reduced-motion: no-preference) { ... } to keep it as plain CSS.');
          }
        }
      }
    }
  }

  // 6. One @keyframes used both by a converted rule and a verbatim one.
  const rulesAll = all.flatMap((w) => w.rules);
  const converted = new Set();
  const kept = new Set();
  for (const r of rulesAll) for (const { name } of animationLayers(r, keyframes)) if (name) (r.verbatim ? kept : converted).add(name);
  for (const name of converted) if (kept.has(name)) {
    warnings.push(`@keyframes ${name} is used both by a top-level rule and inside a media block. f0 consumes `
      + 'and strips the @keyframes when it converts the top-level rule, leaving the other rule pointing at '
      + 'nothing. Use it only inside @media (prefers-reduced-motion: no-preference).');
  }

  // 7. Reduced-motion overrides that lose the cascade.
  const reduceGroups = new Map();
  for (const r of rulesAll) {
    if (!r.verbatim || !/prefers-reduced-motion\s*:\s*reduce/i.test(r.scope) || !here(r.selectors)) continue;
    const loose = r.decls.filter((d) => !/!important\s*$/i.test(d.value)).length;
    if (loose) reduceGroups.set(r.label, (reduceGroups.get(r.label) || 0) + loose);
  }
  for (const [label, count] of reduceGroups) {
    warnings.push(`${label}: ${count} declaration(s) in @media (prefers-reduced-motion: reduce) lack !important. `
      + 'f0 emits non-size media blocks BEFORE the page CSS, so they lose to equal-specificity base rules. '
      + 'Mark them !important (the one place it is needed), or put the motion itself in a no-preference block.');
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// GSAP motion (only blocks that convert)
// ---------------------------------------------------------------------------

const CONTROL = new Set(['duration', 'delay', 'ease', 'stagger', 'repeat', 'yoyo', 'id', 'snap', 'immediateRender',
  'scrollTrigger', 'transformOrigin', 'paused', 'repeatDelay', 'overwrite', 'defaults']);

function objectEntries(text) {
  const t = (text || '').trim();
  if (!t.startsWith('{')) return new Map();
  const map = new Map();
  for (const part of splitArgs(t.slice(1, -1))) {
    const at = part.indexOf(':');
    if (at > 0) map.set(part.slice(0, at).trim().replace(/^['"]|['"]$/g, ''), part.slice(at + 1).trim());
  }
  return map;
}
const unquote = (v) => (v || '').trim().replace(/^['"`]|['"`]$/g, '');

function tweenFrom(method, args) {
  const selector = unquote(args[0]);
  const fromVars = method === 'fromTo' ? objectEntries(args[1]) : new Map();
  const vars = objectEntries(method === 'fromTo' ? args[2] : args[1]);
  const props = new Set([...fromVars.keys(), ...vars.keys()].filter((k) => !CONTROL.has(k)));
  const st = objectEntries(vars.get('scrollTrigger'));
  const stagger = vars.get('stagger');
  return {
    selector, method, props,
    explicitStart: method === 'fromTo' || method === 'set',
    lazy: /\bimmediateRender\s*:\s*false\b/.test(args.join(',')),
    duration: vars.has('duration') ? Number(vars.get('duration')) : null,
    stagger: stagger ? (/^[\d.]+$/.test(stagger) ? { each: Number(stagger) } : Object.fromEntries([...objectEntries(stagger)].map(([k, v]) => [k, Number(v)]))) : null,
    trigger: st.size ? unquote(st.get('trigger')) : null,
    scrub: st.has('scrub') && !/^false$/.test(st.get('scrub')),
    id: unquote(vars.get('id')),
  };
}

/** Parse one converter-safe script into timelines and standalone tweens. */
export function parseGsap(code) {
  const timelines = [];
  const standalone = [];
  let i = 0;
  while (i < code.length) {
    const m = /gsap\.(timeline|to|fromTo|from|set)\s*\(/g;
    m.lastIndex = i;
    const hit = m.exec(code);
    if (!hit) break;
    const open = hit.index + hit[0].length - 1;
    const close = matchingParen(code, open);
    if (close < 0) break;
    const args = splitArgs(code.slice(open + 1, close));
    i = close + 1;
    if (hit[1] !== 'timeline') { standalone.push(tweenFrom(hit[1], args)); continue; }
    const vars = objectEntries(args[0]);
    const st = objectEntries(vars.get('scrollTrigger'));
    const tl = { id: unquote(vars.get('id')) || `timeline ${timelines.length + 1}`,
      scrub: st.has('scrub') && !/^false$/.test(st.get('scrub')), tweens: [] };
    const chain = /^\s*\.(to|fromTo|from|set)\s*\(/;
    let rest = code.slice(i);
    let step;
    while ((step = chain.exec(rest))) {
      const at = i + step[0].length - 1;
      const end = matchingParen(code, at);
      if (end < 0) break;
      tl.tweens.push(tweenFrom(step[1], splitArgs(code.slice(at + 1, end))));
      i = end + 1;
      rest = code.slice(i);
    }
    timelines.push(tl);
  }
  return { timelines, standalone };
}

function classCount(html, selector) {
  const cls = selector.match(/^\.([\w-]+)$/)?.[1];
  if (!cls) return 1;
  const re = new RegExp(`class\\s*=\\s*["'][^"']*\\b${cls}\\b`, 'g');
  return (html.match(re) || []).length || 1;
}

export function lintMotion(scripts, html) {
  const warnings = [];
  const owners = new Map(); // "sel|prop" -> Map(owner -> tweens[])
  const own = (owner, tween) => {
    for (const prop of tween.props) {
      const key = `${tween.selector}|${prop}`;
      if (!owners.has(key)) owners.set(key, new Map());
      const o = owners.get(key);
      if (!o.has(owner)) o.set(owner, []);
      o.get(owner).push(tween);
    }
  };
  const groups = new Map();
  let lazy = 0;
  for (const { code } of scripts) {
    const { timelines, standalone } = parseGsap(code);
    for (const tl of timelines) {
      for (const tw of tl.tweens) { if (tl.scrub) own(`timeline "${tl.id}"`, tw); if (tw.lazy) lazy++; }
    }
    for (const tw of standalone) {
      if (tw.lazy) lazy++;
      if (!tw.scrub || !tw.trigger) continue;
      own(`scrubbed tweens on ${tw.trigger}`, tw);
      if (!groups.has(tw.trigger)) groups.set(tw.trigger, []);
      groups.get(tw.trigger).push(tw);
    }
  }
  // 1. One element+property driven by two scroll owners.
  for (const [key, o] of owners) {
    if (o.size < 2) continue;
    const tweens = [...o.values()].flat();
    const onlyExplicitStandalone = [...o.keys()].every((k) => k.startsWith('scrubbed')) && tweens.every((t) => t.explicitStart);
    if (onlyExplicitStandalone) continue;
    const [selector, prop] = key.split('|');
    warnings.push(`${selector} ${prop} is driven by ${[...o.keys()].join(' and ')}. f0 builds every scroll timeline `
      + 'at load and each paints its start state (the last built wins), and a .to() records its start at load, '
      + 'so the element starts in the wrong state or sticks when you scroll back. Give each extra timeline '
      + 'its own wrapper element (e.g. animate an outer .x-out) with an explicit fromTo.');
  }
  // 2. immediateRender: false is dropped.
  if (lazy) {
    warnings.push(`${lazy} tween(s) use immediateRender: false. f0 strips it: every scroll timeline paints its `
      + 'from-state at load. That is harmless only where the from-state IS the resting look (e.g. hidden and '
      + 'fading in); never use it to keep a shared property from painting - use a wrapper element per timeline.');
  }
  // 3. Scrubbed tweens sharing a trigger are grouped and mapped over the LONGEST one.
  for (const [trigger, list] of groups) {
    if (list.length < 2) continue;
    const length = (t) => {
      const d = t.duration ?? 0.5;
      if (!t.stagger) return d;
      if (t.stagger.amount != null) return d + t.stagger.amount;
      return d + (t.stagger.each || 0) * (classCount(html, t.selector) - 1);
    };
    const lengths = list.map((t) => [t.selector, Math.round(length(t) * 100) / 100]);
    if (new Set(lengths.map(([, l]) => l)).size > 1) {
      warnings.push(`Scrubbed tweens on ${trigger} have different lengths (${lengths.map(([s, l]) => `${s} ${l}s`).join(', ')}). `
        + 'f0 groups them into one timeline and maps the scroll range over the longest, so the shorter ones finish '
        + 'early and jump. Give them the same duration + stagger span (a tween without duration counts as 0.5s).');
    }
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Across exported pages (build-f0-export.mjs)
// ---------------------------------------------------------------------------

/**
 * f0 interactions are PROJECT-WIDE and bound by class, not by page: every
 * interaction whose target class exists on a page runs there. So a GSAP
 * timeline that two exported pages both carry (a page and its variant) is
 * imported twice and both copies drive the same elements (a random stagger
 * then flickers), and one class animated by differently-named tweens on
 * different pages gets all of them on every page. Simple identical tweens
 * are de-duplicated on import; timelines are not.
 */
export function crossPageMotionWarnings(plans) {
  const timelines = new Map();
  const tweensBySelector = new Map();
  for (const { pageName, html } of plans) {
    for (const m of html.matchAll(/gsap\.timeline\(\s*\{[^}]*?\bid\s*:\s*(['"])(.*?)\1/g)) {
      if (!timelines.has(m[2])) timelines.set(m[2], new Set());
      timelines.get(m[2]).add(pageName);
    }
    for (const m of html.matchAll(/gsap\.(?:to|from|fromTo)\(\s*(['"])(.*?)\1[^;]*?\bid\s*:\s*(['"])(.*?)\3/g)) {
      if (!tweensBySelector.has(m[2])) tweensBySelector.set(m[2], new Map());
      tweensBySelector.get(m[2]).set(m[4], pageName);
    }
  }
  const out = [];
  for (const [id, pages] of timelines) {
    if (pages.size > 1) out.push(`timeline "${id}" is on ${[...pages].join(', ')}. f0 imports it once per page and both copies run on each page; export only one of those pages, or give the copy its own classes.`);
  }
  for (const [selector, ids] of tweensBySelector) {
    if (new Set(ids.values()).size > 1) out.push(`${selector} is animated by ${[...ids].map(([id, page]) => `"${id}" (${page})`).join(' and ')}. f0 runs all of them on every page that has ${selector}; use one tween (same name and values) everywhere.`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Local external scripts
// ---------------------------------------------------------------------------

export function lintLocalScripts(html, htmlPath) {
  const warnings = [];
  for (const tag of html.matchAll(/<script\b([^>]*)>/gi)) {
    const src = tag[1].match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (!src || isRemote(src)) continue;
    const file = path.resolve(path.dirname(htmlPath), src.split(/[?#]/)[0]);
    const code = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    let message = `${src}: a folder import inlines this file as an "Imported script". It runs only in Preview and `
      + 'Export (never on the canvas), on EVERY page of the project, and can run before f0 builds its own animations.';
    if (/\b(?:gsap|ScrollTrigger)\.(?:getById|getTweensOf|getAll|globalTimeline)\b/.test(code)) {
      message += ' It reaches into GSAP tweens, which f0 rebuilds in its own runtime without your ids (window.gsap '
        + 'may not exist): it will find nothing. Drive CSS animations through element.getAnimations() instead.';
    }
    warnings.push(message);
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Asset paths the import pipeline can't see
// ---------------------------------------------------------------------------

const ASSET_PATH = /(?:\.{0,2}\/)?[\w@%~.-][\w@%~ ./-]*\.(?:png|jpe?g|webp|gif|avif|svg|ico|mp4|webm|mov|m4v|mp3|wav|ogg|woff2?|ttf|otf|json|lottie)(?=[?#"'\s)\],;]|$)/gi;

/** Local asset paths that only appear inside `data-*` attribute values or
 *  inline script bodies. Neither build-f0-export.mjs (which collects
 *  src/href/poster/data/srcset and CSS url()) nor f0's importer (which
 *  uploads and rewrites img/video/source src, poster, link/script and url())
 *  sees them, so the file is never bundled and the path is left pointing at
 *  nothing in f0 - while the export still reports every asset resolved.
 *  Found on a script-driven gallery whose photos lived in a JSON
 *  data-projects attribute. */
export function lintHiddenAssetRefs(html) {
  const visible = new Set();
  const norm = (ref) => ref.trim().replace(/^\.\//, '').split(/[?#]/)[0].toLowerCase();
  for (const m of html.matchAll(/\b(?:src|href|poster|data|srcset)\s*=\s*(["'])(.*?)\1/gi)) {
    for (const entry of m[2].split(',')) {
      const url = entry.trim().split(/\s+/)[0];
      if (url) visible.add(norm(url));
    }
  }
  for (const m of html.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) visible.add(norm(m[2]));

  const hidden = new Map(); // path -> where
  const collect = (text, where) => {
    for (const m of text.matchAll(ASSET_PATH)) {
      const ref = m[0];
      if (isRemote(ref) || visible.has(norm(ref))) continue;
      if (!hidden.has(ref)) hidden.set(ref, where);
    }
  };
  for (const m of html.matchAll(/\s(data-[\w-]+)\s*=\s*(["'])([\s\S]*?)\2/gi)) {
    collect(m[3].replace(/&quot;/g, '"'), m[1]);
  }
  for (const m of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script\s*>/gi)) collect(m[1], 'an inline script');

  const byWhere = new Map();
  for (const [ref, where] of hidden) byWhere.set(where, [...(byWhere.get(where) || []), ref]);
  return [...byWhere].map(([where, refs]) =>
    `${refs.length} local asset path(s) appear only in ${where} (${refs.slice(0, 4).join(', ')}${refs.length > 4 ? ', ...' : ''}). `
    + 'Neither the f0 export nor f0\'s importer looks there, so the file is not bundled or uploaded and the path '
    + 'points at nothing in f0. Put each asset in a real attribute (a hidden <img src>, <video src>, poster, or a '
    + 'CSS url()) and have the script read element.src, which also picks up f0\'s hosted URL after import.');
}
