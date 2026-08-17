---
name: flowmo-interactive-design
description: Build and attach interactive code elements (React/WebGL/canvas/Three.js/particles) in flowmo (f0), including safe text/f0-tsx handoffs for Import page. Covers live tools, scope/isolation, and keeping content selectable.
---

# flowmo interactive design

Interactive elements compile author-supplied **TSX** into a live React component mounted inside a real f0 host element (`data-f0-id`). Their state/effects are isolated; CSS is scoped to the host; real f0 children pass through as `{children}` and stay selectable.

For a file the user will drag, drop, or import, also load
**flowmo-authoring-contract** and read its interactive-code reference. Encode the
component in an inert `<script type="text/f0-tsx">` block. Never use an ordinary
classic script to construct the page or attach global DOM behavior: it becomes
opaque page code, not an editable interactive element. Run the handoff validator
on the exact final HTML before delivery.

## Native engine FIRST — don't reach for code
Use the **native engine** (via `f0_invoke`) for: mobile menus, tabs, accordions, modals, drawers, sticky headers, dropdowns, click/hover UI, carousels, reveals. See **flowmo-motion-design** for the `.f0-tabs`/`.f0-carousel`/`.f0-accordion` component presets and GSAP.

Only use **`create_interactive_element`** for genuinely code-driven visuals: particle systems, WebGL/Three.js, generative art, data viz, physics, 3D.

## Two tools
- **`attach_interactive_to_element`** — DEFAULT when the user already has elements they want behavior on ("make these cards a carousel", "add scripted parallax to this hero"). Promotes an EXISTING element into an interactive host; its children stay as `{children}`.
- **`create_interactive_element`** — greenfield visuals with no pre-existing elements to attach to. Pass `parent_id` to place it; for a hero background pass `parent_id = heroSectionId` from the build's sections map (without it, the host lands at the page root as a sibling of every section — wrong).

`update_interactive_element` edits in place (prefer `tsx_replace`/`field_patches` for small tweaks). `detach_interactive` removes the payload but keeps the element + children.

## SCOPE & ISOLATION — the #1 bug
**Attach to ONE specific element — a single section or component the user pointed at. NEVER the page root or a multi-section / page-level wrapper.** Wrapping the whole page in one interactive host destroys per-section isolation (the engine rejects page-root and any element holding 2+ sections). If you're unsure which element the user means, call `get_canvas_state` to find the right section id, or ask — do not default to the page.

## GLOBAL / page-wide effects (a layer, not a wrapper)
Interactive elements are NOT only encapsulated per-section widgets. Page-wide effects — cursor-follow spotlight / trailing plexus, custom cursor, an ambient WebGL/canvas field behind ALL sections, a drifting aurora/gradient background, a grain/noise overlay — are a first-class pattern. Do them as a **dedicated full-viewport LAYER, never by wrapping sections**: `create_interactive_element` **without** `parent_id` (it mounts at the page root as its own sibling layer), with host css `position:fixed; inset:0; pointer-events:none;` and `z-index:0` (behind content) or a high z-index (overlay). This layer **wraps nothing**, so it's isolation-safe and allowed — the opposite of the forbidden "wrap the page in a host". The "landed at page root" placement notice is expected and correct here. Read the cursor via a window `pointermove` listener; gate the rAF loop on `isActive`; one signature global layer per page.

## TSX authoring contract (NEVER inline visible markup)
This is the #1 interactive bug: inlined JSX renders as a single unselectable black box and every control collapses into the right panel.
- Anything the user might restyle/retext/reposition — headings, paragraphs, buttons, links, list items, sections, real images — MUST be a real f0 element, **never** inline JSX.
- Pass visible content as the **`html`** parameter (with optional `css`). It runs through the same importer as `create_content`, so each tag becomes a real, selectable f0 element under the host in the SAME call. Render that tree with `{children}`.
- Correct shape of an interactive host's TSX: scripted refs (canvas / WebGL / scroll listeners / rAF), effect-only CSS for overlays, and `{children}` rendered somewhere. That's it.
- Only `import React from "react"` is supported; default-export a function component. CSS you pass is auto-scoped to the host. Use exposed `fields` (text/number/color/boolean/select/image/url/range/repeater) for anything the user should tweak from the sidebar.

## Animatable fields
`number`/`range`/`color` fields are **animatable** — the editor drives them from the timeline / scroll / hover and mutates `props.fields.<name>` IN PLACE every frame **without re-rendering**. So expose decorative/animatable values (speed, intensity, colors, sizes, angles, opacity) and read them LIVE in your loop as `props.fields.<name> ?? props.<name>`, keeping heavy setup in a `useEffect(…, [])` with EMPTY deps (latest props read through a ref). NEVER list an animatable field in a deps array — it re-runs setup every frame and rebuilds the experience. Don't expose technical/config values (endpoints, keys, ids, selectors). To animate a field, add a keyframe track on it in the Interactions panel.

## Isolation at render time (what you get for free)
React component boundary + CSS scoped to `[data-f0-id="host"]` + a freeze/snapshot when the host is deselected (timers/GSAP stop — zero idle cost) + children rendered as a passthrough prop. Isolation is BY ELEMENT — which is exactly why you must attach to the right (small) element, not the page.
