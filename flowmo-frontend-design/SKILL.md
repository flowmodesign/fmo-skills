---
name: flowmo-frontend-design
description: Design and edit pages/sections in flowmo (f0) on its design-system foundation. Use for live HTML/CSS editing and, together with flowmo-authoring-contract, for HTML files intended for f0 Import page or drag-and-drop.
---

# flowmo frontend design

**Always call `f0_design_system` first** — it returns the live cornerstone classes, `var()` tokens, and the CSS-tool decision table for THIS project. The notes below are the durable rules.

When the output is a file for **Import page** or drag-and-drop rather than a live
canvas edit, also load **flowmo-authoring-contract** and follow its file-handoff
representation rules. Do not put layout or copy inside JavaScript. If the file
contains motion, native interactions, or code elements, run the bundled handoff
validator on the exact final file before delivering it.

## Cornerstones, not a cage
flowmo's `ds-*` classes + `var(--token)` tokens are the **load-bearing foundation**. Build every page on them:
- **Layout / structure:** `ds-section`, `ds-container`, `ds-grid` (`ds-grid-2/3/4-column`), `ds-flex` (+ `ds-flex-center`/`-between`/`-column`), `ds-gap-*`.
- **Components:** `ds-button`, `ds-card`, `ds-badge`, `ds-input` — composed as **base + variant + size**, e.g. `ds-button ds-button-primary ds-button-medium`.
- **Typography:** `ds-heading-1…6`, `ds-text-body`/`-small`/`-caption`.
- **Repeated elements:** reuse element-type classes (`ds-feature-card`, `ds-list-item`, `ds-nav-link`, `ds-card-title`, `ds-card-description`) so editing one updates all — don't stack utilities on each.
- **Values:** use `var(--color-*)`, `var(--spacing-*)`, `var(--radius-*)`, `var(--shadow-*)`, `var(--text-size-*)`, `var(--font-*)` for anything with a matching token.

You **may** add NEW custom classes and NEW `:root` `--vars` — but only as ADDITIVE extensions for what the foundation doesn't cover. They compose with `ds-*` and still consume tokens. They never bypass or replace the foundation.

### Never
- Tailwind / Bootstrap / any utility-class framework.
- Reinvent a primitive that exists (no hand-rolled button when `ds-button` exists).
- Hardcode a value that has a matching token, or add a `var()` fallback (`var(--x)`, not `var(--x, #fff)`).
- Express a whole design as inline hardcoded styles to work around a tool. That breaks the design system.

## Which CSS tool writes what (the #1 source of wasted attempts)
- **New section/page → `create_content` / `build`.** Put `ds-*` classes on each element IN THE HTML. For descendant / `:hover` / `:nth-child` / `@media` rules, include a `<style>` block INSIDE the HTML — full CSS selectors work there and are guaranteed to match because the classes are on the elements. **This is the most reliable path for complex CSS.**
- **Complex selectors on EXISTING elements → `update_stylesheet`.** It supports descendant/pseudo/`:nth-child`/`@media` and creates rules. But the selectors MUST match elements already on the canvas. A "0 rules applied / no selectors match" result means the class isn't on any element yet — add the class (below), don't give up and inline.
- **One simple shared class → `apply_class_styles`** (`class_name` + `css` + `element_ids`). Single class only — it cannot express descendant/pseudo/`:nth-child`.
- **One element, one-off properties → `apply_styles`** (inline, element-scoped, no selectors).

## Page structure
- Page root is the only element that may carry a viewport-width px value. Inner containers use relative sizing (`%`, `auto`, `max-width`, `ds-container`).
- Structural containers (`section`/`header`/`footer`/`nav`) size to content — never a fixed pixel height.
- Give meaningful elements a `data-name`. Don't use engine-internal/protected classes (`page`, `text`, `rect`, `image`, `fmod`, …).
- Validate with `validate_canvas` before presenting — it flags fixed heights, collapsed sizes, non-canonical vars, empty sections, bad positioning.

## Hero elevation (mandatory on a page build)
A flat hero — text + button on a plain/gradient background, no image/video/interactive/decorative layer — is the single biggest failure mode. Every hero ships with at least one strong visual element (image, video, an interactive/3D layer, or decorative orbs/gradient mesh). For the interactive-layer route, see **flowmo-interactive-design**.
