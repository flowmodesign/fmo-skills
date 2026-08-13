---
name: flowmo-overview
description: How to operate flowmo (f0) — the live visual web/video editor — through the f0 MCP server. Use this whenever you are inspecting, designing, or editing an f0 project: the tool map, working style, what to call before writing HTML/CSS, token-saving, and model routing. Start here, then load flowmo-frontend-design / flowmo-interactive-design / flowmo-motion-design for the specifics.
---

# Operating flowmo (f0)

f0 is a **live** visual editor. You inspect and drive the *running* canvas through the `f0` MCP server — you are editing a real project a user has open, not generating a static file.

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
