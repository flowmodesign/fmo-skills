# Motion and native-interaction handoff

## Contents

- Atomic GSAP conversion grammar
- Shapes that convert but play differently (CSS animations, shared scroll properties, project-wide interactions, local scripts)
- Media scrub and SVG/text effects
- Native interaction/timeline payloads
- Stateful component bindings
- Mandatory motion validation

# 5. GSAP: exactly what converts

Use inline GSAP only for the statically analyzable cases below. A direct call
becomes a native f0 interaction; compatible direct calls in the same section or
on the same scroll trigger may be grouped into one timeline. An accepted
`gsap.timeline()` becomes one native f0 timeline with selector-group layers. It
never expands into one interaction per matched element. If the choreography is
dynamic, skip imperative JavaScript and author the native payload in section 6.

## The conversion conditions

All must hold. Import routing is **atomic per `<script>` block**: if one
statement in a block is outside this grammar, the whole block stays as code and
none of its tweens become editable interactions. Do not put helper functions,
DOM queries, variable setup, responsive `if` branches, callbacks, or computed
scroll math in a block you label convertible.

1. The call is either:
   - `gsap.to`, `gsap.from` or `gsap.fromTo`; or
   - a static `gsap.timeline()` chain using `to`, `from`, `fromTo`, `set`, and
     `addLabel`.
2. The target is a **CSS selector string** (`'.hero-title'`). No DOM refs,
   variables, arrays, query helpers, or loops. **Always a CLASS selector, never
   an id** - `'.hero-title'`, not `'#hero-title'`. An id matches one element
   ever, so the tween dies the moment that section is duplicated or reused, and
   a duplicated id is invalid HTML. This holds for every selector in the
   handoff: targets, `scrollTrigger.trigger`, `pin`, `bounds`, scrub triggers,
   timeline `rootSelector` and scope selectors.
3. The trigger is one of:
   - no wrapper and no `scrollTrigger`, which becomes an on-load animation;
   - `scrollTrigger: { trigger, start, end, scrub? }` inside the tween's vars -
     with a truthy `scrub` it becomes scroll-scrub, without it scroll-reveal
     (plays once on enter).

For hover, click, or any other event trigger, use a native interaction payload.
Although the product recognizes a narrow listener wrapper, the handoff contract
does not bless DOM-query/event-listener code because a tiny wrapper change sinks
the entire script.

Keep `vars` a plain object literal - strings, numbers, booleans, `null`, simple
arrays, and supported nested option objects. No function values, no computed
keys, no template-literal interpolation. Use GSAP property shorthand (`x`, `y`,
`scale`, `rotation`, `opacity`). Give every standalone tween a meaningful
literal `id`; give every timeline a meaningful `id` in its options. f0 uses the
id as the editable animation name instead of inventing a generic import label.

For repeating items, target one broad class and author one stagger. A number is
accepted; an object may use literal `each`, `amount`, `from`, `ease`, `grid`,
`axis`, `repeat`, and `yoyo`. Use `amount` for a count-independent total spread,
or `each` for fixed spacing. Never render a loop that emits one tween per DOM
node: the importer preserves the selector-level group and the runtime applies
the stagger once across all matches.

`scrollTrigger` may contain literal `trigger`, `start`, `end`, `scrub`, `once`,
and the pinning keys `pin`, `pinSpacing` and `anticipatePin`. All of them are
carried into the native trigger, so a pinned scroll story authored as one
scrubbed tween arrives pinned:

```html
<script>
  gsap.to('.panel', {
    xPercent: -300, ease: 'none',
    scrollTrigger: { trigger: '.stage', start: 'top top', end: 'bottom top',
                     scrub: true, pin: true }
  });
</script>
```

Two details worth getting right, because both change the feel:

- **`scrub: true` and `scrub: <number>` are different.** `true` locks progress
  1:1 to scroll; a number is catch-up smoothing in SECONDS (`scrub: 1` is the
  usual buttery default). Both are carried; pick deliberately.
- **`start` is kept on a reveal too**, not only on a scrub. `start: 'top 80%'`
  on a non-scrubbed `scrollTrigger` is honoured rather than falling back to the
  default threshold, and `once: true` is carried with it.

`pin` may be `true` or a selector; a selector becomes the pin target. What is
still outside the grammar: `onUpdate` and other callbacks, ranges computed from
layout, DOM-node targets, and keyframe objects. Those need the native f0
interactions payload.

## What is lost, and what is kept

- `duration`, `delay`, `ease`, `stagger`, `repeat` and `yoyo` are lifted into
  playback. **Everything else left in vars becomes the keyframes.**
- **A looping tween converts.** `repeat` becomes f0's `loop` and `yoyo` becomes
  `alternate`, so a float, a pulse or a breathing orb stays an editable
  interaction. A timeline is unnecessary for a single looping tween.
  `repeat: -1` is infinite; a positive count is kept as a count. `yoyo` needs a
  `repeat` beside it to mean anything.

  ```html
  <script>
    gsap.to('.orb', { y: -12, duration: 2, repeat: -1, yoyo: true,
                      ease: 'sine.inOut', scrollTrigger: { trigger: '.orb' } });
  </script>
  ```
- The callback keys `onComplete`, `onStart` and `paused` are still stripped -
  there is nowhere for a function to live in a declarative interaction.
- `delay: i * 0.2` inside a supported loop is promoted to a real stagger;
  `stagger: 0.1` and literal stagger objects convert directly.
- A static literal `gsap.timeline({ id, defaults, scrollTrigger, delay, repeat,
  yoyo })` converts as one native timeline. Literal labels and GSAP position
  strings/offsets are retained as editable timing. A variable-assigned timeline
  and a directly chained timeline are both supported.
- Timeline callbacks/functions, dynamic targets or values, DOM measurements,
  nested child `scrollTrigger`s, layout-dependent `grid: 'auto'`, and overlapping
  writes to the same selector/property are not statically reconstructable. The
  whole script is preserved as opaque page code, which is a validation failure
  for an editable handoff. Translate those shapes to the native payload.
- `ScrollTrigger.create()` and hand-written scroll listeners never convert. Use
  **Run as live sandbox** only when the user explicitly chooses faithful playback
  over element-level editability.
- A tween with no listener and no `scrollTrigger` becomes a native on-load
  animation.
- **Never describe a script as convertible merely because its individual GSAP
  calls use `from`/`to`/`fromTo`.** The whole `<script>` must contain only the
  supported direct calls or one supported static timeline. The BusWhere-style
  pattern of querying DOM, measuring the viewport, building ranges/keyframes,
  then passing DOM nodes to GSAP is code, not the constrained importer format.
- CSS `@keyframes` used by a top-level rule convert to load-triggered
  animations (any number of stops) and the CSS is removed. See the next
  section for what that conversion loses, and how to keep an animation as CSS.

## Shapes that convert but play differently

Each of these passes the routing gate and still imports WRONG. All were found
on a real handoff and traced to the importer or runtime; `validate-handoff.mjs`
warns on every one.

**CSS animations: keep them as CSS unless they are simple.** A top-level
`animation:` is converted into an f0 interaction, and the conversion loses:
- `%` in a translate (`translateX(-50%)` becomes `-50px`), so marquees stall;
- `animation-timeline` / `animation-range` (a view or scroll timeline becomes
  a 1s on-load animation);
- pseudo-element targets (`::before`/`::after` can't be animated by an
  interaction, so they never play);
- keyframes that animate only custom properties;
- every animation after the first in a comma-separated `animation:`;
- `steps()` (it becomes linear).

Wrap the `animation` declaration in
`@media (prefers-reduced-motion: no-preference) { ... }`. Non-size media
blocks ship verbatim as global CSS: the motion plays as authored in Preview
and Export (not on the editor canvas) and doubles as the reduced-motion
guard. Don't use one `@keyframes` name both there and in a top-level rule:
the converter strips the keyframes it consumed.

**A load timeline triggers on its first tween's target.** Without a
`scrollTrigger`, the importer makes the FIRST tween's selector the trigger
(`gsap-timeline.ts`). A timeline that crossfades sibling elements
(`.set('.clip-2', ...)`, `.to('.clip-3', ...)`, ...) therefore imported with
`.clip-2` as the trigger, and every tween collapsed onto the class the clips
share as opacity 0 -> 0: the hero showed no video at all. For a looping
sequence over siblings, use a native carousel (but see the fade caveat below)
or a small code element; for a one-shot sequence, make the container the first
target and state both ends of every tween with `fromTo`. Don't use `.set()` to
establish states.

**The fade carousel fades every slide at once.** `transitionType: 'fade'` tweens
the outgoing slide to 0 and the incoming to 1 together (`power2.out`), so
mid-transition both are part-transparent over the background. For slides that
occupy the same spot with different content (turntable videos, before/after)
that reads as a ghost silhouette. Use it for cards and text; for overlapping
media, a code element that fades the current one out to the background and then
the next one in.

**A load trigger fires once per element its target matches.** A load
timeline whose first target is a shared class (three `.hero-line`s, or a
`.section` class the converter picked) is fired once per match, on every
page that has one. Lead each load timeline with a tween on ONE unique element
(the copy wrapper; a hold tween `{ opacity: 1 } -> { opacity: 1 }` is fine).

**Rest load-animated elements at their first frame.** f0's runtime starts
after the first paint, so an element whose CSS rests visible shows its final
state, then snaps to the from-state and animates: the copy appears, vanishes
and enters again. Give it the from-state opacity in CSS (`opacity: 0`) and
show it under `prefers-reduced-motion: reduce` with `!important`.

**Never trigger on an element whose start state has no size.** A scroll
reveal fires from an IntersectionObserver on the trigger element's rendered
box, so a fill that starts at `scaleY(0)` (or `scale: 0`, or `width: 0`) is a
zero-height line the observer barely sees: the bar stayed empty on a real
import. Trigger on a sibling or parent with a real box (the number it counts
with, its card) and keep the collapsed element as the animated target.

**Scroll timelines: one owner per element and property.** f0 builds every
scroll-scrub timeline when the page loads, and each one paints its start
state then, in import order, so the LAST one built wins:
- `immediateRender: false` is stripped;
- a later timeline's `.to()` on opacity or a transform gets the identity
  start (opacity 1, scale 1, 0), which paints at load;
- a `.to()` on any other property records its start value at load and never
  re-reads it, so scrolling back restores that load-time value.

So the GSAP habit of "first timeline uses `fromTo`, later ones use `.to()`"
breaks. Give each extra timeline its own wrapper element (an outer
`.panel-out` that the exit animation owns, while the entry animation owns
`.panel`) and state both ends with `fromTo`.

**Scrubbed tweens that share a trigger need equal lengths.** f0 groups
standalone scrubbed tweens with the same `scrollTrigger.trigger` into one
timeline and maps the scroll range over the LONGEST. A tween without a
duration counts as 0.5s, so next to a 6s stagger it finishes in the first
twelfth of the range and then jumps. Give every tween on a trigger the same
`duration` + stagger span.

**Scrub smoothing is not honoured in Preview.** `scrub: 1` plays like
`scrub: true`.

**Interactions are project-wide.** An imported interaction runs on every page
whose elements match its class selectors. Identical simple tweens are
de-duplicated, but a timeline present on two imported pages is imported twice
and both copies drive the same elements (a `from: 'random'` stagger then
flickers). One class animated by differently-named tweens on different pages
gets all of them everywhere. Use one tween (same name and values) per class
across pages, and don't import near-duplicate page variants into one project.
`build-f0-export.mjs` warns on both.

**Local scripts run, but late and everywhere.** A folder or zip import inlines
a local `<script src>` and keeps it as an "Imported script" code element. It
runs only in Preview and Export, on every page of the project, and can run
before f0 has built its own animations. It cannot reach imported GSAP: f0
rebuilds tweens in its own runtime without your `id`s, and `window.gsap` may not
exist, so `gsap.getById()` finds nothing. To pause or drag a loop from a
script, run the loop as a CSS animation (see above) and control it with
`element.getAnimations()`. Guard every lookup, because the script also runs on
pages that don't have the element.

**If a page deliberately keeps its own scroll script** (a sticky stage whose
script writes CSS custom properties per frame, by the user's choice over
editable motion), it imports as an Imported script and plays in Preview and
Export only. Make it survive the import:
- Read every media URL from the element (`video.getAttribute('src')`,
  `img.src`), never from a string in the script: f0 rewrites element
  attributes to hosted URLs and leaves script strings alone.
- A script that fetches a clip as a blob (so it can seek on a local static
  server without byte-range support) must fall back to the plain `src` when
  the fetch fails; hosted storage may refuse the cross-origin fetch and
  serves ranges anyway.
- Expect it to run on every page: look elements up and return early.
- Not yet verified in f0 Preview: layouts driven by custom properties the
  script updates every frame (`flex-grow: calc(1 + var(--o) * 9)`), and
  scripts that move a section between containers at a breakpoint. Check
  both in Preview before calling the handoff done.

## Media scrub is DECLARATIVE - mark the element, write no script

**Reach for this whenever scroll position should drive a video, a frame
sequence, or a Lottie.** It is the primitive behind the "cinematic scroll" look
- a product shot rotating as you scroll, a hero clip advancing frame by frame,
an exploded diagram assembling. If the brief says scrub / frame-by-frame /
scroll-driven footage / "video that plays as you scroll", this is the answer,
and it is two attributes.

What NOT to do, because all three convert to nothing and ship as opaque code:

- a `<canvas>` or TSX element that paints frames itself,
- a hand-written `ScrollTrigger` whose `onUpdate` sets `video.currentTime`,
- a GSAP timeline tweening a `currentTime` proxy object.

There is no analyzable GSAP idiom for `video.currentTime = ...` or
`lottie.loadAnimation(...)` driven by a ScrollTrigger, so media scrub is wired by
**attributes on the element** instead. Opt in with the marker (bare attribute,
`""` or `"true"` = on; `"false"` / `"0"` / `"off"` = off).

```html
<!-- Lottie: frames driven 0 -> 100% across the scroll span -->
<div data-f0-lottie="https://cdn/hero.json" data-f0-lottie-scrub
     data-f0-renderer="svg"></div>

<!-- Video: currentTime driven by scroll -->
<video src="https://cdn/clip.mp4" muted playsinline data-f0-video-scrub></video>

<!-- Image sequence: flip-book frames driven by scroll -->
<div data-f0-image-sequence='{"baseUrl":"/seq/","files":["1.jpg","2.jpg"]}'
     data-f0-image-sequence-scrub
     data-f0-image-sequence-fit="cover"></div>
```

- The image-sequence manifest may be `{ baseUrl?, files: [...] }` JSON, a plain
  JSON array, or a comma / newline separated list. `-fit` takes `cover`,
  `contain` or `fill`.
- Shared optional attributes on any marked element: `data-f0-scrub-start`
  (default `"top bottom"`), `data-f0-scrub-end` (default `"bottom top"`), and
  `data-f0-scrub-trigger="<selector>"` to observe scroll somewhere else.
- A `<video>` can be marked directly, or a WRAPPER can carry
  `data-f0-video-scrub` to opt its inner `<video>` in.
- Ship a Lottie as `<div data-f0-lottie="...">`, **not** a `<lottie-player>` web
  component.
- A media element WITHOUT a marker just plays or loops as normal. The marker is
  the only opt-in.

### mp4 specifics

- `muted` and `playsinline` are required in practice: without them mobile
  browsers refuse inline playback and hand you a fullscreen player instead.
- Add `preload="auto"`. Scrubbing seeks, and a video with no buffered data
  cannot seek smoothly - this is the usual cause of a scrub that "sticks" on
  first scroll.
- Practical encoding note, not a product rule: seeking lands on keyframes, so
  footage authored with a dense keyframe interval scrubs smoothly and a
  long-GOP export judders. If a clip must scrub frame-accurately, an image
  sequence is the more reliable choice than an mp4.
- Host at a stable, CORS-accessible URL. The same applies to sequence frames.

### Choosing between mp4 and an image sequence

- mp4: one request, far smaller, right for longer or full-bleed footage where
  exact frame landing does not matter.
- Image sequence: every frame is its own image, so it lands exactly and never
  judders, at the cost of many requests and much more weight. Right for short,
  precise, product-turntable style sequences.

### When the scrub is part of a bigger timeline

The markers wire a self-contained scroll-scrub. If the media has to advance as
one track inside a larger choreography, drop the marker and put it in the
native payload instead, as a `simple` animation on a `scroll-scrub` trigger with
`playback: { "duration": 1, "ease": "none" }` and one of these keyframe shapes:

```json
{ "mediaControl": { "kind": "video", "action": "scrub" } }
{ "mediaControl": { "kind": "lottie", "path": "https://cdn/hero.json",
                    "renderer": "svg", "startPercent": 0, "endPercent": 100 } }
{ "imageSequence": { "frames": ["/seq/1.jpg", "/seq/2.jpg"], "fit": "cover" } }
```

Use the markers by default - they are shorter and they survive editing better.
Reach for the payload only when the media is genuinely one layer of a timeline.

## SVG draw, morph and motion path

These are not separate animation types - they are ordinary `simple` animations
with **special keyframe keys**, so you can express them as normal GSAP vars and
let the converter carry them through. Use f0's key names, not the GSAP plugin
syntax:

```html
<script>
  // Draw a stroke on scroll-reveal
  gsap.from('.logo-path', {
    svgDraw: { start: '0%', end: '0%' },
    duration: 1.2, ease: 'power1.inOut',
    scrollTrigger: { trigger: '.logo', start: 'top 80%' }
  });

  // Follow a path, scrubbed
  gsap.to('.ball', {
    motionPath: { path: '.curve-path', autoRotate: true, start: 0, end: 1 },
    ease: 'none',
    scrollTrigger: { trigger: '.path-section', start: 'top center', end: 'bottom center', scrub: true }
  });
</script>
```

The runtime loads `DrawSVGPlugin`, `MorphSVGPlugin`, `MotionPathPlugin`,
`SplitText`, `Draggable`, `InertiaPlugin`, `Flip`, `ScrollTrigger` and
`CustomEase`, so all of these are real once they land. Keep the vars a plain
nested object literal, exactly like `scrollTrigger`.

**Verify these landed** in the Import Report rather than assuming: they ride the
generic keyframe path, so a typo in a key name does not error - it just arrives
as an unknown property.

## Text split

`splitText` on the vars (`"chars" | "words" | "lines"`, plus a mask option) is the
supported way to get per-character or per-line reveals. Do not hand-roll a split
by wrapping every character in a `<span>` - that produces hundreds of elements the
user then has to live with in the layer tree.

## Writing converter-safe blocks

- No `import`, `require`, `DOMContentLoaded`, helper, variable, loop,
  conditional, listener, callback, or DOM access. Put only direct supported GSAP
  calls in a classic script block.
- Animate only selectors that exist in the final HTML. A tween pointed at
  nothing fails silently at runtime.
- Target classes, not ids. `gsap.to('#cta', ...)` converts, but it hands the
  user an animation that binds a single element and breaks on duplication. Put
  a class on the element and animate that. The one place an id still appears is
  inside SVG, where a `clipPath` / `mask` / gradient can only be referenced by
  id - that is a paint reference, not an animation hook.
- `gsap.from` sets the start state at run time. Do not compensate with persistent
  `opacity: 0` or `display: none`, which can strand content when motion is off.
- One timeline per element and property across all scroll timelines (see
  "Shapes that convert but play differently"); use wrapper elements rather
  than `immediateRender: false` or a later `.to()`.
- Do not wrap converter-safe GSAP in `window.matchMedia`, `gsap.matchMedia`, or
  an `if`; that turns the whole block into opaque code. For native payloads put
  the decorative interaction under a top-level media scope such as
  `scope: { "type": "media", "query": "(prefers-reduced-motion: no-preference)" }`.
  The interaction settings' reduce-motion toggle is not yet applied by the
  runtime, so do not rely on it: use that native media scope, or keep the
  motion in CSS inside a `@media (prefers-reduced-motion: no-preference)`
  block.
- Keyboard and ARIA behavior belongs in semantic HTML or a native stateful
  interaction. Do not add imperative accessibility code to a convertible motion
  block.

---

# 6. The native interaction model (everything GSAP cannot say)

The GSAP subset in section 5 covers static tweens and timelines. f0's own
interaction schema covers a great deal more, and it is what the editor, the
preview and the published site all run. Knowing the vocabulary tells you what
to ask for, and what to hand over.

## Animation types

| Type | What it is |
| --- | --- |
| `simple` | one tween: keyframes + trigger. What a standalone GSAP call produces. |
| `timeline` | multi-layer timeline, per-property tracks (`style`, `transform`, `action`, `plugin`), per-layer `startOffset`, nestable precomps. Keyframe-at-0 is a "from". |
| `carousel` | slider / marquee / fade controller, with bullet + arrow pickers and per-bullet labels. |
| `auto-animate` | state-to-state animation of a subtree; an indexed variant gives you a carousel-of-keyframes. |
| `morph` | element-to-element morph. |
| `variant-animate` | animate between declared variants. |
| `follow-mouse` | RAF cursor follow: smoothing, distance cap, look-at, reverse-look-at, hide-cursor, offsets. |
| `form-submit` | validation, submit action (none / email / webhook / custom), success and failure outcomes. |
| `layout` | FLIP-style class-swap layout animation. |

## Triggers, and their options

Fifteen, and this is the complete set.

| Trigger | Options |
| --- | --- |
| `load` | `delay` |
| `click` | `reverseOnClickOutside` |
| `hover` | none |
| `focus` | none |
| `scroll-reveal` | `viewport`, `once`, `start`, `startOffset`, `threshold` |
| `scroll-scrub` | `start`, `end`, `startOffset`, `endOffset`, `scrub`, `pin`, `pinTarget`, `pinSpacing`, `anticipatePin` |
| `scroll-inertia` | `scrollInertia` (`smoothing`, `strength`) |
| `mouse-position` | `axis` (`x`/`y`/`both`), `scope` (`element`/`window`), `smooth`, `distance`, `onlyOnHold`, `fromCurrentPosition`, `keepAtLastLocation` |
| `follow-mouse` | the same pointer family - it runs a RAF follow loop rather than scrubbing progress |
| `mouse-rotate` | `rotateDirection` (`cw`/`ccw`/`both`), `scope` |
| `swipe` | `direction` (`up`/`down`/`left`/`right`), `threshold`, `reverse` |
| `drag` | `axis`, `mapToProgress`, `bounds` (selector or `{minX,maxX,minY,maxY}`), `inertia` (`strength`, `bounce`, `snapGrid`), `collideEdges`, `maxTravel`, `travelDirection` |
| `resize` | `mode` (`range`/`every`), `minWidth`, `maxWidth`, `debounce` |
| `page-unload` | `delay`, `prevent` |
| `form-submit` | `preventDefault` |

Every trigger also takes `groupSelector` (key animations per ancestor match),
`animationTarget` (animate something other than the trigger), `instanceScope`
(`off` = one singleton across all matches), `reverseOnSibling` and `yoyo`.

Beyond tweens, the plugin set includes counter, typewriter, text-scramble,
quick-mask, lottie-control, video-control, image-sequence-scrub, spline-control
and the SVG adapters.

## Which of these survive a drag-and-drop today

This is the part to be precise about, because the gap is silent.

**Importable from a dropped HTML file:**

- CSS `@keyframes` (needs a `0%` and a `100%`) - becomes a load-triggered
  animation.
- Direct calls in the GSAP subset from section 5 - become named `simple`
  interactions, or one grouped timeline when compatible calls clearly form one
  same-section/same-trigger choreography.
- Static literal `gsap.timeline()` chains - become one named `timeline`
  interaction with one selector-group layer per target.
- Special keyframe keys carried on those tweens - `svgDraw`, `svgMorph`,
  `motionPath`, `splitText`.
- Media scrub via the `data-f0-*-scrub` markers.

**Not reconstructed from markup alone:** dynamic/overlapping timelines,
carousel, auto-animate, variant-animate, form-submit, follow-mouse, layout,
drag/inertia, and trigger options that have no GSAP equivalent (`swipe`,
`resize`, `page-unload`, `groupSelector`, `instanceScope`). Unsupported GSAP is
kept as page code in full-page preview/export, but it arrives as a script, not
editable canvas motion. That is not an acceptable substitute when the user
asked for editable motion. Encode the native payload below; choose a live
sandbox only for an explicitly opaque import.

**For all of those, carry the native payload instead** (below). It is imported
as authored - every animation type, `timeline` included - rather than inferred,
so nothing has to be guessable from a tween.

## Carousels, tabs and accordions need a BOUND INTERACTION

This is the most common "I built it and it does nothing" case, so it is worth
being blunt: **markup alone never moves.** There is no CSS-only carousel and no
class you can add that starts a runtime.

What the controller does when a `carousel` interaction is bound to a container:

- It STAMPS the runtime classes itself - `f0-carousel`, plus `f0-carousel-h` or
  `-v` for the axis, or `f0-carousel-fade` for the fade variant, and `f0-slide`
  on each direct child. **You do not write these**, and writing them by hand
  without an interaction just gets you the layout with no behaviour.
- It manages `f0-active` / `f0-prev` / `f0-next` on the slides as state changes.
- It reads `--f0-visible` and `--f0-gap` for track metrics and translates the
  SLIDES (never the clipping container). It WRITES `--f0-visible` inline from
  "Visible slides", rounded to an integer, so a fractional value of yours
  (`1.15` for a peek of the next slide) is overwritten. For a peek, give the
  slides an authored width that outranks `.f0-carousel:not(.f0-carousel-fade) > *`
  (two classes and a child combinator, e.g. `.deck .track > .slide { flex: 0 0 86%; }`);
  slide offsets are measured with `offsetLeft`, so any width steps correctly.

What YOU write: a container whose DIRECT CHILDREN are the slides, plus whatever
nav elements you want, each with a stable class you can point the config at.

```json
{
  "id": "hero-carousel",
  "name": "Hero carousel",
  "trigger": { "type": "load", "target": ".hero-carousel" },
  "animation": {
    "type": "carousel",
    "definition": {
      "target": "trigger",
      "transitionType": "slide",
      "transitionDuration": 400,
      "loop": true,
      "autoPlay": true,
      "autoPlayDelay": 4000,
      "pauseOnHover": true,
      "prevSelector": ".carousel-prev",
      "nextSelector": ".carousel-next",
      "bulletSelector": ".carousel-dots"
    }
  }
}
```

Tabs run on the same controller (`fade` variant, panels as the direct children);
accordions use `f0-accordion-panel`, which ships with `overflow: hidden` so a
height animation clips correctly. `f0-tab` ships with `cursor: pointer`.

Inside flowmo you would bind this with the carousel preset. In a HANDOFF FILE,
put the definition in the interactions payload below - that is the only way a
dropped file arrives with a working carousel.

## The native payload: authored in, authored out

Anything the converter cannot express, the page can simply CARRY. Put the
definitions in an inert JSON block and they are imported as real f0
interactions - not reconstructed, not approximated:

```html
<script type="application/json" data-f0-interactions>
{
  "interactions": [
    {
      "id": "hero-carousel",
      "name": "Hero carousel",
      "trigger": { "type": "click", "target": ".carousel-next" },
      "animation": { "type": "carousel", "definition": { "target": ".slides" } }
    }
  ],
  "timelines": {}
}
</script>
```

- `type="application/json"` is inert by spec, so it never executes and is never
  re-attached as a script. This is the form to author.
- **A timeline's `rootSelector` must be the element that CONTAINS everything the
  timeline moves - never the page, never `body`.** The timeline panel derives its
  layers from the subtree under that root, so a page-level root hands the user a
  timeline scoped to the whole document instead of the section they animated. Point
  it at the nearest wrapper that holds every moving element: for a hero timeline
  moving `.hero-title` and `.hero-cta`, that is the `.hero` section. It may be
  nested as deep as you like. If a timeline moves elements from two different
  sections, that is a sign it should be TWO timelines, one rooted in each.
  (The import repairs an obviously-wrong root where it can, and reports when it
  cannot - do not rely on that, author it correctly.)
- A `timeline` interaction references its timeline by `animation.definition.timelineId`;
  put the `TimelineDefinition` in the `timelines` map under that id. **A timeline
  interaction whose timeline is missing is dropped** - a dangling reference
  compiles to nothing and reads as "my animation vanished".
- Ids are RE-MINTED on import (so a payload can never overwrite an interaction
  already on the canvas) and selectors are SCOPED to the import (so an imported
  `.card` rule does not bind every `.card` in the project). Author plain, bare
  selectors and let the import scope them.
- `animation.definition.target: "trigger"` is a SENTINEL meaning "the element
  the trigger resolved to", not a selector. It is left alone.
- Every top-level branch of a comma group (`.a, .b`) is scoped independently;
  commas inside `:is()` or attribute values remain intact.
- Malformed entries are skipped individually and reported; they do not take the
  rest of the payload down.

## Mandatory handoff validation

Before telling the user that an HTML file is ready to drag into f0, validate the
ACTUAL final file with the bundled conservative mirror of the importer rules:

```bash
node /absolute/path/to/flowmo-authoring-contract/scripts/validate-handoff.mjs \
  /absolute/path/to/page.html
```

It warns, without failing, on any id used as a hook - `#id` CSS rules, `#id`
GSAP targets, `#id` selectors in the payload. Clear those before handing over.

This is a release gate, not an optional lint. Do not claim the file will import
as editable motion unless the command exits successfully. The validator is
deliberately stricter than the importer so it can reject an ambiguous script but
never bless one that becomes opaque code. It also checks that every native
timeline interaction carries the timeline it references.

If the validator reports a mixed or unsupported script, do one of these before
handoff:

1. Reduce the effect to supported direct calls or one static literal timeline
   with literal class selectors, literal vars, and meaningful ids; or
2. Remove the imperative animation script from the import artifact and encode
   the complete choreography in `<script type="application/json"
   data-f0-interactions>`.

Never work around a failed validation by using **Run as live sandbox** when the
user asked for an editable page. A sandbox is intentionally one opaque embed;
it preserves playback but forfeits element-level editing.

For an editable import artifact, prefer the inert `application/json` payload.
Do not add an executable `window.__F0_INTERACTIONS__` bootstrap merely to make
the file play standalone: that changes the handoff's script routing surface. A
separate standalone/export artifact may use the runtime bootstrap, but it is not
the file certified by this editable-handoff validator.
