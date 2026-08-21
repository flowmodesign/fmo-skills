#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * THE REAL IMPORTER ROUTING, bundled from f0's own `script-triage` module.
 *
 * This validator used to re-implement those rules by hand. A hand copy of a
 * moving target drifts, and it did: it passed a handoff whose ~50 tweens all
 * sank into one opaque code element, because the importer rejects some shapes
 * the copy never knew about. A mandatory gate that says "valid" about a page
 * which imports dead is worse than no gate at all.
 *
 * So the decision below is not a description of f0's behaviour - it IS f0's
 * behaviour, the same function `runPageImport` routes with.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));
let triageInlineScript;
try {
  ({ triageInlineScript } = await import(path.join(HERE, 'triage.generated.mjs')));
} catch (error) {
  console.error(
    'f0 validator: triage.generated.mjs is missing or unreadable, so this run '
    + 'could not check scripts against the real importer routing.\n'
    + 'Reinstall the skill (it ships beside this file), rather than trusting a partial pass.\n'
    + String((error && error.message) || error),
  );
  process.exit(1);
}

function fail(message) {
  console.error(`f0 editable-motion handoff validation failed: ${message}`);
  process.exit(1);
}

function collectDomSignatures(html) {
  const ids = new Set();
  const classes = new Set();
  const attributes = new Map();
  const withoutScripts = html.replace(/<script\b[\s\S]*?<\/script\s*>/gi, '');
  for (const tag of withoutScripts.matchAll(/<[a-z][^>]*>/gi)) {
    const source = tag[0];
    for (const attribute of source.matchAll(/\b([:\w-]+)(?:\s*=\s*(["'])(.*?)\2)?/g)) {
      const name = attribute[1].toLowerCase();
      const value = attribute[3] ?? '';
      if (!attributes.has(name)) attributes.set(name, new Set());
      attributes.get(name).add(value);
      if (name === 'id' && value) ids.add(value);
      if (name === 'class') {
        for (const className of value.split(/\s+/).filter(Boolean)) classes.add(className);
      }
    }
  }
  return { ids, classes, attributes };
}

function selectorExists(selector, signatures) {
  const sentinels = new Set(['trigger', 'self', 'parent', 'children', 'window', 'document']);
  if (!selector || sentinels.has(selector)) return true;
  return selector.split(',').some((branch) => {
    const ids = [...branch.matchAll(/#([\w-]+)/g)].map((match) => match[1]);
    const classes = [...branch.matchAll(/\.([\w-]+)/g)].map((match) => match[1]);
    const attrs = [...branch.matchAll(/\[([:\w-]+)(?:\s*=\s*(["']?)([^\]"']+)\2)?\]/g)];
    if (!ids.length && !classes.length && !attrs.length) return true;
    return ids.every((id) => signatures.ids.has(id))
      && classes.every((className) => signatures.classes.has(className))
      && attrs.every((match) => {
        const values = signatures.attributes.get(match[1].toLowerCase());
        return values && (match[3] === undefined || values.has(match[3]));
      });
  });
}

function collectSelectors(value, selectors, pathParts = []) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectSelectors(item, selectors, [...pathParts, String(index)]));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    const childPath = [...pathParts, key];
    if (
      typeof child === 'string'
      && (/selector$/i.test(key) || ['target', 'animationTarget', 'rootSelector'].includes(key))
    ) {
      selectors.push({ selector: child, path: childPath.join('.') });
    }
    collectSelectors(child, selectors, childPath);
  }
}

function matchingParen(source, open) {
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

function splitArgs(source) {
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
  return parts;
}

function blankRange(source, start, end) {
  return source.slice(0, start)
    + source.slice(start, end).replace(/[^\r\n]/g, ' ')
    + source.slice(end);
}

/**
 * Ask the REAL importer what happens to this script.
 *
 * `convert` - every tween lands as an editable native f0 interaction.
 * `sink`    - the whole block becomes one opaque code element. Routing is
 *             ATOMIC per script, so a single unsupported construct takes every
 *             other tween in the same block down with it. That is what makes a
 *             near-miss so expensive, and why this is a hard failure.
 * `ignore`  - nothing executable; harmless.
 */
function validateClassicScript(source) {
  const { decision, reason } = triageInlineScript(source);
  if (decision === 'convert' || decision === 'ignore') return { ok: true, decision };
  return { ok: false, reason, decision };
}

const sourcePath = process.argv[2];
if (!sourcePath) fail('pass the HTML file path as the first argument');
const absolutePath = path.resolve(sourcePath);
const html = fs.readFileSync(absolutePath, 'utf8');
const domSignatures = collectDomSignatures(html);
const errors = [];
const warnings = [];
const nativeSelectors = [];
const classicScripts = [];
let editableGsapBlocks = 0;
let nativeInteractions = 0;
let nativeTimelines = 0;

const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
let scriptMatch;
let scriptIndex = 0;
while ((scriptMatch = scriptPattern.exec(html))) {
  scriptIndex++;
  const attributes = scriptMatch[1];
  const code = scriptMatch[2].trim();
  if (!code || /\bsrc\s*=/.test(attributes)) continue;
  const type = attributes.match(/\btype\s*=\s*(["'])(.*?)\1/i)?.[2]?.trim().toLowerCase() || '';
  const isNative = /\bdata-f0-interactions\b/i.test(attributes);
  if (isNative) {
    if (type !== 'application/json') {
      errors.push(`script ${scriptIndex}: data-f0-interactions must use type="application/json"`);
      continue;
    }
    let payload;
    try { payload = JSON.parse(code); }
    catch (error) {
      errors.push(`script ${scriptIndex}: native payload is not valid JSON (${String(error)})`);
      continue;
    }
    const interactions = Array.isArray(payload?.interactions) ? payload.interactions : [];
    const timelines = payload?.timelines && typeof payload.timelines === 'object' ? payload.timelines : {};
    if (!Array.isArray(payload?.interactions)) {
      errors.push(`script ${scriptIndex}: native payload interactions must be an array`);
    }
    if (!payload?.timelines || typeof payload.timelines !== 'object' || Array.isArray(payload.timelines)) {
      errors.push(`script ${scriptIndex}: native payload timelines must be an object map`);
    }
    nativeInteractions += interactions.length;
    nativeTimelines += Object.keys(timelines).length;
    const ids = new Set();
    for (const [interactionIndex, interaction] of interactions.entries()) {
      const label = `script ${scriptIndex}, interaction ${interactionIndex + 1}`;
      if (!interaction || typeof interaction !== 'object') {
        errors.push(`${label}: interaction must be an object`);
        continue;
      }
      if (typeof interaction.id !== 'string' || !interaction.id.trim()) {
        errors.push(`${label}: id is required`);
      } else if (ids.has(interaction.id)) {
        errors.push(`${label}: duplicate id ${interaction.id}`);
      } else ids.add(interaction.id);
      if (typeof interaction.name !== 'string' || !interaction.name.trim()) {
        errors.push(`${label}: name is required`);
      }
      if (typeof interaction.trigger?.type !== 'string') {
        errors.push(`${label}: trigger.type is required`);
      }
      if (typeof interaction.animation?.type !== 'string' || !interaction.animation?.definition) {
        errors.push(`${label}: animation.type and animation.definition are required`);
      }
      if (interaction?.animation?.type !== 'timeline') continue;
      const timelineId = interaction.animation.definition?.timelineId;
      if (typeof timelineId !== 'string' || !Object.hasOwn(timelines, timelineId)) {
        errors.push(`script ${scriptIndex}: timeline interaction references missing timeline ${String(timelineId)}`);
      }
    }
    for (const [timelineKey, timeline] of Object.entries(timelines)) {
      const label = `script ${scriptIndex}, timeline ${timelineKey}`;
      if (!timeline || typeof timeline !== 'object') {
        errors.push(`${label}: timeline must be an object`);
        continue;
      }
      if (typeof timeline.id !== 'string' || timeline.id !== timelineKey) {
        errors.push(`${label}: timeline.id must equal its map key`);
      }
      if (!Array.isArray(timeline.layers) || timeline.layers.length === 0) {
        errors.push(`${label}: at least one layer is required`);
        continue;
      }
      for (const [layerIndex, layer] of timeline.layers.entries()) {
        if (!Array.isArray(layer?.tracks) || layer.tracks.length === 0) {
          errors.push(`${label}, layer ${layerIndex + 1}: at least one track is required`);
          continue;
        }
        for (const [trackIndex, track] of layer.tracks.entries()) {
          if (!Array.isArray(track?.keyframes) || track.keyframes.length === 0) {
            errors.push(`${label}, layer ${layerIndex + 1}, track ${trackIndex + 1}: keyframes are required`);
          }
        }
      }
    }
    collectSelectors(payload, nativeSelectors, [`script ${scriptIndex}`]);
    continue;
  }
  if (type === 'application/ld+json' || type === 'text/f0-tsx') continue;
  classicScripts.push({ index: scriptIndex, code });
  const result = validateClassicScript(code);
  if (result.ok) editableGsapBlocks++;
  else errors.push(
    `script ${scriptIndex}: ${result.reason}. This would import as an opaque code element; `
    + 'use atomic literal-selector GSAP or data-f0-interactions.',
  );
}

for (const { selector, path: selectorPath } of nativeSelectors) {
  if (!selectorExists(selector, domSignatures)) {
    errors.push(`${selectorPath}: selector ${JSON.stringify(selector)} does not match the handoff HTML`);
  }
}

/**
 * Ids are not styling or animation hooks. An id matches ONE element, so an
 * id-keyed rule or tween binds a single node and breaks the moment the user
 * duplicates that section on the canvas - and the duplicate id is invalid HTML.
 * Class rules are also the only ones f0's class-level style editing can touch.
 * This is a WARNING, not a gate failure: the import converts an id selector
 * happily, so failing here would reject files the product accepts. Anchor
 * targets, form wiring and SVG internal references legitimately carry ids -
 * they just never appear as a selector, which is what this looks at.
 */
const ID_SELECTOR = /#[A-Za-z_][\w-]*/;

for (const { selector, path: selectorPath } of nativeSelectors) {
  if (ID_SELECTOR.test(selector)) {
    warnings.push(
      `${selectorPath}: selector ${JSON.stringify(selector)} targets an id. `
      + 'Hook motion on a class instead.',
    );
  }
}

for (const { index, code } of classicScripts) {
  const quoted = code.match(/(['"])#[A-Za-z_][\w-]*(?:[^'"\n]*)?\1/g) || [];
  for (const target of new Set(quoted)) {
    warnings.push(
      `script ${index}: GSAP target ${target} is an id selector. `
      + 'Put a class on the element and animate that.',
    );
  }
}

const stylePattern = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi;
let styleMatch;
let styleIndex = 0;
while ((styleMatch = stylePattern.exec(html))) {
  styleIndex++;
  const idRules = new Set();
  // Selector text only - the part before each `{`, so a `#fff` colour value in
  // a declaration is never mistaken for an id selector.
  for (const block of styleMatch[1].replace(/\/\*[\s\S]*?\*\//g, '').split('}')) {
    const selectorText = block.split('{')[0];
    if (!selectorText || !block.includes('{')) continue;
    for (const part of selectorText.split(',')) {
      const trimmed = part.trim();
      if (trimmed && !trimmed.startsWith('@') && ID_SELECTOR.test(trimmed)) idRules.add(trimmed);
    }
  }
  for (const rule of idRules) {
    warnings.push(`style ${styleIndex}: rule \`${rule}\` styles by id. Style a class instead.`);
  }
}

/**
 * Declarative media scrub is the THIRD channel that produces interactions on
 * import, alongside converter-safe GSAP and the native payload. It needs no
 * script, so nothing above sees it - and reporting "0 interactions" for a page
 * whose scrub markers are perfectly fine reads as "my markers were ignored",
 * which is exactly the doubt that pushes an author back to a canvas or a
 * hand-written ScrollTrigger. Counted, not validated: the import warns on a
 * marker with no source.
 */
const scrubMarkers = (html.match(
  /\bdata-f0-(?:video|image-sequence|lottie)-scrub\b/gi,
) || []).length;

if (warnings.length) {
  console.error(`f0 handoff warnings (classes, not ids) for ${absolutePath}`);
  for (const warning of warnings) console.error(`- ${warning}`);
}

if (errors.length) {
  console.error(`f0 editable-motion handoff validation failed for ${absolutePath}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(
  `f0 editable-motion handoff valid: ${editableGsapBlocks} editable GSAP block(s), `
  + `${nativeInteractions} native interaction(s), ${nativeTimelines} native timeline(s), `
  + `${scrubMarkers} declarative media scrub(s)`,
);
