# Browser verification recipe (advisory)

Part of the flowmo-authoring-contract package - see the package's SKILL.md for
routing. This is a recipe for checking a handoff in a real browser. It is
ADVISORY. It does NOT replace `scripts/validate-handoff.mjs`, which stays the
release gate: the validator proves the scripts route to editable motion; this
recipe catches what only a rendered page shows.

Every check below was run by hand on a real static-site handoff and caught a
real defect: a font that silently fell back, a section wider than a phone, a
hero headline that painted at opacity 0, and - the most valuable one - motion
that looked right scrolling down and wrong scrolling back up.

## Contents

- Two targets, two meanings
- The matrix and the outputs
- Running it: script, browser tool, or screenshots only
- The checks (purpose, pass criterion, in-page snippet)
- Reading the results

## Two targets, two meanings

A raw handoff HTML opened in a browser runs PLAIN GSAP, not f0's runtime.
`data-f0-interactions` payloads are inert there, `data-f0-*-scrub` markers do
nothing (unless the author shipped a local stand-in script), and scrub smoothing
can differ. So verify two targets:

- **A. The raw file** (served over http). Authoritative for layout, fonts,
  overflow, console errors, first paint, and the converter-safe GSAP blocks.
- **B. The f0 Preview or published URL, after import.** Authoritative for
  motion: native payloads, scrub markers, timelines as f0 rebuilt them. This is
  where "every scroll timeline is built at load and the last one wins" and stale
  `.to()` starts show up.

Imported GSAP is never gated by reduced motion in f0. On target B a reduce pass
that still shows motion is information, not a failure - unless the motion was
authored with a native media scope (`prefers-reduced-motion: no-preference`)
or relies on f0's native reduce-motion setting, in which case it should be
still.

## The matrix and the outputs

Run every check at 1440x900 and 390x844, each with reduced motion
`no-preference` and `reduce` (four runs). Keep:

- a JSON report per target (one entry per run: warnings, notes, raw samples);
- screenshots at scroll 0%, 50%, 100% on the way down, and at 0% again after
  the way back up. The last one next to the first is the quickest visual diff
  for "something did not return".

## Running it

**With a shell:** `node scripts/verify-in-browser.mjs <file-or-url> [--track
.a,.b] [--steps 30] [--settle 100] [--out dir] [--channel chrome] [--f0]`. A
file is served from its own folder by a tiny built-in http server (range
requests included, so video seeks work), which avoids `file://` breaking fetch
and module scripts. Pass `--f0` when the target is the f0 Preview URL. It needs
`playwright-core` (or `playwright`); `F0_PLAYWRIGHT_CORE=<path to its
index.mjs>` points at an existing install. Exit 0 clean, 2 warnings, 1 could not
run.

**No shell (agents served over MCP):** use the browser tool you have. Navigate
to the page, use its viewport resize for 1440x900 / 390x844, and run each
snippet below through its JavaScript execution action - every snippet is a
self-contained expression that returns JSON. Take screenshots with its
screenshot action at the four scroll positions. Reduced-motion emulation is not
available in every browser tool. When it is missing, verify statically instead:
every CSS animation sits inside `@media (prefers-reduced-motion:
no-preference)`, the `reduce` block overrides with `!important`, and native
payload motion carries a reduced-motion media scope.

**Screenshots only:** the scroll pass still works by eye - screenshot each step
down and each step up and compare pairs at the same position.

## The checks

### 1. Fonts

Purpose: a missing or misnamed font file falls back silently and every type
decision drifts. Pass: no face with status `error`, and the first family of
body, headings and buttons is a loaded face (or a deliberate system stack).

```js
(async () => {
  await document.fonts.ready;
  const faces = [...document.fonts].map(f => ({ family: f.family.replace(/["']/g, ''), weight: f.weight, status: f.status }));
  const used = ['body', 'h1', 'h2', 'p', 'button'].map(s => document.querySelector(s)).filter(Boolean).map(el => {
    const family = getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/["']/g, '');
    return { tag: el.tagName, family, loaded: faces.some(f => f.family === family && f.status === 'loaded') };
  });
  return { failed: faces.filter(f => f.status === 'error'), used };
})()
```

### 2. Console, page errors, failed requests

Purpose: a thrown script stops every tween after it; a 404 asset ships a hole.
Pass: no console errors, no uncaught exceptions, no failed or 4xx/5xx requests
(the browser's own `/favicon.ico` probe and aborted media range requests
excepted). Read these from the browser tool's console and network views; there
is no in-page snippet that sees errors raised before it ran.

### 3. Horizontal overflow at 390px

Purpose: one element wider than the phone makes mobile Safari widen or zoom the
whole page. Pass: `overflow` is 0. When it is not, the offenders list names the
elements sticking out that no ancestor clips.

```js
(() => {
  const w = document.documentElement.clientWidth;
  const overflow = document.documentElement.scrollWidth - w;
  const offenders = [];
  if (overflow > 1) for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (!r.width || (r.right <= w + 1 && r.left >= -1)) continue;
    let clipped = false;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement)
      if (getComputedStyle(a).overflowX !== 'visible') { clipped = true; break; }
    if (!clipped) offenders.push(`${el.tagName}.${String(el.className).trim().replace(/\s+/g, '.')} ${Math.round(r.left)}..${Math.round(r.right)}`);
    if (offenders.length >= 10) break;
  }
  return { overflow, offenders };
})()
```

### 4. First paint

Purpose: a from-state that never plays (or an import that dropped the end
value) leaves the hero blank. Pass: after load plus about a second, no h1, h2 or
primary button inside the first viewport has effective opacity (own times every
ancestor) below 0.1. A pinned scroll story that reveals a heading later is the
one legitimate exception - confirm it in the scroll pass.

```js
(() => [...document.querySelectorAll('h1, h2, .ds-button-primary, [class*="button-primary"]')].filter(el => {
  const r = el.getBoundingClientRect();
  if (r.bottom <= 0 || r.top >= innerHeight || !r.width) return false;
  let o = 1; for (let a = el; a; a = a.parentElement) o *= +getComputedStyle(a).opacity;
  return o < 0.1;
}).map(el => `${el.tagName} "${el.textContent.trim().slice(0, 40)}"`))()
```

### 5. Scroll down and back up (the important one)

Purpose: catches motion that only works in one direction - a timeline whose
`.to()` captured a stale start, two scroll timelines on one property where the
last one built wins, a reveal stuck mid-tween, a pin that leaves a gap. Method:
scroll to the bottom in 20-40 equal steps and back to 0 through the SAME
positions, waiting two animation frames plus about 100ms per step, and sample
the tracked elements each time. Pass: at every position where an element is on
screen, the down and up samples agree within 0.05 opacity and 2px of rect.

Track the elements that move: headings, reveal wrappers, pinned layers, media.
The sampler below takes a selector and returns effective opacity, the
document-relative rect and the transform:

```js
((sel) => [...document.querySelectorAll(sel)].slice(0, 80).map(el => {
  let o = 1;
  for (let a = el; a; a = a.parentElement) {
    const cs = getComputedStyle(a);
    if (cs.display === 'none' || cs.visibility === 'hidden') { o = 0; break; }
    o *= +cs.opacity;
  }
  const r = el.getBoundingClientRect();
  return { name: el.tagName + '.' + String(el.className).split(' ')[0], opacity: +o.toFixed(3),
    top: Math.round(r.top + scrollY), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height),
    inView: r.bottom > 0 && r.top < innerHeight && r.width > 0, transform: getComputedStyle(el).transform };
}))('h1, h2, h3, [class*="reveal"], [class*="rise"], img, video')
```

Step the scroll with an instant jump (a page-level `scroll-behavior: smooth`
would otherwise animate it), then wait:

```js
(async (y) => {
  window.scrollTo({ top: y, left: 0, behavior: 'instant' });
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise(r => setTimeout(r, 100));
  return scrollY;
})(1200)
```

Reading mismatches: "partly faded on the way down, fully shown on the way up"
is usually a play-once reveal caught mid-tween - a note, not a defect. Anything
else (hidden on the way up, a different position, a different transform) is a
defect. A page using scrub smoothing (`scrub: <seconds>`) needs a wait longer
than that lag per step, or every scrubbed element reports a false mismatch.

Also from this pass: every tracked element reaches effective opacity 0.9 at
some point while on screen (in either direction). One that never does is a
reveal that ends mid-tween or never fires.

### 6. Text overlap

Purpose: a pinned story or an absolutely positioned layer can leave two copy
blocks on top of each other. Pass: at each scroll step, no two visible text
blocks (h1-h3, p, effective opacity above 0.5) overlap by more than about
400 square px - counting only pairs both hit-testable at the overlap's centre
with no opaque box between them, so a clipped or covered story layer is not
reported.

```js
(() => {
  const vis = el => { let o = 1; for (let a = el; a; a = a.parentElement) o *= +getComputedStyle(a).opacity; return o > 0.5; };
  const blocks = [...document.querySelectorAll('h1, h2, h3, p')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width && r.bottom > 0 && r.top < innerHeight && el.textContent.trim() && vis(el);
  });
  const hits = [];
  for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
    const a = blocks[i], b = blocks[j];
    if (a.contains(b) || b.contains(a)) continue;
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
    const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (w <= 0 || h <= 0 || w * h < 400) continue;
    const stack = document.elementsFromPoint(Math.max(ra.left, rb.left) + w / 2, Math.max(ra.top, rb.top) + h / 2);
    const ia = stack.findIndex(e => a.contains(e)), ib = stack.findIndex(e => b.contains(e));
    if (ia < 0 || ib < 0) continue;
    const covered = stack.slice(Math.min(ia, ib) + 1, Math.max(ia, ib)).some(e => {
      const m = getComputedStyle(e).backgroundColor.match(/[\d.]+/g) || [];
      const alpha = m.length > 3 ? +m[3] : 1;
      return !e.contains(a) && !e.contains(b) && alpha > 0.9;
    });
    if (!covered) hits.push([a.textContent.trim().slice(0, 30), b.textContent.trim().slice(0, 30)]);
  }
  return hits;
})()
```

### 7. Reduced motion at rest

Purpose: under `reduce`, content must be fully visible without scrolling motion,
and nothing should keep moving. Pass: at the top, middle and bottom, every
on-screen tracked element has effective opacity above 0.1, and two samples
taken 500ms apart are identical (opacity, top, transform). Use the sampler from
check 5 twice with a 500ms wait. On target B, motion here is information (see
"Two targets"); hidden content is still a defect.

### 8. Media scrub

Purpose: a scrubbed video must follow the scroll in both directions and must
actually decode. Pass, for each paused video that moves with scroll:
`currentTime` never decreases on the way down and never increases on the way
up (0.05s tolerance), and `readyState` reaches at least 2. A video with
`data-f0-video-scrub` that never moves is expected on target A without a local
stand-in, and a defect on target B. Autoplaying videos are skipped.

```js
[...document.querySelectorAll('video')].map(v => ({ readyState: v.readyState,
  currentTime: +v.currentTime.toFixed(3), paused: v.paused, scrub: v.hasAttribute('data-f0-video-scrub') }))
```

Sample it at every step of the scroll pass alongside check 5.

## Reading the results

Warnings are defects to fix or to consciously accept; notes are context. Fix
in the source, rerun `validate-handoff.mjs` (the gate), then rerun this recipe
on both targets. A clean raw-file run says nothing about how f0 plays the
native payloads - only a target B run does.
