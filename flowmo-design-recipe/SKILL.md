---
name: flowmo-design-recipe
version: 1
family: web
description: |
  Mechanical craft rules for building or auditing a page in flowmo (f0): the
  type-scale floor, the one-accent-color rule, banned default palettes, hero
  composition limits, layout-repetition and eyebrow discipline, copy bans
  (em-dash, filler verbs, fake stats), motion restraint, states/forms rules,
  and images/icons priority. Ports Higgsfield's design-recipe and
  review-rubric craft rules, translated to f0's ds-* vocabulary and tools.
  Use when: building a new page or section, auditing an existing page for a
  generic "AI slop" look, "make it less generic", "review this page before
  shipping", "redesign this", picking a palette, writing hero copy, or
  checking hero/layout/motion discipline. NOT for: motion authoring
  mechanics (use flowmo-motion-design), picking the page's signature wow
  moment (use flowmo-wow-catalog), interactive/WebGL build mechanics (use
  flowmo-interactive-design), or file handoffs for Import page (use
  flowmo-authoring-contract).
surfaces: [assistant-web, flowgen-web-node, section, designer, mcp]
kinds: [page, deck, document, email, dashboard, wireframe]
tools: [assistant-web:write_html, assistant-web:write_css, assistant-web:apply_class_styles, assistant-web:update_stylesheet, assistant-web:author_animation, assistant-web:get_design_tokens, assistant-web:validate_canvas, designer:set_stylesheet]
presets: [presets/banned-palettes.json, presets/dials.json]
chain_with: [flowmo-wow-catalog, flowmo-frontend-design, flowmo-motion-design, flowmo-design-craft]
derived_from: https://github.com/higgsfield-ai/skills
renditions:
  designer-page: [designer]
---

# flowmo design recipe

The distilled craft floor for every page: the rules that exist because the
default LLM/AI-assisted output violates them. Pair with
**flowmo-frontend-design** (which tool writes what) and
**flowmo-design-craft** (general taste principles); this package is the
specific, checkable bar. On a Designer page build the same rules apply.

**Design Read, before any build:** state one line first: "Reading this as:
\<page kind> for \<audience>, with a \<vibe> language, leaning toward
\<a design direction>." If the brief is ambiguous, ask exactly one
clarifying question; otherwise declare the read and proceed.

**Anti-default discipline:** do not default to AI-purple gradients, a
centered hero over a dark mesh, three equal feature cards, generic
glassmorphism applied to everything, infinite-loop micro-animations on
every section, or the `inter` font pairing paired with a plain gray-900
body color. These are the statistical LLM defaults this package exists to
beat; reach past them deliberately based on the stated read.

## Three dials

Before layout, motion, or density decisions, set three dials (baseline
`8 / 6 / 4`, or pick a closer use-case preset) from `presets/dials.json`:

- **Design Variance** (1 = perfect symmetry, 10 = artsy chaos)
- **Motion Intensity** (1 = static, 10 = cinematic/physics)
- **Visual Density** (1 = art-gallery airy, 10 = cockpit-packed)

A "minimalist/calm/Linear-style" brief pulls variance and motion down, not
density up. A "playful/Awwwards/experimental" brief pulls variance and
motion toward 9-10. A "trust-first/public-sector" brief pulls all three
down. Redesigns start from the existing page's read, not the baseline. The
full signal-to-range inference table lives in
[references/dial-inference-and-vocabulary.md](references/dial-inference-and-vocabulary.md).

## Typography floor

- A real jump between display, h1-h6, body, and caption steps (`ds-heading-1`
  through `ds-heading-6`, `ds-text-body`/`-small`/`-caption`) via
  `var(--text-size-*)` tokens, not by eye. Tight leading on display/heading
  sizes (roughly 1.0-1.1), relaxed leading on body (roughly 1.5-1.7). Body
  measure caps around 65ch (about 65 characters per line).
- The largest display step is for a 3-5 word headline only; a longer
  headline drops one size step rather than wrapping to 4 lines. A 4-line
  hero headline is a font-size error, not a copy-length error.
- Set fonts through `get_design_tokens` / the project's font vars
  (`var(--font-heading)`, `var(--font-body)`, `var(--font-mono)`), never
  hardcoded in CSS. Pick from f0's own font-pairing catalog
  (`DS_FONT_PAIRS`): `system`, `inter`, `inter-tight`, `dm-sans`,
  `playfair-inter`, `plex` (IBM Plex Sans), `manrope`, `archivo` (Archivo
  Black over Archivo), `mono` (Space Mono). The plain `inter` pairing is
  f0's documented "product default" and so the most common reach: fine for
  an explicitly neutral/Linear/public-sector brief, otherwise a tell. The
  alternatives (`dm-sans`, `manrope`, `plex`, `archivo`, `mono`) are not
  automatically safe either: a pairing is right only with a stated reason
  drawn from the brief (audience, material, voice), never as a swap-in.
- Serif as the default display face is discouraged; it is the most-tested
  "creative brief = serif" AI tell. `playfair-inter` is f0's only serif
  pairing, so reaching for it by default has the same tell-risk the source
  assigns to Fraunces/Instrument Serif. Reach for it only when the brief
  names a serif, or the brand is genuinely editorial/luxury/heritage AND the
  reasoning is stated. A business simply being a few years old, or in a
  traditional trade, does not qualify as "heritage" by itself.
- Emphasis inside a headline is italic or bold of the SAME family, never a
  second family injected for "visual interest." When an italic display word
  contains a descender (`y g j p q`), set `line-height` to 1.1 minimum and
  reserve a small bottom margin/padding on the wrapping element, or the
  descender clips.

## Color: one accent, locked

- Exactly ONE accent color, saturation under about 80%, reused everywhere
  via one `var(--color-accent)`-style token. No second accent showing up in
  a footer badge or a stray icon.
- A neutral ramp via `var(--color-*)` tokens, warm or cool, never both in
  the same page. No pure black; use an off-black/near-black step.
- **Banned default palette families:** see `presets/banned-palettes.json`
  for the exact hex lists and why each is banned (graphite+ember,
  near-black+neon, beige+brass+espresso, AI purple/violet glow, and
  repeating the previous build's family in the same session). Overridable
  only by the user's own explicit brand colors.
- One theme per page, with at most one deliberate tone switch (a single
  dark band in a light page, or the reverse) that the read justifies; never
  random alternation like a warm-paper section sandwiched into a near-black
  page. Tint shifts within the family are fine.
- One accent is the Restrained default; Committed, Full-palette and
  Drenched strategies, and choosing light vs dark from the use scene, are in
  [references/color-strategy.md](references/color-strategy.md). The brief
  must name a non-default strategy.

## Hero rules

- The hero fits the initial viewport: headline max 2 lines desktop, subtext
  max ~20 words / 3-4 lines, CTA visible without scrolling, top padding
  capped around 6rem (96px) at desktop. More than that reads as a layout
  bug, not intentional space; if the hero needs more room, raise the font
  or asset scale, not the top padding.
- Max 4 text elements: an optional eyebrow or brand strip, the headline, the
  subtext, and one CTA row (one primary, at most one secondary). Banned
  inside the hero: a tagline under the CTAs, a trust micro-strip, a pricing
  teaser, feature bullets, avatar rows, version labels, "Brand dot No. 01"
  micro-meta. Logo walls belong in their own section below the hero.
- The hero needs a real visual element (**flowmo-frontend-design**'s Hero
  elevation rule: no image, video, or interactive/3D layer is the biggest
  failure mode). Text over a plain or gradient background is a placeholder. A div-built fake product UI (fake task list, fake terminal, fake
  dashboard) is the top LLM tell here; use a real image, a generated asset,
  or nothing.
- Anti-center bias: unless the brief is explicitly editorial/manifesto,
  prefer a 50/50 split, left-content/right-asset, or an asymmetric
  composition over a centered stack.

## Layout rules

- Each layout family (N-column cards, split text+image, full-width quote,
  bento, stacked list, ...) appears at most once per page; a page with 6+
  sections needs at least 4 distinct families. At most 2 consecutive
  text/image zigzag splits.
- Eyebrow ration: at most 1 eyebrow-position label per 3 sections (hero
  counts). Count only labels sitting directly above a section's display
  headline; prefer dropping the eyebrow over adding one past the ratio.
- Never a `ds-grid-3-column` of three visually identical `ds-card`
  elements. Use a 2-up zigzag, an asymmetric grid, or a horizontal scroll.
- Bento grids get exactly as many cells as real content items (no blank
  filler tiles), and at least 2-3 cells need real visual variation (image,
  brand gradient, pattern, tint), not six white-on-white text cards.
- No "giant headline left, small floating paragraph right" section header;
  stack vertically instead.
- Cards only where elevation genuinely signals hierarchy; otherwise a
  border, a divider, or negative space. One corner-radius family for the
  whole page (all-sharp, or all-soft, or all-pill; mixing needs a written
  reason).
- Nav is a single line at desktop, height under 80px. Mobile collapse is
  declared explicitly per multi-column section.
- Structural containers (`section`/`header`/`footer`/`nav`, `ds-section`)
  never carry a fixed viewport-height rule; only the page root may carry a
  viewport-width value, on width only (**flowmo-frontend-design**). A hero
  needing full-bleed height uses a dynamic-viewport unit on the page root,
  never a hardcoded pixel height on a structural element.

## Copy rules

- Headline 8 words or fewer; sub-paragraph 25 words or fewer; one visual or
  one CTA per section, not both competing.
- Em-dash and en-dash-as-separator are completely banned in any visible
  copy: headlines, body, quotes, captions, buttons. Use a period, comma,
  colon, parentheses, or hyphen. Zero tolerance, matching f0's house style
  (see **flowmo-authoring-contract**), for every string you draft.
- One label per CTA intent, page-wide: "Get in touch", "Contact us", and
  "Let's talk" cannot all appear on the same page.
- Primary CTA text fits one line at desktop (3 words or fewer).
- No filler verbs (elevate, seamless, unleash, next-gen, revolutionize), no
  startup-slop names, no "Jane Doe" testimonials, no fake-precise
  unverifiable marketing stats ("92% faster", "4.1x ROI", "10k+ teams")
  unless explicitly labeled as a mock. Invented PRODUCT facts (a price, a
  spec value, a batch count, a dimension) are fine and often required for a
  fictional-brand brief; keep them plausible and internally consistent. The
  ban targets unverifiable performance and social-proof claims, not
  catalog data.
- No section numbering ("001 Capabilities"), no "Scroll to explore" cues,
  no version footers on marketing pages, no generic step labels ("Stage 1",
  "Step 1", "Phase 01"; the step's own verb-noun content is the label), no
  performative-craftsman labels ("Field notes", "Quietly trusted by",
  "Currently on the bench"; use a plain functional label or skip it), no
  locale/time/weather strips ("Lisbon 14:23, 18C") unless the brief is
  genuinely about a place or a timezone-distributed team, no pills or tags
  overlaid on a photo, and no decorative colored status dot in front of a
  nav item, list row, or badge unless the dot conveys real semantic state.
  The middle-dot separator is rationed to at most one per line; prefer line
  breaks, hairlines, or columns for anything wider.
- Quotes: 3 lines maximum, real typographic quote marks, attribution as
  name plus role (never a name alone).
- Re-read every visible string before shipping; rewrite anything
  grammatically broken, referent-unclear, or that reads like an LLM trying
  to sound thoughtful. Plain functional copy beats cute copy. The extended
  AI-tell checklist (production-test patterns beyond the ones above) lives
  in [references/dial-inference-and-vocabulary.md](references/dial-inference-and-vocabulary.md).

## Motion rules

- One signature/hero effect per page, plus motivated reveals. Before adding
  any animation ask what it communicates (hierarchy, narrative, feedback,
  state); "it looked cool" is not a reason to keep it.
- Favor `author_animation` GSAP eases that read as physical, not linear: a
  settle like `power2.out`/`power3.out` for most entrances, a bouncier
  `back.out(1.7)` or `elastic.out(1,0.3)` for a playful/premium brief; save
  `ease: "none"` for a scroll-scrub tween where progress must track 1:1.
- Animate only `transform` and `opacity` on the hot path.
- Every animated element respects reduced-motion; see
  **flowmo-motion-design** for triggers and the FOUC rule (never write
  `opacity: 0` / `display: none` into persistent CSS on an animated
  element).
- Never hand-roll a `window.addEventListener('scroll', ...)` listener (slower
  and opaque to the design system). Use `author_animation`'s `scroll-reveal`
  (play once on enter) or `scroll-scrub` (progress tied to scroll), per
  **flowmo-motion-design**.
- If motion cannot be finished properly in scope, ship a clean static page
  instead of a half-wired effect.

## States, forms, images, icons

- Implement full cycles, not just the happy path: skeleton loaders shaped
  like the final layout (not a generic spinner), a composed empty state, an
  inline error state. `:active` gets a small tactile shift (a 1px lift or a
  slight scale-down).
- CTAs are not one uninflected shared button: `ds-button`'s variant and size
  system makes primary/secondary/ghost look and behave distinctly, plus a
  small per-instance hover tween where it earns its place; every label
  passes WCAG AA against its own background (ghost over a photo needs a
  scrim or stroke).
- Forms: label above the input, error below it, never placeholder-as-label;
  placeholder, helper, and focus states all pass AA contrast.
- Image/icon priority: (1) a real generated or brand-supplied asset, (2) a
  real brand URL from the brief, (3) a labeled TODO slot with the gap told
  to the user. Even a minimalist site needs 2-3 real images; pure text is
  incomplete, not minimal. Logo walls: real marks only, no caption under
  each; an invented brand gets `generate_logo` (or `generate_svg_decoration`
  for a geometric monogram), never a styled text `<span>` as a logo. Icons
  come from one consistent set; a library set is the fallback only for
  dense functional UI (forms, tables), never two sets in one visual zone.

## Design Read gut-check

Before presenting, restate the Design Read and check it against what
shipped: does the page read as the stated kind, audience and vibe, or did
it drift back to the generic default? Drift means redesign, not ship.

## Redesign protocol

1. **Detect the mode first:** greenfield (no dial baseline override needed),
   redesign-preserve (modernize without breaking the brand), or
   redesign-overhaul (new visual language, same content/IA). Ask once if
   genuinely ambiguous.
2. **Audit before touching anything:** brand tokens (colors, type, radii),
   IA and primary conversion paths, which blocks do real work versus
   filler, what to preserve (a signature interaction, a recognizable hero,
   the copy voice) and retire (AI tells, broken layouts, stock imagery),
   the existing dial reading (the starting point, not the baseline), and
   the SEO baseline (ranking pages, meta titles, structured data, OG
   cards); SEO migration is the single biggest redesign risk.
3. **Preserve unless asked otherwise:** information architecture, anchor
   targets and nav labels, copy voice, existing accessibility wins (focus
   states, alt text, contrast), and anything already wired to
   `data-name`-scoped tracking. Extract the existing brand colors before
   applying the one-accent-color rule; a brand that is already purple stays
   purple, the banned-palette gate does not override real brand color.
4. **Modernize in priority order, stop when the brief is satisfied:**
   typography refresh, spacing/rhythm, color recalibration (desaturate,
   unify neutrals, keep the existing brand accent), a motion layer sized to
   the dial, hero/key-section recomposition, then full block replacement
   only when a block is unsalvageable.
5. **Choose the scope of change:** sound IA, content and SEO favor targeted
   evolution (levers 1-4, most of the value at a fraction of the risk);
   structurally broken visuals (no design system, broken IA or mobile) favor
   a full redesign with strict content preservation; a new brand favors
   greenfield.
6. **Never change silently:** route structure, primary nav labels, form
   field names or order, the brand logo, or existing legal/consent copy.

## Mechanical review and scored critique

Run [references/review-rubric.md](references/review-rubric.md) as a
pre-ship gate: every item states what to grep or inspect and what pass/fail
means, in f0's own CSS/tooling vocabulary. For a "review"/"critique" ask,
also run [references/critique-scoring.md](references/critique-scoring.md)
(heuristics 0-4, P0-P3, personas); do the visual read with `f0_screenshot`
BEFORE reading `validate_canvas` or lint output, so tools do not anchor it.

## Decks

For kind `deck`, pick the story before the layout: strategy by goal, emotion
arc, pattern breaks and per-slide copy formulas are in
[references/deck-narrative.md](references/deck-narrative.md).
