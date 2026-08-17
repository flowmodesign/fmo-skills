# Motion and native-interaction handoff

## Contents

- Atomic GSAP conversion grammar
- Media scrub and SVG/text effects
- Native interaction/timeline payloads
- Stateful component bindings
- Mandatory motion validation

# 5. GSAP: exactly what converts

Use inline GSAP only for the small, directly convertible cases below. Each
accepted call becomes one native f0 interaction the user can scrub and edit. If
the choreography is more complex, skip imperative JavaScript and author the
native payload in section 6.

## The conversion conditions

All must hold. Import routing is **atomic per `<script>` block**: if one
statement in a block is outside this grammar, the whole block stays as code and
none of its tweens become editable interactions. Do not put helper functions,
DOM queries, variable setup, responsive `if` branches, callbacks, or computed
scroll math in a block you label convertible.

1. The call is `gsap.to`, `gsap.from` or `gsap.fromTo` - **not**
   `gsap.timeline()`.
2. The target is a **CSS selector string** (`'.hero-title'`). No DOM refs,
   variables, arrays, query helpers, or loops.
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
arrays, and one nested `scrollTrigger: {}`. No function values, no computed keys,
no template-literal interpolation. Use GSAP property shorthand (`x`, `y`, `scale`,
`rotation`, `opacity`).

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
  interaction - do NOT reach for a timeline just to get a loop, because that
  sinks the whole effect as opaque code. `repeat: -1` is infinite; a positive
  count is kept as a count. `yoyo` needs a `repeat` beside it to mean anything.

  ```html
  <script>
    gsap.to('.orb', { y: -12, duration: 2, repeat: -1, yoyo: true,
                      ease: 'sine.inOut', scrollTrigger: { trigger: '.orb' } });
  </script>
  ```
- The callback keys `onComplete`, `onStart` and `paused` are still stripped -
  there is nowhere for a function to live in a declarative interaction.
- `delay: i * 0.2` inside a loop is promoted to a real stagger; `stagger: 0.1`
  converts directly.
- `gsap.timeline()`, `ScrollTrigger.create()` and hand-written scroll listeners
  never convert. They are preserved as opaque page code, which is a validation
  failure for an editable handoff. Translate them to the native payload. Use
  **Run as live sandbox** only when the user explicitly chooses faithful playback
  over element-level editability.
- A tween with no listener and no `scrollTrigger` becomes a native on-load
  animation.
- **Never describe a script as convertible merely because its individual GSAP
  calls use `from`/`to`/`fromTo`.** The whole `<script>` must contain only the
  supported direct calls. The BusWhere-style pattern of querying DOM,
  measuring the viewport, building ranges/keyframes, then passing DOM nodes to
  GSAP is code, not the constrained importer format.
- CSS `@keyframes` convert to load-triggered animations, but only when the
  animation defines both a `0%` and a `100%` step.

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
    motionPath: { path: '#curve', autoRotate: true, start: 0, end: 1 },
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
- `gsap.from` sets the start state at run time. Do not compensate with persistent
  `opacity: 0` or `display: none`, which can strand content when motion is off.
- Do not wrap converter-safe GSAP in `window.matchMedia`, `gsap.matchMedia`, or
  an `if`; that turns the whole block into opaque code. For native payloads put
  the decorative interaction under a top-level media scope such as
  `scope: { "type": "media", "query": "(prefers-reduced-motion: no-preference)" }`
  or use the native reduce-motion setting. For CSS motion, use the corresponding
  `@media` rule.
- Keyboard and ARIA behavior belongs in semantic HTML or a native stateful
  interaction. Do not add imperative accessibility code to a convertible motion
  block.

---

# 6. The native interaction model (everything GSAP cannot say)

The GSAP subset in section 5 covers tweens. f0's own interaction schema covers a
great deal more, and it is what the editor, the preview and the published site all
run. Knowing the vocabulary tells you what to ask for, and what to hand over.

## Animation types

| Type | What it is |
| --- | --- |
| `simple` | one tween: keyframes + trigger. What the GSAP converter produces. |
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
- The GSAP subset from section 5 - becomes `simple` interactions with
  scroll-scrub / scroll-reveal / hover / click triggers.
- Special keyframe keys carried on those tweens - `svgDraw`, `svgMorph`,
  `motionPath`, `splitText`.
- Media scrub via the `data-f0-*-scrub` markers.

**Not reconstructed from markup alone:** timelines, carousel, auto-animate,
variant-animate, form-submit, follow-mouse, layout, drag/inertia, and the
trigger options that have no GSAP equivalent (`swipe`, `resize`, `page-unload`,
`groupSelector`, `instanceScope`). A `gsap.timeline()` in your file is KEPT and
runs as page code in full-page preview/export, but it arrives as a script, not
as editable canvas motion. That is not an acceptable substitute when the user
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
  SLIDES (never the clipping container).

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
- A comma group (`.a, .b`) is left unscoped, so prefer separate interactions
  over comma selectors if scoping matters.
- Malformed entries are skipped individually and reported; they do not take the
  rest of the payload down.

## Mandatory handoff validation

Before telling the user that an HTML file is ready to drag into f0, validate the
ACTUAL final file with the bundled conservative mirror of the importer rules:

```bash
node /absolute/path/to/flowmo-authoring-contract/scripts/validate-handoff.mjs \
  /absolute/path/to/page.html
```

This is a release gate, not an optional lint. Do not claim the file will import
as editable motion unless the command exits successfully. The validator is
deliberately stricter than the importer so it can reject an ambiguous script but
never bless one that becomes opaque code. It also checks that every native
timeline interaction carries the timeline it references.

If the validator reports a mixed or unsupported script, do one of these before
handoff:

1. Split every supported `gsap.from` / `to` / `fromTo` call into an atomic
   convertible script block with literal selectors and literal vars; or
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
