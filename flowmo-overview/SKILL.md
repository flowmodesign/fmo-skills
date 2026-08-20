---
name: flowmo-overview
description: How to operate flowmo (f0) through the live editor and how to route editable HTML import/drop handoffs to the separate authoring contract. Use whenever inspecting, designing, editing, or preparing a page for f0.
---

# Operating flowmo (f0)

f0 is a **live** visual editor. You inspect and drive the *running* canvas through the `f0` MCP server — you are editing a real project a user has open, not generating a static file.

## Stop and route file handoffs correctly

If the deliverable is an HTML/DESIGN.md file the user will drag, drop, or import
into f0, load **flowmo-authoring-contract** before authoring it. That contract is
mandatory even when this overview or the frontend/motion skills are already
loaded. Live-editor tool syntax is not the dropped-file grammar.

An editable handoff must remain selectable DOM with native interactions. Do not
replace it with Electron capture, an iframe, a live sandbox, or one opaque script
unless the user explicitly asks for a faithful non-editable embed. Run the
authoring contract's validator on the exact final file before delivery.

## Golden path for any task
1. `f0_health` — confirm the app is reachable and see open project tabs.
2. `f0_design_system` — **call this before writing any HTML/CSS.** It returns the cornerstone classes/tokens + the CSS-tool decision table. Call it once and remember it.
3. `f0_get_html` (a specific element id, or the active page) — read what exists before changing it.
4. `f0_screenshot` — SEE the design when you need to (it uploads + returns an image; it never inlines base64). Screenshot once to verify, then describe — not after every micro-edit.
5. Apply changes with `f0_invoke` — discover exact tool names + arg schemas via `f0_list_tools`.

## Working style (load-bearing)
- **Be verbal.** Narrate what you're about to do, what changed, and why — before and after each action.
- **Ask when unclear.** A short clarifying question beats a wrong change. Never restructure a page on an assumption.
- **Design change ≠ content change.** When asked for a design change, change ONLY styles/spacing/color/layout/visual treatment. Keep existing text, copy, labels, image subjects, and data exactly.
- **If it's unclear whether LAYOUT (structure/arrangement) should change too — ask first.**

## A design system is ONE system with TWO targets, and motion is part of it

flowmo's design system is not a palette. From a single token set it compiles two
real, editable reference masters:

- **WEB** - a full specimen page (navigation, hero, content system, carousel,
  tabs/comparison, component states, FAQ + form, footer), opened in the website
  Studio.
- **VIDEO** - a real f0 video document, not a picture of one: seven shots (title
  still, editorial bar, motion graphic, type-in-motion, type still, data story,
  outro resolve), each with its own timeline, composed on a master timeline as
  precomp layers so it plays back as an actual edit. Opened in the video editor.

Video is an ADDITIVE layer over the same system, never a second one. Same colors,
fonts and easing; only the SCALE changes, via `ds-target-video` and the
`--video-*` tokens (type scale, spacing scale, control height, safe area, aspect
ratio). So a change to the tokens is a change to the film as well as the page.

**Motion and interaction are part of the system, not decoration added after.**
Both masters carry real GSAP motion with a manifest: the web master ships reveal
recipes (fade-up, fade-scale, slide-up, word-up, line-mask, with optional
char/word/line text splits) authored so they materialize as NATIVE, EDITABLE
interactions in Studio - not a baked script; the video master carries per-shot
timelines. The system's `--ease-*` and `--transition-*` tokens are that motion's
personality and drive both targets.

## The cornerstone rule (see flowmo-frontend-design)
flowmo's `ds-*` classes + `var(--token)` design tokens are the **cornerstones** — build every page ON them. You MAY add custom classes/vars, but only as ADDITIVE extensions that compose with `ds-*` and still consume tokens. Never use Tailwind/Bootstrap. Never hardcode a value that has a matching token. Never inline a whole design as hardcoded styles to dodge a tool.

## Save tokens
- Read narrowly: inspect a specific element (`f0_get_html`/`get_element_context` with an id), not the whole page, unless you truly need the full tree. Avoid `get_canvas_state` with `include_html` unless necessary.
- Results from `f0_design_system` and `f0_screenshot` are compact by design. Don't re-fetch the design system each turn.

## Model routing (when you orchestrate subagents or pick a model per step)
- **Mechanical / automatic** work (a known tool sequence, applying a given style, repetitive edits, simple reads) → **Haiku**.
- **Planning, architecture, and clever/original DESIGN** decisions → **Opus**.
- **Routine executions** that aren't design-critical → **Sonnet** — escalate to Opus the moment real design judgement is needed.

## The three craft skills
- **flowmo-frontend-design** — the design system, which CSS tool to use, building pages/sections.
- **flowmo-interactive-design** — interactive code elements (React/WebGL/canvas), scope & isolation.
- **flowmo-motion-design** — GSAP motion (`author_animation`), scroll-scrub/pin, recipes, carousels/tabs/accordions.
- **flowmo-3d** — 3D scenes via `edit_scene` (meshes, GLB, materials/layers, particles, effectors, cameras, post-FX) + wiring 3D to the timeline.
- **flowmo-design-craft** — general, tool-agnostic visual/motion/interaction principles.
