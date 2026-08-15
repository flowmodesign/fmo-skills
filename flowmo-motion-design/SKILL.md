---
name: flowmo-motion-design
description: Author web motion in flowmo (f0) — reveals, fades, slides, staggers, text reveals, scroll-scrub, parallax, pinned scroll stories, and carousel/tabs/accordion components. Use for any "animate / motion / scroll / parallax / interactive" request on a website. Covers the author_animation GSAP tool, triggers, the motion recipe catalog, and the .f0-* component conventions.
---

# flowmo motion design

**Core rule: you write plain GSAP; the engine translates.** You never pick "simple vs timeline" — the converter decides (one selector + one tween → simple; multi-tween/sequenced/multi-target/`set` → timeline). A finished page is never static.

## Route by what the thing IS
1. **MOTION (the default)** — reveals, fades, slides, scroll-scrub, parallax, text reveals, staggers, hover/click tweens, choreography → **`author_animation`**.
2. **Stateful component patterns** — carousel, tabs, accordion, variant-animate, auto-animate, follow-mouse → component presets with `.f0-*` classes (below).

Inspect before editing with **`read_animations`**; change in place with **`update_animation`** (needs `interaction_id`).

## author_animation
- Pass `timeline` = a JSON array of GSAP entries + a `trigger_type` (and `trigger_config`), plus `element_id` or `target_selector`.
- Entry shape: `{ "method":"from"|"to"|"fromTo"|"set", "target":".sel", "vars":{…}, "position"?:"+=0.2"|"<"|">" }`.
- Durations in **seconds**; GSAP ease names (`"power3.out"`, `"back.out(1.7)"`, `"none"`).
- **Stagger** = `vars.stagger` (number, or `{ each, from:"center"|… }`). **Text split** = `vars.splitText:"chars"|"words"|"lines"` (+ `vars.splitMask`). No special tool — author them inline.
- **Triggers (all 15):** `load | click | hover | focus | scroll-reveal | scroll-scrub | scroll-inertia | mouse-position | follow-mouse | mouse-rotate | swipe | drag | resize | page-unload | form-submit`. Each takes its own `trigger_config` keys — pointer ones share `{ axis, scope, smooth, distance }`, `swipe` takes `{ direction, threshold }`, `drag` takes `{ axis, bounds, inertia, mapToProgress }`, `resize` takes `{ mode, minWidth, maxWidth, debounce }`. The tool description lists the full set per trigger.

### Scroll the GSAP-native way
Put `scrollTrigger:{ start, end, scrub, pin }` directly inside a tween's `vars` (exactly like real GSAP) — the engine LIFTS it into the f0 trigger and infers the type (has `scrub` → scroll-scrub; no `scrub` → scroll-reveal). Embed `scrollTrigger` **OR** set `trigger_type`+`trigger_config`, never both for the same value.
- Scrubbed parallax = an `ease:"none"` tween with `scrollTrigger:{ start:"top top", end:"bottom top", scrub:true }`.
- Full-page pinned scroll story = a multi-tween timeline on the page root, `trigger_type:"scroll-scrub"`, `trigger_config:{ "pin": true }` (start/end default `top top → bottom bottom`).
- scroll-scrub config keys: `{ start, end, scrub, startOffset, endOffset, pin, pinTarget, pinSpacing, anticipatePin }`.

## Scale motion to the brief
- **Baseline (every build):** hero parallax/scroll on the background, a text reveal on the headline (`splitText`), a staggered entrance for cards/list items in feature/testimonial sections. The build also auto-seeds scroll-reveal entrances on top sections — build on top of them.
- **Dial up** when the brief says interactive / animated / motion / scroll / immersive / 3D / parallax / particles / wow / engagement / launch. Don't ship a flat page on those — that's the top failure mode.

## Motion recipe catalog
`list_motion_recipes` returns ready-to-adapt GSAP tween lists (same entry shape). Adapt selectors to your elements. Examples: `title-scale-char-reveal` (signature scale-in + char stagger), `headline-word-up`, `line-mask-reveal` (clipped cinematic lines), `stat-count-up`, `svg-draw-on`, `svg-morph`, `motion-path-orbit`, `bg-parallax-drift`, `orb-breathe`, `card-grid-stagger` (use `amount` not `each`), `image-ken-burns`, `lower-third-slide`, `outro-logo-pop`, `kinetic-emphasis-word`.

## Component conventions (carousel / tabs / accordion)
- **Carousel** (`variant "slide"|"fade"|"loop"`): `.f0-carousel` on the SLIDE CONTAINER (direct children = slides). Nav: `.f0-carousel-prev`/`.f0-carousel-next`; pagination `.f0-carousel-bullets` (siblings near the carousel).
- **Tabs** (`variant "fade"(default)|"slide"`, runs on the carousel engine): `.f0-tabs` on the PANEL CONTAINER (direct children = `.f0-tab-panel`). Put `.f0-tab` buttons in a SEPARATE tab-bar (not inside `.f0-tabs`).
- **Accordion** (`variant "single"(default)|"multi"`): `.f0-accordion-item` wraps each row; `.f0-accordion-trigger` is the clickable header; `.f0-accordion-panel` is the collapsible body.
- **Reveals (repeating items):** `.f0-reveal` on each child (for a staggered `author_animation`, not a component preset).

## Importing existing GSAP / HTML (don't hand-author here)
If you're bringing in an **external** site/snippet (someone else's HTML+CSS+GSAP, a scraped page, a Figma/template export) rather than authoring motion natively, f0's importer auto-converts a constrained subset of GSAP/ScrollTrigger/Lottie into native interactions. Author the source in that subset (inline `<script>` `gsap.from/to/fromTo`, string selectors, `scrollTrigger` in vars, `data-f0-lottie` divs, `data-f0-*-scrub` markers — no timelines/DOM-refs/function-valued vars) or it gets dropped. Read the full conventions with **`f0_guide` topic `import`** before preparing or handing off importable code.

## FOUC / preview rules (tell the user)
- Never write `opacity:0` / `display:none` into persistent CSS on animated elements — let the runtime own starting state.
- Scroll-reveal / scroll-scrub / entrance animations PLAY IN PREVIEW (▶), not in the static design canvas (which shows the resting state). Live interactive/3D heroes DO render in the canvas. So a calm canvas with preview-only motion is expected — but a hero with no live 3D/interactive element is not.
