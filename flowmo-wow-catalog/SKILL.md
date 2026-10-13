---
name: flowmo-wow-catalog
version: 1
family: web
description: |
  Picks and builds a page's one signature "wow" moment in flowmo (f0): what
  counts as a real wow, the Tier-1 technique catalog (A1-D3) with the f0
  mechanism each routes to, the banned-as-Tier-1 list, the six-axis
  anti-convergence ledger so consecutive pages do not converge, and the
  screenshot-safe initial-paint rule. Ports Higgsfield's wow-maker and
  wow-catalog craft to f0's interactive-element and author_animation
  mechanisms. Use when: "make this feel more impressive", "what's the wow
  moment here", "this page is boring/flat", picking a signature effect for a
  hero/section, choosing between a WebGL and a scroll effect, or auditing
  whether two builds look too similar. NOT for: craft/typography/layout
  (use flowmo-design-recipe), single-tween/trigger mechanics (use
  flowmo-motion-design), interactive-element scoping (use
  flowmo-interactive-design), or the full seam-locked camera journey (use
  flowmo-scroll-scrub).
surfaces: [assistant-web, flowgen-web-node, designer, mcp]
kinds: [page, dashboard]
tools: [designer:list_interactives, designer:insert_interactive, designer:set_interactions, assistant-web:create_interactive_element, assistant-web:attach_interactive_to_element, assistant-web:author_animation]
presets: presets/tier1-catalog.json
renditions:
  designer-page: [designer]
chain_with: [flowmo-scroll-scrub, flowmo-interactive-design, flowmo-motion-design, flowmo-design-recipe]
derived_from: https://github.com/higgsfield-ai/skills
---

# flowmo wow catalog

Every page ships with exactly one deliberate, memorable moment: the thing a
visitor would describe to someone else. This package picks it from a real
catalog instead of the first idea that comes to mind, and routes it to a
real f0 mechanism instead of leaving it as a vague effect description. Pair
with **flowmo-design-recipe** for the surrounding craft floor and
**flowmo-motion-design** / **flowmo-interactive-design** for the mechanics
once a technique is picked.

## What counts as a real wow moment (done-criteria)

A page is not done until it clears all of these, not only the general craft
bar:

1. **One Tier-1 technique, fully built**, chosen from the catalog below and
   pairing with the page's actual concept (a "precision" brief wants
   focus/calibration physics; an "ascent" brief wants climbing/parallax
   depth). A one-sentence note on why the pairing fits belongs in the build
   notes.
2. **It is not one of the banned-as-Tier-1 patterns** below. Those are
   seasoning, never the answer to "what's the wow."
3. **It is interactive or scroll-responsive, not a passive ambient loop.**
   A background that plays the same motion regardless of what the visitor
   does does not satisfy this on its own.
4. **It is screenshot-safe and reduced-motion-safe** (see the two sections
   below). A wow moment that only exists after JS kicks in, or that leaves
   a blank/invisible page for reduced-motion users, is not done.
5. **It differs from the previous build in this session on the
   anti-convergence axes** (below), not only in superficial coloring.

A full-site seam-locked camera journey is its own dedicated build (the
**flowmo-scroll-scrub** package covers it); this package's catalog is for
the single-page or single-section signature moment.

## The three f0 routes

Every technique below reduces to one of three real f0 mechanisms. Reach for
the plainest one that can do the job; do not build a WebGL host for
something a CSS tween already does.

1. **WebGL / particle / shader-class effects** -> a pre-built live
   background via `list_interactives` + `insert_interactive` when the
   catalog has a matching preset, or a bespoke
   `create_interactive_element` when it does not. Follow
   **flowmo-interactive-design**'s isolation rule: attach to ONE element,
   never the page root; a global/ambient effect (cursor spotlight, a
   page-wide particle field) is its own dedicated full-viewport layer, not
   a wrapper around the page.
2. **Canvas frame-scrub / cinematic scroll effects** -> `author_animation`
   on a `scroll-scrub` trigger for the live canvas, or the declarative
   `data-f0-video-scrub` / `data-f0-image-sequence-scrub` markers for a
   pre-rendered clip or frame sequence in a file handoff. The full seam-
   locked version of this is the **flowmo-scroll-scrub** package; load it
   before attempting a multi-scene camera journey.
3. **Cursor-follow / spotlight / trailing effects** -> `author_animation`'s
   `mouse-position`, `follow-mouse`, or `mouse-rotate` triggers (or the
   native interactions payload in a file handoff) when the effect is a
   tween on existing elements, or a global interactive layer per
   **flowmo-interactive-design** when it needs true per-frame canvas
   drawing (a trailing plexus, a custom cursor).

Never reach for a hand-written `requestAnimationFrame` loop, a manual
`window.addEventListener('scroll', ...)`, or a raw DOM script to build any
of these; each has a native f0 route above.

## The Tier-1 catalog

The full catalog with each item's f0 route, mobile degradation, and
reduced-motion fallback lives in `presets/tier1-catalog.json`
(`flowmo-wow-catalog/tier1-catalog@1`). Thirteen techniques across four
families:

- **A. Film scrub family** (scroll plays a generated or sourced video): A1
  single-shot hero scrub, A2 long-form chaptered scrub, A3 product
  turntable, A4 seam-locked scroll scrub (the full animated-website
  journey; build it via **flowmo-scroll-scrub**, not from this package
  alone).
- **B. Layered depth family** (one image becomes a scene): B1 cutout
  parallax rig, B2 grade-shift interaction pair, B3 3D subject scene.
- **C. Canvas/pixel family** (the image itself is alive): C1
  displacement/liquid hover, C2 particle dissolve, C3 scroll-driven mask
  reveal.
- **D. Spatial layout family** (the page itself moves unusually): D1
  horizontal cinema rail, D2 sticky-stack chapters, D3 kinetic type opener.

Pick the technique that pays off the page's actual concept, not the first
one that comes to mind. Cinema tier: one Tier-1 technique plus motivated
reveals elsewhere. Spectacle tier: one Tier-1 technique plus a second beat
mid-page from a different family, plus a custom cursor.

## Implementation contract (all techniques)

- **Input-to-response latency must feel physical.** A scroll-bound technique
  reads progress off `author_animation`'s `scroll-scrub` trigger (`scrub`
  set to a smoothing value, not a bare boolean, for anything that should
  feel weighted); a cursor-bound technique reads off `mouse-position` /
  `follow-mouse` / `mouse-rotate`. Never approximate either with a
  hand-rolled per-frame state loop, and animate only `transform` and
  `opacity`, never a layout property, on the hot path.
- **Mobile degradation and reduced-motion fallback are declared per
  technique**, not left to chance: every entry in `presets/tier1-catalog.json`
  carries its own `mobile_degradation` and `reduced_motion` fields. Read the
  chosen entry's fields and build both, not only the desktop/full-motion
  path.
- **f0 has no server-render pass for an interactive element to diverge
  from.** `list_interactives` / `insert_interactive` / `create_interactive_element`
  all compile and mount a client-side component into its host element at
  load, in the browser, on both the live canvas and the exported page
  (`src/lib/interactive/runtime.tsx`, `runtime-bundle-entry.ts`) - there is
  no separate SSR output that could show something different. This is f0's
  actual version of the source catalog's SSR/client-only tagging: the
  practical guarantee is that whatever markup sits inside the host element
  BEFORE the runtime script mounts is exactly what a headless screenshot or
  a no-JS view shows, so compose that resting content as a real finished
  frame (see Screenshot-safe initial paint below) rather than leaving the
  host empty and trusting JS to fill it in time.

## Banned as Tier-1

These do not count as the page's wow moment, no matter how well built; they
may exist as seasoning elsewhere on the page:

- An autoplay ambient loop with no interaction or scroll response.
- A generic fade-in reveal (the baseline scroll-reveal every page already
  gets, per **flowmo-motion-design**, is not a signature moment).
- Particles behind text with no interaction.
- A marquee/ticker strip.
- Tilt-on-hover cards with nothing else going on.

## Anti-convergence ledger

Two pages built back-to-back in the same session must not read as
siblings. Before locking the build, check what the PREVIOUS page in this
session used on these six axes and differ on at least four of them:

1. Palette family (already a hard ban on repeat, per
   **flowmo-design-recipe**).
2. Type pairing (do not repeat the exact display face two builds running).
3. Hero architecture (image-as-canvas, split, masked, rail, ...).
4. Tier-1 technique from the catalog above. Exception: the seam-locked
   scroll scrub (A4 / **flowmo-scroll-scrub**) is the default for a full
   website build and is exempt from this no-repeat axis by design; when two
   consecutive builds are both that journey, differ on the world/subject
   and the journey shape instead, and still differ on the other axes.
5. CTA garment set (whatever button/link visual treatments the previous
   build used; zero overlap with this build).
6. Corner/border language (sharp vs. soft vs. pill vs. hairline-ruled).

For the first build in a session, derive all six from the brief's actual
material world (the real nouns the business touches, e.g. steel, paper,
steam, moss, vinyl) rather than reaching for a generic default; if a choice
would look at home in any template, re-roll it.

## Screenshot-safe initial paint

The first rendered frame, before any JS or animation has run, must look
intentional: a finished hero, not a blank canvas waiting for a viewport
trigger. This ties directly to **flowmo-motion-design**'s FOUC rule: never
write `opacity: 0` or `display: none` into persistent CSS on an animated
element. For every technique in the catalog, the initial paint is either
the composed resting frame (film-scrub families) or the fully assembled,
undistorted state (canvas/pixel families) - never an empty container that
only becomes visible once a scroll or interaction event fires. A full-page
headless screenshot taken at load must show a complete-looking page.
