---
name: flowmo-frontend-design
version: 1
family: web
description: Design and edit pages/sections in flowmo (f0) on its design-system foundation. Use for live HTML/CSS editing and, together with flowmo-authoring-contract, for HTML files intended for f0 Import page or drag-and-drop. Use when the task is page/section layout, CSS, or the ds-* design system on the live canvas. NOT for motion/interactions (flowmo-motion-design), code-driven visuals (flowmo-interactive-design), or 3D scenes (flowmo-3d).
surfaces: [assistant-web, flowgen-web-node, section, mcp]
tools: [f0_design_system, build, update_stylesheet, apply_class_styles, apply_styles, validate_canvas]
writes: [structure, content, style]
triggers:
  - design system
  - build a page
  - hero section
  - ds-button
  - ds-grid
---

# flowmo frontend design

**Always call `f0_design_system` first** — it returns the live cornerstone classes, `var()` tokens, and the CSS-tool decision table for THIS project. The notes below are the durable rules.

When the output is a file for **Import page** or drag-and-drop rather than a live
canvas edit, also load **flowmo-authoring-contract** and follow its file-handoff
representation rules. Do not put layout or copy inside JavaScript. If the file
contains motion, native interactions, or code elements, run the bundled handoff
validator on the exact final file before delivering it.

For local HTML previews, use the exact generated runtime floor in
**flowmo-authoring-contract/references/runtime-baseline.md**, or read `f0_guide`
topic `mcp-html-baseline`. It is the same default CSS and page framing that
Preview/publish supply. Keep it separate and preview-only; never import or
persist that floor or its frame through `build`, `update_stylesheet` or a
design-system handoff. Import only authored content, tokens and custom CSS.

## Cornerstones, not a cage
flowmo's `ds-*` classes + `var(--token)` tokens are the **load-bearing foundation**. Build every page on them:
- **Layout / structure:** `ds-section`, `ds-container`, `ds-grid` (`ds-grid-2/3/4-column`), `ds-flex` (+ `ds-flex-center`/`-between`/`-column`), `ds-gap-*`.
- **Components:** `ds-button`, `ds-card`, `ds-badge`, `ds-input` — composed as **base + variant + size**, e.g. `ds-button ds-button-primary ds-button-medium`.
- **Typography:** `ds-heading-1…6`, `ds-text-body`/`-small`/`-caption`.
- **Repeated elements:** reuse element-type classes (`ds-feature-card`, `ds-list-item`, `ds-nav-link`, `ds-card-title`, `ds-card-description`) so editing one updates all — don't stack utilities on each.
- **Values:** use `var(--color-*)`, `var(--spacing-*)`, `var(--radius-*)`, `var(--shadow-*)`, `var(--text-size-*)`, `var(--font-*)` for anything with a matching token.

### The system covers video and motion too
The same token set drives a WEB master and a VIDEO master, and both carry real
motion. Two consequences when you build a page: the `--ease-*` / `--transition-*`
tokens are the system's motion personality - use them instead of inventing a
curve; and the `--video-*` scale tokens plus `ds-target-video` exist for
video-shaped surfaces, so don't hand-roll a second type scale for one. See
**flowmo-overview** for the full shape and **flowmo-motion-design** for authoring
the motion itself.

You **may** add NEW custom classes and NEW `:root` `--vars` — but only as ADDITIVE extensions for what the foundation doesn't cover. They compose with `ds-*` and still consume tokens. They never bypass or replace the foundation.

### Never
- Tailwind / Bootstrap / any utility-class framework.
- Reinvent a primitive that exists (no hand-rolled button when `ds-button` exists).
- Hardcode a value that has a matching token, or add a `var()` fallback (`var(--x)`, not `var(--x, #fff)`).
- Express a whole design as inline hardcoded styles to work around a tool. That breaks the design system.

## Which CSS tool writes what (the #1 source of wasted attempts)
- **New section/page → `build`.** Put `ds-*` classes on each element IN THE HTML. For descendant / `:hover` / `:nth-child` / `@media` rules, include a `<style>` block INSIDE the HTML — full CSS selectors work there and are guaranteed to match because the classes are on the elements. **This is the most reliable path for complex CSS.**
- **Complex selectors on EXISTING elements → `update_stylesheet`.** It supports descendant/pseudo/`:nth-child`/`@media` and creates rules. But the selectors MUST match elements already on the canvas. A "0 rules applied / no selectors match" result means the class isn't on any element yet — add the class (below), don't give up and inline.
- **One simple shared class → `apply_class_styles`** (`class_name` + `css` + `element_ids`). Single class only — it cannot express descendant/pseudo/`:nth-child`.
- **One element, one-off properties → `apply_styles`** (inline, element-scoped, no selectors).
- **Every selector is a CLASS selector — never style by `id`.** No `#hero { … }`, and never add an `id` so a rule can find an element. An id matches one element ever, so an id rule dies the moment the section is duplicated, and the duplicate is invalid HTML. Class rules are also the only ones the class-level tools above can edit. Write an `id` only where something must be addressed programmatically: an in-page anchor target (`href="#pricing"`), form wiring (`<label for>`, `aria-labelledby`, `aria-controls`), and SVG internal references (gradients, `clipPath`, `mask`, `filter`, `<use>`) which cannot be referenced any other way. Those ids carry no styles.

## Page structure
- Page root is the only element that may carry a viewport-width px value. Inner containers use relative sizing (`%`, `auto`, `max-width`, `ds-container`).
- Structural containers (`section`/`header`/`footer`/`nav`) size to content — never a fixed pixel height.
- Give meaningful elements a `data-name`. Don't use engine-internal/protected classes (`page`, `text`, `rect`, `image`, `fmod`, …).
- Validate with `validate_canvas` before presenting — it flags fixed heights, collapsed sizes, non-canonical vars, empty sections, bad positioning.

## Hero elevation (mandatory on a page build)
A flat hero — text + button on a plain/gradient background, no image/video/interactive/decorative layer — is the single biggest failure mode. Every hero ships with at least one strong visual element (image, video, an interactive/3D layer, or decorative orbs/gradient mesh). For the interactive-layer route, see **flowmo-interactive-design**.

## States
Every interactive element (`ds-button`, links, `ds-input`, cards that act as links, tabs) needs its states designed, not left to the browser. When two apply at once, the higher one wins: **disabled > loading > active/pressed > focus > hover > default**. A disabled button never shows hover; a loading button keeps its size and blocks a second press.

Focus ring recipe: on `:focus-visible` (keyboard focus, not mouse clicks), a 2px ring in `var(--color-ring)` sitting 2px off the element, the gap showing the background - `outline: 2px solid var(--color-ring); outline-offset: 2px;`, or, where an outline would be clipped, `box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-ring);`. Inside a `ds-section-dark` band the tokens are rebound, so the same rule still contrasts. `ds-button` already ships a `--color-ring` focus outline; match it on custom interactive classes. Never write `outline: none` on focus without putting an equally visible replacement in the same rule.
