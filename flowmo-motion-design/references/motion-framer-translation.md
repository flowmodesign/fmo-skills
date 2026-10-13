# Translating Motion / Framer Motion (React) to f0

Part of the flowmo-motion-design skill package - see the package's SKILL.md for
routing.

f0 cannot import React, so it cannot import Motion (formerly Framer Motion)
components either. A `motion.div` with `initial` / `animate` / `whileInView`
props, a `<AnimatePresence>`, or a `useScroll` hook arrives as nothing: there is
no runtime for it. Authors and agents still arrive thinking in that vocabulary,
so this page maps each Motion idea to the f0 carrier that says the same thing.

Pick ONE carrier per effect (the authoring contract's rule):

- **[GSAP]** a converter-safe GSAP block: direct `gsap.from/to/fromTo` calls or
  one static `gsap.timeline()`, class selectors, literal vars, a literal `id`.
  In the live editor, the same entries go to `author_animation`. Hover, click
  and other event listeners are NOT part of the blessed handoff grammar.
- **[native]** a native interaction: `author_animation` with a `trigger_type`
  live, or an entry in the inert `<script type="application/json"
  data-f0-interactions>` payload in a handoff file. Payload `playback.duration`
  is in MILLISECONDS; GSAP `duration` is in seconds.
- **[CSS]** plain CSS: transitions, `:hover` / `:active` / `:focus-visible`
  states, and `@keyframes` kept inside a
  `@media (prefers-reduced-motion: no-preference)` block.
- **GAP** - f0 has no equivalent today. Say so; do not fake it with a script.

The full handoff grammar, the payload shape and the validator live in
**flowmo-authoring-contract** (`references/motion-handoff.md`). This page only
translates; it does not restate those rules.

## Defaults that carry over

- **Tween by default.** Most Motion code uses a spring because that is Motion's
  default, not because the design needs one. A fixed-duration tween is easier
  to edit on the f0 timeline.
- **Ease-out to enter, ease-in to leave.** Arriving things decelerate
  (`power3.out`, `power4.out`); leaving things accelerate (`power3.in`).
  Symmetric loops use `sine.inOut`. Scroll-scrubbed tweens use `ease: "none"`.
- **Springs for gesture-driven or interruptible motion** - a hover that can be
  left mid-way, a drag release, a toggle pressed twice. There, a spring's
  ability to start from the current velocity is the point.
- Durations: small UI moves 0.15-0.3 s, cards and copy 0.4-0.7 s, hero moments
  up to ~1 s. An elastic or bounce ease needs ~0.9 s or more to read.

## Mount and in-view

| Motion | f0 | Carrier |
| --- | --- | --- |
| `initial` + `animate` on mount | `gsap.from` (or `fromTo`) with no `scrollTrigger` = on-load animation | [GSAP] |
| `whileInView` | `scrollTrigger: { trigger, start: 'top 80%' }` without `scrub` = scroll-reveal | [GSAP] |
| `viewport: { once: true }` | `once: true` in the `scrollTrigger` | [GSAP] |
| `viewport: { amount }` / `margin` | the `start` string (`'top 80%'`, `'top center'`) | [GSAP] |
| `transition.delay` | `delay` (seconds) | [GSAP] |
| `initial={false}` (no mount animation) | author nothing; the element rests in its final state | - |

`gsap.from` sets the start state at run time. Never compensate with a persistent
`opacity: 0` in CSS.

## Springs -> eases

f0's named ease vocabulary (the motion preset library's eases) covers the
common spring feels with plain GSAP eases, which every carrier can use:

| Motion spring feel | GSAP ease | Library name | Notes |
| --- | --- | --- | --- |
| gentle, no overshoot (high damping) | `power3.out` / `power4.out` | SNAP / SOFT_LAND | the safe default for most `type: "spring"` code |
| long travel, critically damped | `expo.out` | GLIDE | slides from off-screen |
| small overshoot | `back.out(1.7)` | OVERSHOOT_SMALL | playful, safe for UI |
| large pop | `back.out(2.4)` | OVERSHOOT_LARGE | confident; too much for body copy |
| loose spring, visible wobbles (low damping) | `elastic.out(1, 0.55)` | SPRING | wants ~0.9 s or more |
| tight spring, one soft wobble | `elastic.out(1, 0.75)` | SETTLE | the grown-up SPRING |
| `bounce` / gravity drop | `bounce.out` | DROP | wants ~0.9 s or more |
| `ease: "easeInOut"` (tween) | `power2.inOut` | SMOOTH | |
| `ease: [x1, y1, x2, y2]` | `cubicBezier(x1,y1,x2,y2)` | - | native playback ease |

**An exact spring** (when the stiffness/damping numbers matter) goes ONLY in a
native interaction's `playback.ease`. The runtime parses two forms and turns
them into a custom ease:

- positional physics: `spring(mass, stiffness, damping, velocity)`, all four
  numbers, e.g. `spring(1, 170, 26, 0)`;
- perceptual: `spring({ duration: 0.5, bounce: 0.25 })` (seconds, bounce 0..1).

Never put `spring(...)` inside a GSAP block: plain GSAP cannot parse it, so the
file's own preview and any standalone playback fall back to a default ease.
A spring ease is still a fixed-duration curve here; it does not carry real
velocity between interrupted plays.

## Variants and orchestration

| Motion | f0 | Carrier |
| --- | --- | --- |
| parent/child `variants` | one tween per role on a class selector; no parent/child propagation exists | [GSAP] |
| `staggerChildren: 0.08` | `stagger: 0.08` (or `{ each: 0.08 }`) on ONE tween whose target is the children's shared class | [GSAP] |
| `staggerChildren` with a fixed total | `stagger: { amount: 0.6 }` | [GSAP] |
| `staggerDirection: -1` | `stagger: { each, from: 'end' }` | [GSAP] |
| `delayChildren` | `delay` on the children's tween, or a timeline position | [GSAP] |
| `when: "beforeChildren"` / `"afterChildren"` | a `gsap.timeline()` with the parent tween and the children tween in order, position `'>'` | [GSAP] |
| per-property `transition` (opacity 0.2 s, y 0.6 s) | two tweens on DIFFERENT properties, the second at position `'<'` | [GSAP] |
| `repeat: Infinity, repeatType: "reverse"` | `repeat: -1, yoyo: true` | [GSAP] |
| `repeatType: "loop"` | `repeat: -1` | [GSAP] |
| `repeatType: "mirror"` | `repeat: -1, yoyo: true` (closest) | [GSAP] |
| keyframe arrays `x: [0, 20, 0]` | a timeline of `.to` steps; keyframe objects inside vars do not convert | [GSAP] |

Never clone a tween once per child. Two tweens writing the same property of the
same selector in one block make the whole block opaque; split the roles onto a
wrapper and its child, or use the native payload.

## Gestures

| Motion | f0 | Carrier |
| --- | --- | --- |
| `whileHover` | native `hover` trigger: plays on enter, REVERSES on leave; or a plain `:hover` transition | [native] / [CSS] |
| `whileTap` | native `click` trigger (`yoyo: true` toggles per press, `reverseOnClickOutside` closes it); or `:active` | [native] / [CSS] |
| press-and-hold that releases on pointer up | no press/release trigger | GAP (use `:active` in CSS) |
| `whileFocus` | native `focus` trigger (reverses on focus-out); or `:focus-visible` | [native] / [CSS] |
| `drag` | native `drag` trigger | [native] |
| `drag="x"` | `axis: 'x'` | [native] |
| `dragConstraints` | `bounds` (a selector, or `{ minX, maxX, minY, maxY }`) | [native] |
| `dragMomentum` / `dragTransition` | `inertia: { strength, bounce, snapGrid }` | [native] |
| `dragElastic` (rubber band past the edge) | `inertia.bounce` is the nearest knob, not the same behaviour | partial |
| `whileDrag` | no while-dragging state | GAP |
| swipe / `onPan` with a direction | native `swipe` trigger: `direction`, `threshold` | [native] |

Every pointer interaction above is native or CSS, never a GSAP listener block.
Repeating cards keep one interaction on the shared class: the trigger defaults
to one instance per matched element.

## Layout and shared elements

| Motion | f0 | Carrier |
| --- | --- | --- |
| `layout` prop | `auto-animate` (recorded state snapshots) or `layout` (FLIP class swap) | editor-built |
| `layoutId` shared element | `morph` (source -> target bounds, resolved when the trigger fires; `reversible`) | [native] |
| lightbox / expand a tile | `morph` with `target: { kind: 'rect', ref: 'viewport' }` | [native] |
| tab underline that follows the active tab | `morph`, `source: '.tab-indicator'`, `target: { kind: 'trigger' }`, click on `.tab` | [native] |

`auto-animate` stores Flip snapshots recorded in the editor, so it cannot be
hand-written in a handoff. A `layout` definition can travel in the payload but
the handoff contract does not document it; build both in the editor.

## Exit and presence

| Motion | f0 | Carrier |
| --- | --- | --- |
| `<AnimatePresence>` + `exit` | f0 never unmounts elements | GAP |
| toggled panel / menu that closes | reversible native `click` (`yoyo: true`, `reverseOnClickOutside`) | [native] |
| modal or lightbox close | `morph` with `reversible: true` | [native] |
| exit as a timeline beat | the editor's Exit presets (fade out, sink, slide out), anchored to the layer's end | editor-built |
| exit before navigating away | native `page-unload` trigger (`delay`, `prevent`) | [native] |
| native `<details>` open/close | CSS `::details-content` + `interpolate-size` | [CSS] |

Exits accelerate (`power3.in`, `expo.in`) and hold opacity until about half
way, so the eye reads a departure rather than a dissolve.

## Scroll-linked

| Motion | f0 | Carrier |
| --- | --- | --- |
| `useScroll` + `useTransform` | a scrubbed tween, `ease: 'none'`, `scrollTrigger: { trigger, start, end, scrub: true }` | [GSAP] |
| `useScroll({ target, offset })` | `trigger` + `start` / `end` strings | [GSAP] |
| scroll progress bar (`scaleX: scrollYProgress`) | `fromTo('.progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.page', start: 'top top', end: 'bottom bottom', scrub: true } })` with `transform-origin: left` | [GSAP] |
| pinned scroll story | `pin: true` in the `scrollTrigger` | [GSAP] |
| `useScroll` driving `video.currentTime` | the `data-f0-video-scrub` marker; no script | markup |
| `useSpring` over scroll progress | native `scroll-inertia` trigger (`scrollInertia: { smoothing, strength }`) | [native] |
| `useVelocity` (skew/tilt by scroll speed) | `scroll-inertia` (emits velocity) | [native] |

`scrub: 1` smoothing plays like `scrub: true` in Preview, so do not rely on it
to fake a spring; use `scroll-inertia`.

## Pointer-driven motion values

| Motion | f0 | Carrier |
| --- | --- | --- |
| `useMotionValue` from pointer x/y (tilt, parallax by cursor) | native `mouse-position` trigger (`axis`, `scope`, `smooth`) scrubbing a tween | [native] |
| element that follows the cursor | `follow-mouse` animation (smoothing, look-at, hide cursor) | [native] |
| rotate by circling the pointer | `mouse-rotate` trigger | [native] |

## Text, counters and SVG

| Motion pattern | f0 | Carrier |
| --- | --- | --- |
| per-letter / per-word variants | `splitText: 'chars' \| 'words' \| 'lines'` (+ `splitMask`) with a stagger | [GSAP] |
| animated number (`animate(count, 100)`) | native `counter` keyframe key; or a standalone `textContent` tween with `snap: 'textContent'` | [native] / [GSAP] |
| `pathLength` 0 -> 1 | `svgDraw` | [GSAP] |
| `offsetDistance` along a path | `motionPath: { path, autoRotate, start, end }` | [GSAP] |
| typewriter / scramble | `typewriter` / `textScramble` keyframe keys | [native] |

## Reduced motion

| Motion | f0 | Carrier |
| --- | --- | --- |
| `useReducedMotion` / `MotionConfig reducedMotion="user"` on an interaction | top-level `scope: { "type": "media", "query": "(prefers-reduced-motion: no-preference)" }` on the native interaction | [native] |
| CSS loops and decoration | keep the `animation` inside `@media (prefers-reduced-motion: no-preference)` | [CSS] |
| gating a converter-safe GSAP block | a `matchMedia` or `if` around it makes the block opaque | GAP |

For the GSAP gap: move a purely decorative tween to a native payload with the
media scope, or keep it as CSS. The interaction settings' reduce-motion toggle
is not yet applied by the runtime; do not rely on it.

## Imperative control

| Motion | f0 | Carrier |
| --- | --- | --- |
| `useAnimate` / `animate()` sequence played on mount | one static `gsap.timeline()` with literal positions | [GSAP] |
| `controls.start()` from an event | a native trigger (click, hover, focus, scroll-reveal) | [native] |
| `controls.stop()` / seeking from page scripts | page scripts cannot reach imported motion (f0 rebuilds tweens without your ids) | GAP |

## Worked example: staggered card entrance

Motion intent: a grid whose cards rise and fade in, 80 ms apart, once, when the
grid scrolls into view (`variants` on the grid with `staggerChildren: 0.08`,
`whileInView`, `viewport={{ once: true }}`).

```html
<script>
  gsap.from('.feature-card', {
    id: 'Feature cards entrance',
    y: 32, opacity: 0, duration: 0.6, ease: 'power3.out',
    stagger: { each: 0.08, from: 'start' },
    scrollTrigger: { trigger: '.feature-grid', start: 'top 80%', once: true }
  });
</script>
```

One tween, one class selector, one stagger, literal vars, a meaningful `id`,
nothing else in the block. No `opacity: 0` in the stylesheet.

## Worked example: hover lift

Motion intent: `whileHover={{ y: -4, scale: 1.02 }}` with a quick spring.

Plain CSS, when nothing else needs to know about it:

```css
.price-card { transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1); }
.price-card:hover { transform: translateY(-4px) scale(1.02); }
@media (prefers-reduced-motion: reduce) {
  .price-card { transition: none; }
}
```

Or one native interaction, editable in the Interact panel (it plays on enter
and reverses on leave):

```html
<script type="application/json" data-f0-interactions>
{
  "interactions": [
    {
      "id": "price-card-lift",
      "name": "Price card lift",
      "scope": { "type": "media", "query": "(prefers-reduced-motion: no-preference)" },
      "trigger": { "type": "hover", "target": ".price-card" },
      "animation": {
        "type": "simple",
        "definition": { "target": "trigger", "keyframes": { "y": -4, "scale": 1.02 } }
      },
      "playback": { "duration": 250, "ease": "back.out(1.7)" }
    }
  ],
  "timelines": {}
}
</script>
```

Use one of the two, not both. Validate the final file with the authoring
contract's validator before handoff.
