---
name: flowmo-scroll-scrub
version: 1
family: web
description: |
  Direct and prepare scroll-scrubbed hero footage (video, image sequence, or
  Lottie) for a flowmo (f0) page, and verify the markup satisfies f0's native
  scroll-scrub runtime. Covers journey shape (one continuous film by default,
  a multi-leg chain only when the brief needs several distinct worlds), the
  footage contract, the encode contract, and the runtime requirements
  checklist for the data-f0-*-scrub markers plus the live author_animation
  scroll-scrub trigger. Use when: "scroll-scrubbed video", "scroll plays the
  film", "Apple-style scroll video", "cinematic scroll hero", "scrollytelling",
  "pinned scroll story", "image sequence scrub". NOT for ordinary
  scroll-reveal/parallax entrance motion (use flowmo-motion-design), for
  designing a page's visual direction before building it (use
  flowmo-reference-boards), or for hand-writing a scroll listener, rAF loop,
  or currentTime assignment - f0's scrub runtime already implements that (see
  Runtime requirements below).
surfaces: [assistant-web, flowgen-web-node, mcp, designer]
kinds: [page]
tools: [assistant-web:author_animation, assistant-web:make_scrubbable_video, assistant-web:generate_scrubbable_video, designer:add_scroll_scrub]
chain_with: [flowmo-wow-catalog, flowmo-reference-boards]
derived_from: https://github.com/higgsfield-ai/skills
renditions:
  designer-page: [designer:page]
---

# flowmo scroll-scrub

A scroll-scrub hero is footage whose playback position is driven by the
user's scroll position, not autoplay - the "Apple product page" effect. f0
already ships a native runtime for this. Your job here is threefold: direct
the footage and its sequencing, prepare it for hosting, and confirm the
markup wiring - not to hand-build a scroll controller.

## Route it right

- **Live canvas authoring:** `make_scrubbable_video` / `generate_scrubbable_video`
  wire an existing or freshly generated clip into a scroll-scrub element
  directly. For a configuration those tools don't expose, use
  `author_animation` with `trigger_type: "scroll-scrub"` (or an in-vars GSAP
  `scrollTrigger` with a truthy `scrub`, which the engine lifts into the same
  trigger) - see **flowmo-motion-design** for the full `author_animation`
  contract.
- **File handoff (Import page / drag-drop):** the declarative
  `data-f0-video-scrub` / `data-f0-image-sequence-scrub` /
  `data-f0-lottie-scrub` markers are the ENTIRE representation. Load
  **flowmo-authoring-contract** and its motion reference, and run its
  validator on the final file before delivery. This is documented in full in
  `docs/GSAP_IMPORT_CONVENTIONS.md` in the f0 repo.
- Either way, f0 already has a native scroll-scrub runtime. Reaching for a
  canvas element, a TSX interactive host, a hand-written `ScrollTrigger`, or a
  timeline that writes `currentTime`/frame index is the wrong route for this
  effect - see [Runtime requirements](#runtime-requirements) below.

## Journey shape - pick one

- **`single-shot` - the default.** ONE continuous take, scrubbed end to end
  by a single scrub element, with semantic HTML chapters (real elements, not
  baked-in text) pinned over it. Choose this for a brand, product, service,
  portfolio, or launch page. When in doubt, single-shot.
- **`multi-leg` - opt in only when the brief genuinely needs several distinct
  worlds or acts**, not "more scenes would look cooler". Chains several scrub
  elements/beats, each anchored to the previous leg's real last frame.

Full footage direction - the footage contract (framing, continuity, first/last
frame rules), the storyboard-grid planning trick, and multi-leg continuity (A/B
frame-exact handoff) - is in
[references/journey-and-footage.md](references/journey-and-footage.md). Read
it before directing or generating any scrub source.

## Encode and host the media

Someone has to encode and host the scrub source before the runtime can play
it: desktop vs mobile CRF/GOP targets, the "poster = exact first frame of the
FINAL encoded clip" rule, an aggregate byte budget for the page, and
CORS-accessible hosting. Full contract in
[references/encode-and-hosting.md](references/encode-and-hosting.md).

## Runtime requirements

f0's scrub player already implements the controller invariants a hand-rolled
scroll controller would otherwise need to reimplement: direct scroll-to-
progress seeking with late-load handling (an unready `<video>` never drops
its first seek), canvas-based image-sequence painting with byte-budgeted
frame residency, and lazy-loaded Lottie playback. It does NOT smooth or ease
the scrub position by default - that is the separate opt-in `scroll-inertia`
trigger - and it does NOT provide an automatic `prefers-reduced-motion`
fallback; author that explicitly when the brief needs one. This is a
REQUIREMENTS CHECKLIST to verify the markup satisfies - correct
`data-f0-scrub-start`/`data-f0-scrub-end`, `muted playsinline preload="auto"`
on `<video>`, a stable class (never an id), CORS-accessible hosting - not
something to hand-author. Never write a scroll listener, an rAF loop, or a
`currentTime` assignment for this effect; that is exactly the
flowmo-authoring-contract anti-pattern (scroll-scrubbed media is declarative).
Full checklist, verified against f0's own interactions runtime code, in
[references/runtime-requirements.md](references/runtime-requirements.md).

## QA before shipping

Poster/first-paint correctness, byte budget per breakpoint, mobile
degradation, reduced-motion fallback, scrub range sanity, and (for multi-leg)
seam sanity in both scroll directions. Full checklist in
[references/qa-checklist.md](references/qa-checklist.md).

## Craft baseline

Pair this with **flowmo-design-craft** for hierarchy/motion judgment and
**flowmo-frontend-design** for the `ds-*` tokens the chapter copy and
surrounding chrome should be built on. A scroll-scrub hero does not replace
the rest of the page's design-system discipline - it is one hero mechanic
among the patterns **flowmo-wow-catalog** catalogs, and its visual direction
should already be locked by **flowmo-reference-boards** before you generate
final footage.
