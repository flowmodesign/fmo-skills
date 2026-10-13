---
name: flowmo-design-craft
version: 1
family: web
description: General, tool-agnostic craft principles for building distinctive, production-grade interfaces and motion — visual hierarchy, type, color, spacing, layout, polish, animation choreography, and interaction affordances. Use alongside the flowmo-* skills to raise design quality and avoid generic "AI-looking" output. Applies whenever you design or critique a UI. Use when a build or review needs a taste pass, not just correctness. NOT for f0-specific tool syntax or mechanics — those live in the other flowmo-* skills.
surfaces: [assistant-web, assistant-video, designer, flowgen-web-node, mcp]
triggers:
  - design critique
  - looks generic
  - raise the design quality
  - AI-looking
derived_from: https://github.com/pbakaus/impeccable
---

# Design craft (general)

Design deliberately; use flowmo-specific skills for f0 syntax. More: references/surface-and-polish.md, references/refinement-verbs.md.

## Direction and hierarchy
- Choose a visual point of view from the brief; "clean and modern" alone is not a direction. Give each section one dominant element with decisive scale, weight, color, and spacing contrast. Use asymmetry and varied rhythm when useful; honor requested or brand-led centered layouts and familiar treatments.
- Use a readable display-to-caption scale, at most two type families, tight heading and relaxed body leading, and a 60-75-character body measure. Differentiate with weight and tracking as well as size.
- Anchor color in one or two accents, a neutral ramp, and clear text/muted/inverse roles. Use accents sparingly; meet WCAG AA contrast (about 4.5:1 body, 3:1 large). Lift and slightly desaturate dark surfaces rather than defaulting to pure black and white.
- Reuse a spacing scale and grid; group related content, separate unrelated content, constrain line length, and vary section padding for cadence. Use soft, directional, layered shadows and consistent radii. Polish states, empty states, icon alignment, optical centering, and stroke widths.

## Motion and interaction
- Motion should guide attention, show relationships, or reward action. Use ease-out entrances, ease-in exits; reserve linear easing for continuous/scrubbed motion. Typical UI timing is 150-300ms, entrances 400-800ms, ambient loops slow. Prefer a few choreographed beats over motion everywhere; respect reduced motion.
- Make controls recognizable with cursor, hover, and focus feedback; target at least 40px. Show state changes immediately. Disclose essentials first and details on intent.

## Finish and critique
- Before shipping, check for a strong hero with real visual content, clear hierarchy, intentional color, consistent spacing, considered states, and purposeful motion; redesign flat or default sections.
- Never infer authorship or a defect from patterns. Familiar gradients, centered layouts, repeated phrases, and polished cadence invite inspection but prove nothing. Preserve deliberate brand treatments, requested maximalism, expressive glow, centered editorial layouts, and approved copy. Flag a pattern only when the brief, brand reference, copy approval, or interaction goal shows a concrete miss.
- Ground each finding in the inspected page/layer and stable element id or selector. Quote exact visible copy, cite evidence and the missed goal/rule, and propose the smallest repair. Scope exceptions to their exact user-approved source and element.
- In visual-only work preserve approved words verbatim. In copy review, identify a specific clarity, truth, repetition, or voice issue before the smallest edit; preserve humor, dialect, uncertainty, slogans, legal language, and distinctive rhythm.
- Review the actual revision; after a repair, inspect and review the new one before closing. Stale screenshots, layer snapshots, and page reports cannot verify later edits.

Reference provenance: informed by [yetone/kill-ai-slop](https://github.com/yetone/kill-ai-slop) (Apache-2.0) and [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop) (MIT). This skill uses original f0-specific wording and does not infer AI authorship.
