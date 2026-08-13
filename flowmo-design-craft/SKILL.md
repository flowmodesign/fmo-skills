---
name: flowmo-design-craft
description: General, tool-agnostic craft principles for building distinctive, production-grade interfaces and motion — visual hierarchy, type, color, spacing, layout, polish, animation choreography, and interaction affordances. Use alongside the flowmo-* skills to raise design quality and avoid generic "AI-looking" output. Applies whenever you design or critique a UI.
---

# Design craft (general)

Principles that make an interface read as *designed*, not generated. Pair these with the flowmo-specific skills (which tell you HOW to express them in f0).

## Avoid the generic-AI look
The default failure mode is bland: centered everything, even gray cards, one weight of type, equal spacing, a stocky gradient hero, emoji bullets. Beat it with intent:
- **Pick a point of view.** A real visual idea (editorial, brutalist, soft-glass, retro-terminal, premium-dark) beats "clean and modern" with no opinion.
- **Contrast is the engine of hierarchy.** Vary size, weight, color, and spacing decisively — not by 1.1×. One dominant element per section.
- **Asymmetry and rhythm** over wall-to-wall centering. Let some sections breathe and others compress.

## Type
- A clear scale (display → h1 → h2 → body → caption) with real jumps between steps. Tight leading on headings, relaxed on body.
- Two families max (or one with weights). Set measure ~60–75 chars for body. Use weight and tracking, not just size, to differentiate.

## Color
- Anchor on a small palette: one or two accents, a neutral ramp, clear text/muted/inverse. Use accent sparingly — it loses power if everywhere.
- Ensure text contrast (WCAG AA: ~4.5:1 body, 3:1 large). Dark themes need slightly desaturated, lifted surfaces — pure `#000` + pure white is harsh.

## Spacing & layout
- One spacing scale, used consistently. Group related things tighter; separate unrelated things with generous whitespace.
- Align to a grid; let content max-width keep lines readable. Padding inside containers should feel intentional and even.
- Section rhythm: vary vertical padding so the page has cadence, not a uniform drumbeat.

## Depth & polish
- Shadows model real light: soft, directional, layered — not a hard 4px drop everywhere. Border-radius consistent within a family.
- Details sell it: hover/focus states, considered empty states, aligned icons, optical centering, consistent stroke widths.

## Motion choreography
- Motion has a job: guide the eye, show relationships, reward action. Decorative-only motion that fights reading is worse than none.
- **Easing:** ease-out for entrances (fast→settle), ease-in for exits. Avoid linear except for continuous/scrubbed motion.
- **Duration:** UI 150–300ms; entrances 400–800ms; ambient loops slow. Stagger by a small `amount`, not a long per-item delay.
- **Choreograph, don't carpet-bomb:** a few well-timed moves (hero reveal, one scroll beat, a stagger) beat everything-animates. Respect reduced-motion.

## Interaction & affordance
- Make interactive things look interactive (cursor, hover feedback, focus ring). Keep targets ≥ ~40px.
- Feedback is immediate; state is obvious (active tab, current slide, open accordion). Never leave the user guessing whether something worked.
- Progressive disclosure: show the essential, reveal detail on intent. Don't dump every option at once.

## Quality bar before you ship
Would a senior designer call this *finished*? Check: a strong hero with a real visual element, a clear type hierarchy, intentional color, consistent spacing, considered states, and motion with a purpose. If a section feels flat or default, redesign it — don't ship it.
