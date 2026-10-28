---
name: flowmo-overview
version: 1
family: web
description: How to operate flowmo (f0) through the live editor and how to route editable HTML import/drop handoffs to the separate authoring contract. Use whenever inspecting, designing, editing, or preparing a page for f0. Use when starting any f0 task, to pick the golden path and route file handoffs correctly. NOT for the craft mechanics themselves — it is the map, not the mechanics; see flowmo-frontend-design / flowmo-motion-design / flowmo-interactive-design / flowmo-3d for those.
surfaces: [assistant-web, flowgen-web-node, section, mcp]
tools: [f0_health, f0_design_system, f0_get_html, f0_screenshot, f0_invoke, f0_list_tools, get_element_context]
triggers:
  - operate f0
  - f0 editor
  - inspect the page
  - golden path
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

Local previews must use the exact f0 runtime HTML/CSS defaults, available in
**flowmo-authoring-contract/references/runtime-baseline.md** or `f0_guide` topic
`mcp-html-baseline`. This floor and its page frame are preview-only and must
never be imported/persisted as authored CSS or content; f0 supplies them itself.

## Golden path for any task
1. `f0_health` — confirm the app is reachable and see open project tabs.
2. `f0_design_system` — **call this before writing any HTML/CSS.** It returns the cornerstone classes/tokens + the CSS-tool decision table. Call it once and remember it.
3. `f0_get_html` (a specific element id, or the active page) — read what exists before changing it.
4. `f0_screenshot` — SEE the design when you need to (it uploads + returns an image; it never inlines base64). Screenshot once to verify, then describe — not after every micro-edit.
5. Apply changes with `f0_invoke` — discover exact tool names + arg schemas via `f0_list_tools`.
6. Verify the current revision, bounded: start with a batched visual check with `f0_screenshot` at desktop and at mobile width, list everything wrong in both, fix it all in one batch, then verify the changed revision within the task budget and progress limits. Report anything still open instead of looping - open-ended screenshot-tweak-screenshot cycles burn the turn without converging.

Long generation runs: `flowgen_run_node` and `flowgen_run_nodes_parallel`
wait for the result, and for slow image or video models the tool call can time
out while the generation still completes in the app. On a timeout, don't rerun
(that spends credits again): read the node with `flowgen_get_node` and take the
new entry in `generatedImages` / `generatedVideos`.

## Working style (load-bearing)
- **Be verbal.** Narrate what you're about to do, what changed, and why — before and after each action.
- **Ask when unclear.** A short clarifying question beats a wrong change. Never restructure a page on an assumption.
- **Design change is not content change.** When asked for a design change, change ONLY styles/spacing/color/layout/visual treatment. Keep existing text, copy, labels, image subjects, and data exactly.
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

## Design-system guidance
Inspect the actual connected brand and design system before authoring. Reuse appropriate tokens/components and permit scoped custom classes, defined tokens and bespoke CSS. The system guides consistency; it does not mandate an accent count, hero recipe, font pairing, effect or visual count. Protect existing shared rules and bindings. Unsupported classes and undefined tokens are technical failures, not creative choices.

## Classes, not ids
Every hook is a **class**: CSS rules, GSAP/animation targets, scroll triggers, scope selectors, component classes. Never style or animate through an `id`, and never add an `id` just so a rule or tween can find an element — an id matches one element ever, so it breaks the moment a section is duplicated or a component reused, and the duplicate is invalid HTML. Class rules are also the only ones f0's class-level style tools can edit. Write an `id` only where something must be addressed programmatically and exactly: in-page anchor targets (`href="#pricing"`), form wiring (`<label for>`, `aria-labelledby`, `aria-controls`), and SVG internal references (gradients, `clipPath`, `mask`, `filter`, `<use>`), which have no class equivalent. Those ids carry no styles and no motion.

## Save tokens
- Read narrowly: inspect a specific element (`f0_get_html`/`get_element_context` with an id), not the whole page, unless you truly need the full tree. Avoid `get_canvas_state` with `include_html` unless necessary.
- Results from `f0_design_system` and `f0_screenshot` are compact by design. Don't re-fetch the design system each turn.

## Model routing
Honor explicit current compatible model preferences. In Auto use JEV task routing from the live capability/pricing catalog; prefer the least-cost model that can meet the task's requirements, and escalate on actual evidence. Show actual dispatched choices and meaningful fallbacks. Manual reasoning-model selections govern applicable reasoning work; image/video/mesh synthesis still uses capability-specific providers. External MCP clients own their conversational model and must not start a duplicate in-app loop.

## The three craft skills
- **flowmo-website-performance** — startup policies, hidden media, dependency timing, rendering budgets and exact native-ZIP/browser verification. Use on substantial imports and performance-affecting work; screenshots and quality triage alone do not prove performance.
- **flowmo-frontend-design** — the design system, which CSS tool to use, building pages/sections.
- **flowmo-interactive-design** — interactive code elements (React/WebGL/canvas), scope & isolation.
- **flowmo-motion-design** — GSAP motion (`author_animation`), scroll-scrub/pin, recipes, carousels/tabs/accordions.
- **flowmo-3d** — 3D scenes via the scoped tool family (`inspect_scene`/`edit_scene`/`keyframe_scene`/`apply_motion_preset` + shader, model-gen, field-animation): meshes, GLB, materials/layers, particles, effectors, cameras/lenses/rails, post-FX + wiring 3D to the timeline.
- **flowmo-design-craft** — general, tool-agnostic visual/motion/interaction principles.
