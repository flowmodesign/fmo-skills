# What the build copies from a board

Part of the flowmo-reference-boards skill package - see the package's SKILL.md
for routing. This reference is the contract for translating a locked board
into the actual `write_html`/`write_css` build: what's binding, what isn't,
and what to do when the board and the written brief disagree.

## The board is the spec - but never literal pixels

A board fixes DESIGN DECISIONS, not exact pixel values. When you build the
section, extract from the board:

- **Text:** the real headline/sub/CTA wording visible on the board (adapt it,
  never replace it with placeholder copy); line count and wrap behavior;
  alignment logic.
- **Typography:** the size RELATIONSHIP between display/heading/body (ratios,
  not pixel guesses); weight contrast; tracking feel; whether the register is
  calm or aggressive.
- **Spacing:** the LOGIC of headline-to-sub distance, text-to-CTA distance,
  card gaps, section padding, side gutters, image-to-text distance. Preserve
  generous spacing as generous - never collapse a board's breathing room into
  a default tight layout.
- **Color:** background, panel, accent placement, text-hierarchy colors,
  border/shadow mood, image tint. Preserve the palette LOGIC.
- **Components:** button size/shape/radius/fill-vs-outline and hierarchy,
  card structure, badges, dividers, borders, shadows. If a detail is too
  small on the board to read confidently, generate a closer detail crop with
  `generate_image` rather than guessing.
- **Rhythm:** repeated motifs that carry the concept (hairlines, numerals,
  crop frames, rail notes) - these are the design's spine, not incidental
  decoration.

Translate every one of those into f0's actual build vocabulary: palette and
spacing decisions become `ds-*` tokens and `:root` `--vars` (see
**flowmo-frontend-design**) authored through `write_html`/`write_css` /
`apply_class_styles` / `update_stylesheet` - never an attempt to reproduce the
board's exact pixel grid. The board tells you WHAT the design is; the design
system and its tools decide HOW it's expressed in real, editable markup.

## Anti-drift rules

The single biggest failure mode of a board-grounded build is drift: a strong
board in, a generic page out. Read the board again at build time for each
section - do not build from memory of having looked at it earlier.

- Do not simplify a distinctive section into a generic row.
- Do not compress generous board spacing into a denser default layout.
- Do not flatten a strong type hierarchy into a default one.
- Do not merge different section systems into one repeating pattern because
  it's easier to build.
- Do not swap the board's palette for tokens you happen to be used to.
- When habit disagrees with the board, the board wins.
- After each section, name one specific thing you kept faithful to the board.
  If you can't name one, you drifted.

## Ambiguity resolution order

When the board and the written brief conflict, or a visual detail on the
board is genuinely unclear, resolve in this order - do not jump straight to a
generic default:

1. Preserve the visible design language.
2. Preserve layout and spacing logic.
3. Preserve the component family.
4. Preserve the mood/polish level.
5. Generate an extra detail crop of the unclear region with `generate_image`.
6. Regenerate that section's board fresh if the detail crop still doesn't
   resolve it.
7. Only after exhausting 1-6, pick the most implementation-friendly faithful
   reading.

## Board chrome is non-normative

A section board often renders a nav bar, footer, or a sliver of an adjacent
section around the section it's actually specifying - that surrounding chrome
is not binding. Only the section's OWN content is the spec; do not import a
board-invented nav item, footer chrome, or neighboring-section fragment into a
section that doesn't own it. Likewise, boards tend to draw an uppercase
eyebrow kicker on almost every section - the page's own eyebrow ceiling,
`ceil(sections / 3)`, wins; keep the budgeted ones where the board placed
them and drop the rest without treating that as drift.

The generated icon set (see
[asset-kit-and-ladder.md](asset-kit-and-ladder.md)) is exempt from the
micro-UI-clutter rule below when it annotates real content (spec rows, facts
tables, feature labels) - those icons come from the asset plan, not board
improvisation. Don't scatter them decoratively where nothing needs
annotating.

## Board vs. brief precedence for CTAs, and the garment catalog

The board wins for composition and placement (where the button sits, how
prominent it is); the brief's CTA inventory wins for the CTA's "garment" -
its interaction identity (hover behavior, shape language, motion) - since
boards often render a generic default button that was never meant to be
authoritative. Distinct CTA intents (e.g. "book" vs. "walk in") may carry
distinct labels; the one-label rule only collapses same-intent duplicates.

**Stop reinventing the same three buttons.** The trio of drawing-underline,
hover flood-fill, and framed-block has become the reflexive default. Ration
it: at most ONE of those three per page, and zero overlap with the previous
build's garment set - **flowmo-wow-catalog**'s anti-repeat ledger tracks the
CTA garment set as one of its no-repeat axes specifically for this. Pick or
derive the rest from garments like these - always re-expressed through the
brief's own material world, never copied literally:

- text link whose arrow travels along a drawn path (route, circuit, seam)
- label that splits/slides apart revealing the destination underneath
- CTA embedded in an image cutout (the button IS a photographed object/tag)
- stamp/press: `:active` physically imprints (skew + texture shift)
- ticket/coupon with perforation that "tears" on hover
- mono readout that types/decodes the label on hover
- circular badge that spins/unrolls; text-on-a-path
- magnetic pill with inertia (only if nothing else on the page is a pill)
- underline that is a waveform/route/thread, animating like the page's motif
- swatch/chip that flips like a material sample
- oversized numeral or glyph as the hit area, label as its caption
- row/band CTA where the entire strip shears or shifts grade on hover
- corner-bracket target that closes around the label (viewfinder)
- toggle/switch metaphor for binary intents (listen/read, light/dark)

The test: cover the label - could you still tell which site this button
belongs to? If it could live on any site, it isn't done.

No shared button/CTA style stamped across the page - each CTA is designed in
the component that owns it, with its own interaction identity. Examples:

- Hero: oversized underlined text-link, underline draws in, magnetic pull.
- Work row: whole-row hover reveals a preview crop + sliding index digit.
- Contact: framed block that fills on hover with a clipped text swap.
- Nav: links with sliding digits or a moving hairline, not pill buttons.

Same voice, different garments. No site-wide `.btn-primary`-style utility
class in the global stylesheet - style CTAs where they live, through
`write_css`/`apply_class_styles`/`update_stylesheet` scoped to the component.
Two builds (or two sections) sharing the same nav/CTA shape is a failure even
if the palette differs. This whole catalog is informed by
**flowmo-design-craft** and **flowmo-motion-design** for the underlying
motion/shape judgment.

## Structural hygiene

- **Anti-nested-box:** don't wrap content in card-inside-panel-inside-frame
  stacks the board doesn't show. Boards usually get their depth from ONE
  surface change - mirror that, not three.
- **Micro-UI clutter:** don't add badges, dots, tag pills, version chips, or
  icon confetti the board doesn't show. Every small element must exist on
  the board or serve real content (see the icon-set exemption above).
- **Copy discipline:** adapt the board's visible wording into real, specific
  copy - no filler verbs, no em-dashes, no fake numbers. See
  **flowmo-design-craft** for the full copy-craft guidance.
- **KPI slop:** three (or four) identical stat columns - big number, small
  label, same weight, same width - dropped in as proof. Only show numbers the
  brief actually supplies, and give them a composition the board chose (one
  dominant figure with supporting ones, numbers set into the narrative, the
  `signature-oversized-metrics-strip` pick when it was locked), never the
  default equal row.
- **Marquee slop:** a looping logo or word strip added because the page felt
  empty. A marquee is legitimate only when `signature-brand-marquee` was
  picked and there is real content to loop (real partner logos, real
  proof points); otherwise it is filler that moves.

## Page rhythm across sections

Boards are generated one section at a time, so the page-level rhythm has to
be checked at build time. Walk the section list top to bottom before writing
the last section:

- **Repetition thresholds.** The same composition anchor (copy left / visual
  right, centered stack, and so on) at most two sections in a row. The same
  background mode (plain page ground, dark band, full-bleed image, tinted
  panel) at most three in a row. At least one full-bleed section and at least
  one compact, tightly contained section on the page - unless the locked
  picks make the brief deliberately minimalist (`hero-scale-mini-minimalist`
  with a quiet section system), where uniform calm is the point.
- **Cross-section contrast.** Intensity (scale, density, color weight,
  motion) should change at least twice down the page - a loud section after
  quiet ones, a quiet one after loud. A page at one volume throughout reads
  as a template, whatever that volume is.
- **Fixed media frames.** Each media module keeps one stable aspect ratio
  across its instances (every card image 4:3, every case-study frame 16:9)
  and maps to `ds-image-frame` with the ratio set once on the module's own
  class, not per image. Mixed ratios inside one module read as broken, not
  playful.
- **First screen on a small laptop.** At roughly 1280x720 the hero's headline,
  its supporting line and the primary CTA are readable without scrolling,
  and the `hero_scale` pick still reads as itself (a giant statement may
  crop its visual, never its headline).
- **Every section has a job.** Name it in a few words (prove, explain, show,
  compare, reassure). A section whose job you cannot name is cut or merged.
  The last section closes: one CTA, plus one trust cue next to it (a real
  customer count, a named client, a guarantee, a security or privacy note -
  only what the brief supplies).
