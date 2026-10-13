# Runtime requirements checklist

Part of the flowmo-scroll-scrub skill package - see the package's SKILL.md for
routing.

f0's scroll-scrub player is a native runtime, not something you author. This
section is verified directly against f0's own interactions engine -
`src/lib/interactions/triggers/scroll-anchor.ts`,
`src/lib/interactions/plugins/video-control.ts`,
`src/lib/interactions/plugins/image-sequence-scrub.ts`,
`src/lib/interactions/plugins/sequenceFrameStore.ts`, and
`src/lib/interactions/plugins/lottie-control.ts` - not restated from the
Higgsfield source's own (different) engine. What it actually implements, for
any element carrying `data-f0-video-scrub`, `data-f0-image-sequence-scrub`,
or `data-f0-lottie-scrub`:

- **Direct scroll-to-progress seeking, not Blob-URL loading.** The runtime
  measures the element's own bounding rect against the scroll-anchor
  start/end (`scrollScrubProgress`) and writes that 0..1 progress straight
  through: `video.currentTime = startAt + progress * (endAt - startAt)` for
  video, a canvas repaint for an image sequence, or a Lottie frame seek. The
  element's own `src` is seeked directly - there is no fetch-to-Blob step.
- **Late-load handling, not seek coalescing.** Until a `<video>` reaches
  `readyState >= HAVE_METADATA`, a `currentTime` write is silently discarded
  per spec, so the runtime remembers the last requested progress and replays
  it the instant `loadedmetadata` / `durationchange` / `canplay` fires,
  rather than losing the seek. It also promotes `preload` from `none` to
  `metadata` and calls `.load()` if the element hadn't started fetching yet -
  this is why `preload="auto"` on the authored `<video>` still matters: it
  removes the one avoidable stall on the very first scrub.
- **No lerp smoothing on `scroll-scrub` by default.** Progress maps 1:1 to
  scroll position - a fast flick seeks exactly as fast as the reader moved,
  with no easing toward the target. Catch-up smoothing exists only as the
  SEPARATE, opt-in `scroll-inertia` trigger kind
  (`trigger.options.scrollInertia.smoothing`, 0..1, default 0.3 - higher is
  laggier/smoother). The declarative `data-f0-*-scrub` markers always compile
  to plain `scroll-scrub` (1:1, never inertia) - reach for `author_animation`
  with `trigger_type: "scroll-inertia"` directly when a live-canvas build
  needs the laggier feel.
- **No "linger" ease-out after scroll stops.** There is no settle/ease
  behavior distinct from the direct mapping above - scrolling stops, the
  playhead stops exactly where scroll left it.
- **No automatic reduced-motion poster fallback.** `prefers-reduced-motion`
  is not read anywhere in this runtime for scroll-scrub. (A `reduceMotion`
  field exists on the interactions schema's `ContainerQuerySettings`, but
  nothing in the runtime consumes it.) If the brief needs a reduced-motion
  fallback, author it explicitly - e.g. a `@media (prefers-reduced-motion:
  reduce)` rule that hides the scrub element and shows a static poster in its
  place - never assume the runtime provides one for free.
- **Image sequence renders to a CANVAS, not `<img>`/`<picture>`.** The
  current frame is painted onto a canvas overlaid on the target element
  (`cover`/`contain`/`fill` fit). Frame residency is budget-managed, not
  all-resident: a sequence of 150 frames or fewer preloads eagerly (instant
  scrubbing); a longer one falls back to a windowed cache sized from the
  real decoded-frame byte cost against a default 192 MB bitmap budget, with a
  12-frame minimum resident window and a sparse "spine" (every 24th frame)
  kept resident so a big jump still paints something instead of a blank
  canvas while the new window loads. CORS is not optional here specifically:
  a cross-origin frame fetched without CORS taints the canvas and the
  readback throws a `SecurityError`.
- **Lottie loads `lottie-web` lazily from a pinned CDN build** (jsdelivr),
  one instance per target element; wiring the same target twice destroys and
  rebuilds the instance rather than stacking a second one.

**Do not author any of this.** Do not write a scroll event listener, a
`requestAnimationFrame` loop, or a `video.currentTime` / frame-index
assignment anywhere in a page that uses these markers - that duplicates
runtime behavior the marker already gets for free, and on a file handoff it
actively breaks import (see below). Your job is to verify the markup below is
correct, not to reimplement the player.

## Verify before shipping

**Video (`data-f0-video-scrub`)**
- [ ] The `<video>` element has `muted playsinline preload="auto"` - required
      for the browser to allow frame seeking without a user gesture.
- [ ] It carries a stable CLASS (never an `id`) so the runtime and any related
      styling/animation hooks can address it reliably across duplicates.
- [ ] `data-f0-scrub-start` / `data-f0-scrub-end` use the two-word grammar
      (`"<element-edge> <viewport-edge>"`, each of `top | center | bottom`) and
      actually bound the intended scroll span. Omit them only when the default
      (`top bottom` -> `bottom top`) is correct.
- [ ] If scroll should be observed on a different element than the video
      itself (e.g. a tall wrapping section), `data-f0-scrub-trigger` points at
      that element's class.
- [ ] The source is hosted CORS-accessible - see
      [encode-and-hosting.md](encode-and-hosting.md).
- [ ] The `poster`/first-paint image is the exact first frame of the deployed
      encoded clip.
- [ ] If the page needs a mobile-encoded source swapped in on a narrow
      viewport, it is wired as TWO marked elements (desktop and mobile),
      shown/hidden with ordinary responsive CSS - the marker/runtime has no
      built-in desktop/mobile source-swap of its own.
- [ ] If the brief calls for a reduced-motion fallback, it is authored as an
      explicit CSS rule - the runtime does not provide one automatically (see
      above).

**Image sequence (`data-f0-image-sequence-scrub`)**
- [ ] `data-f0-image-sequence` holds a valid manifest (object with
      `baseUrl`/`files`, a bare URL array, or a comma/newline list) and every
      referenced file resolves.
- [ ] `data-f0-image-sequence-fit` is set deliberately (`cover` for a
      full-bleed hero, `contain`/`fill` where that reads better).
- [ ] Frames are pre-hosted WebP/AVIF, CORS-accessible - required here more
      than anywhere else, since a cross-origin frame fetched without CORS
      taints the runtime's canvas and the readback throws.
- [ ] For a long sequence (over ~150 frames), byte budget was tested under
      the runtime's windowed-loading behavior (192 MB default bitmap budget,
      12-frame minimum window), not under an assumption that every frame
      stays resident at once.

**Lottie (`data-f0-lottie-scrub`)**
- [ ] The element is a `<div data-f0-lottie="...json">` - never a
      `<lottie-player>`/`<dotlottie-player>` web component (those import as
      unknown custom elements).
- [ ] A stable class exists for the scrub wiring to target (or the
      `data-f0-lottie` URL itself is stable enough to serve as the fallback
      selector).
- [ ] `data-f0-scrub-trigger` is set when the scrubbing scroll region differs
      from the Lottie element's own bounds.

## Live editor authoring (author_animation)

When authoring scroll-scrub directly in the live canvas rather than through a
file handoff, `author_animation` with `trigger_type: "scroll-scrub"` (or an
in-vars GSAP `scrollTrigger` with a truthy `scrub`, which the engine lifts
into the same trigger) drives the same runtime invariants above. Its
`trigger_config` takes the same start/end/scrub/pin shape - see
**flowmo-motion-design** for the full `author_animation` contract. The
`make_scrubbable_video` / `generate_scrubbable_video` tools wire an existing or
freshly generated clip into this pattern directly; reach for `author_animation`
by hand only when you need a configuration those tools don't expose.

## File handoffs (Import page / drag-drop)

A handoff that needs to arrive editable follows
**flowmo-authoring-contract**: the scrub markers above are the ENTIRE
representation - no `<script>` block, no scroll listener, no payload entry.
Adding a hand-written scroll/rAF/currentTime script alongside the markers does
not enhance the effect; it converts to opaque page code (or fights the native
wiring if it happens to also work) and fails the handoff's release gate. Run
the authoring contract's validator on the exact final file before delivery.
