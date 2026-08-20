# Editable HTML and design-system contract

## Contents

- Drop/import behavior
- Design-system tokens and classes
- DESIGN.md handoffs
- Responsive CSS and sizing

# 1. The drop contract

What the importer does with your file, in order:

1. Parses the HTML into an editable element tree. The `<head>` node, metadata,
   links, and scripts are not part of that tree, but inline `<style>` blocks are
   harvested from anywhere in the document before the head is removed.
2. Harvests **inline `<script>` bodies** (`script:not([src])`) for analysis. In
   editable import, `<script src="...">` is recorded and never executed because
   f0 re-implements GSAP/Lottie playback. **Run as live sandbox** instead
   preserves absolute HTTPS script dependencies.
3. Runs two converters - CSS `@keyframes` and the GSAP subset (section 5) - and
   registers each result as a native f0 interaction.
4. Anything a converter could not take is reported in the **Import Report** as a
   warning rather than silently mangled. Nothing is a mystery afterwards, but you
   have to look.

For resources commonly placed in `<head>`:

- **Fonts** come from the design system. Use the families the project's system
  declares (or declare them in a DESIGN.md, section 3). Do not link Google Fonts
  and do not `@import` a font stylesheet.
- **Styles** go in an inline `<style>` block. f0 harvests these blocks from the
  entire document; placing the block in the body makes a self-contained handoff
  easiest to inspect. Full CSS selectors work there - descendant, `:hover`,
  `:nth-child`, `@media` - and they match because the classes are present on the
  imported elements. External stylesheets and scripts are recorded, not loaded,
  by the editable import route.

Other things worth knowing before you write:

- **Media:** where slots are supported, write `data-f0-slot="hero"` for a
  placeholder, or `data-f0-source="asset:hero_img@v3"` (`kind:id@version`, kind =
  `asset` | `node-output` | `marketplace-listing`) when you already know the
  source. Ids are short, lowercase, hyphenated and unique per page - they are what
  a user's media re-attaches by. Never hand-write JSON into that attribute.
- **Give meaningful elements a `data-name`.** It becomes the layer name.
- **Do not use engine-internal class names** (`page`, `text`, `rect`, `image`,
  `fmod`).
- **Classes are the hook for everything - CSS, GSAP targets, triggers, scrub
  markers, timeline roots and scope selectors.** Ids are for anchors, form
  wiring and SVG internal references only. See "CSS rules the pipeline
  enforces".

## What is already on the page before your CSS runs

A global sheet ships with EVERY preview, export and publish, injected before
anything you write. Nothing in it uses `!important`, so an ordinary rule of
yours beats it - but you have to know it is there, because several of its rules
are the opposite of browser defaults:

- **`* { box-sizing: border-box; margin: 0; font-size: inherit; text-decoration:
  none; }`** - no default margins anywhere, and font-size INHERITS rather than
  stepping down per tag.
- **`h1..h6 { font-weight: inherit; }`** - a bare heading is **NOT BOLD**. This
  matches the editor canvas (which renders under Tailwind preflight) and it is
  the single most surprising rule here. Use `ds-heading-*` / `ds-display`, or set
  a weight yourself; do not assume the UA default.
- **`img, video { max-width: unset; object-fit: cover; object-position: center;
  }`** - media fills and crops by default rather than letterboxing.
- **`input, button, select, textarea`** are stripped to nothing: no border, no
  outline, transparent background, inherited colour, `cursor: pointer` on
  buttons, no resize on textareas, no native select arrow. Style them with
  `ds-input` / `ds-button` or your own rules - there is no UA chrome to remove.
- **`summary { list-style: none }`** plus the webkit marker removed - the native
  `<details>` triangle is gone, so supply your own chevron.
- **`[data-f0-id] { position: relative; min-width: 0; }`** on every element.
- **`.page` / `.f0-page`** are `display: grid; width: 100vw; min-height: 900px;`
  with the body font.
- **`a`** inherits the body font family and carries no underline (the `*` rule).
- **`.desktop-hide` / `.tablet-hide` / `.mobile-hide`** already work as container
  queries at the 1280 / 768-1279 / 767 bands. Use them instead of writing your
  own hide-at-width rules. (`ds-mobile-hide` and friends are the design-system
  aliases.)
- The closed **`f0-*` layout vocabulary** (`f0-container`, `f0-stack`, `f0-row`,
  `f0-grid`, `f0-gap-*`, `f0-between`, `f0-center`, `f0-fill`, `f0-hug`) ships
  too, and so does the CSS that makes carousels, tabs and accordions lay out
  (section 6).

So: do not write your own reset, do not re-zero margins, and do not fight these
with `!important`. Assume a clean slate that is *more* neutral than a browser's.

---

# 2. Design system: tokens and `ds-*`

Two layers. Build on both and the user can restyle everything by swapping the
system; hardcode values and the swap does nothing to your markup.

## Tokens

`--color-*`: primary (+ `-hover`, `-active`, `-subtle`), secondary (+ `-hover`),
accent (+ `-subtle`), accent-2, text, text-muted, the on-fill set
(`--color-text-on-primary`, `-on-secondary`, `-on-accent`), background, surface,
surface-alt, border, border-subtle, success, warning, error, ring, overlay, the
two section-tone families - `--color-section-dark-*` and
`--color-section-light-*`, each with `-bg`, `-text`, `-text-muted`, `-surface`,
`-surface-alt`, `-border`, `-border-subtle`, `-glass-bg`, `-glass-border` - and
the glass material (`--glass-bg`, `--glass-border`).

`--spacing-*`: 2xs, xs, sm, md, lg, xl, 2xl, 3xl, plus
`--spacing-section-vertical`, `--spacing-section-horizontal`, and the gap trio
tight / default / spacious.

Type: `--font-heading`, `--font-body`, `--font-mono`, `--font-feature-default`,
`--text-size-display`, `--text-size-h1..h6`, `-body`, `-small`, `-caption`,
`-overline`, `--line-height-tight|default|relaxed`,
`--letter-spacing-tight|default|wide`,
`--font-weight-normal|medium|semibold|bold`.

Sizing: button heights and paddings (small/medium/large), icon sizes, input
heights, `--container-max-width-narrow|default|wide`, `--card-padding-*`.

Also: `--radius-none|xs|sm|md|lg|xl|full` plus per-component `--radius-button`,
`--radius-card`, `--radius-input`; `--shadow-sm|md|lg|xl`;
`--transition-fast|normal|slow`; `--ease-standard|emphasized|bounce`;
`--gradient-primary|surface|text`; `--orb-color-1|2`;
`--border-width-default|emphasis`; `--bp-mobile|tablet|desktop`;
`--z-dropdown|sticky|modal|tooltip`.

**Never write `var(--x, #fff)`.** The fallback hides a missing token and freezes a
value the design system is supposed to own. Adding a NEW `:root` variable is fine
as an additive extension for something the foundation does not cover.

## Classes

**Components compose as base + variant + size:** `ds-button ds-button-primary
ds-button-medium`, `ds-card ds-card-elevated ds-card-large`. Dimensioned
components: `button` (primary/secondary/accent/outline/ghost x
small/medium/large), `card` (default/elevated/outlined), `input` (default/error),
`badge` (primary/secondary/accent/muted x small/medium), `icon` (size only).

**Layout:** `ds-section` (+ `-padding-tight|default|spacious`,
`-gap-tight|default|spacious`), `ds-container` (+ `-narrow|-default|-wide`),
`ds-grid` (+ `-2|3|4-column`), `ds-row`, `ds-flex` (+ `-column`, `-center`,
`-between`, `-wrap`), `ds-gap-tight|default|spacious`, `ds-w-full`, `ds-h-full`,
`ds-mx-auto`, `ds-text-center|left|right`, `ds-hidden`, `ds-block`,
`ds-inline-block`, `ds-inline-flex`, `ds-relative`, `ds-absolute`, `ds-sticky`,
`ds-overflow-hidden`.

**Typography:** `ds-display`, `ds-heading-1..6`,
`ds-text-body|small|caption|sm|lg`, `ds-overline`, `ds-eyebrow`.

**Compound, and STYLING ONLY:** `ds-tag`; `ds-accordion` / `-item` / `-trigger` /
`-content`; `ds-carousel` / `-wrapper` / `-container` / `-slide`; `ds-tabs` /
`-container` / `-trigger` / `-content`; `ds-dropdown` / `-trigger` / `-menu`.

**These do not move.** They are the LOOK of a carousel / tabs / accordion and
nothing else - no runtime is attached to a `ds-` class, ever. A carousel built
from `ds-carousel` alone renders as a static row of slides and then just sits
there. Behaviour comes from a bound interaction; see section 6.

**Utilities:** `ds-image-frame`, `ds-section-dark`, `ds-section-light`, `ds-glass`,
`ds-text-gradient`, `ds-gradient-orb`, `ds-blob`, `ds-divider`,
`ds-section-divider`, `ds-overlay`, `ds-backdrop`, `ds-bg-surface`,
`ds-animate-fade-in|slide-up|scale-in|blur-in|float`, `ds-button-hover`,
`ds-sr-only`, `ds-visually-hidden`, `ds-mobile-hide|tablet-hide|desktop-hide`.

**Element-type classes** so editing ONE class updates every instance:
`ds-list-item`, `ds-feature-card`, `ds-pricing-card`, `ds-section-header`,
`ds-nav-link`, `ds-card-title`, `ds-card-description`. Use these for repeated
elements instead of stacking utilities on each.

A `ds-` name you invented has nothing behind it and is worse than a plain class,
because it looks official. Invent plain class names freely instead - and define
them in your `<style>` block.

## Section tones

`ds-section-dark` is ALWAYS a dark band and `ds-section-light` is ALWAYS a light
one. The names are absolute: neither flips with the theme, so a dark system's
`ds-section-dark` stays dark and its `ds-section-light` is the full-contrast
beat, while a light system is the other way round. Read `--color-background` to
see which way the system points, then reach for whichever tone is opposite it.

The tone matching the page's own polarity does not vanish - it steps quietly off
the canvas as a barely-distinct panel, so it is never wrong to use, just quiet.

Descendants are rebound to that tone's token family automatically, so do NOT
hand-write compensation inside a band - no white text because a band is called
"dark", no hardcoded background. That fights the rebinding and breaks the moment
the system is themed. Never mix a token from one family with a token from the
other on the same element: they are two complete bands, not a light/dark pair of
one thing.

## Video surfaces

Video is an ADDITIVE scale over the same typography, not a second system. Opt in
with `ds-target-video`, then `ds-video-display`, `ds-video-heading-1|2`,
`ds-video-text-body`, `ds-video-caps` (sets uppercase AND the positive tracking
caps need - do not hand-write `text-transform` plus a guessed `letter-spacing`),
inside `ds-video-frame` / `ds-video-safe-area`. The `--video-*` tokens derive from
the web ramp via `--ds-video-type-scale`, `--ds-video-space-scale` and
`--ds-video-control-scale`. **Their middle term is `cqw`, not `vw`** - it resolves
against the frame's container so type tracks the VIDEO FRAME, not the browser
window. Never substitute `vw` in video type.

---

# 3. DESIGN.md: a design system as a file

f0 reads the open **DESIGN.md** spec (google-labs-code/design.md), so a design
system can be handed over as a markdown file and imported as a system rather than
transcribed by hand.

The shape is YAML front matter, then prose, then optionally a fenced `css` block.

```markdown
---
colors:
  primary: "#1d1d1f"
  primary-hover: "#000000"
  accent: "#0071e3"
  text: "#1d1d1f"
  text-muted: "#6e6e73"
  background: "#ffffff"
  surface: "#f5f5f7"
  border: "#d2d2d7"
typography:
  h1:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.022em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
  overline:
    fontSize: "0.75rem"
    letterSpacing: "0.08em"
rounded:
  md: "12px"
  full: "9999px"
spacing:
  md: "16px"
  lg: "24px"
components:
  button-primary:
    background: "{colors.primary}"
    rounded: "{rounded.full}"
---

## Overview

One paragraph on the system's feeling and character. This is the "essence" f0
shows on the design-system card, so write it as character, not as a spec.
```

**Rules that decide whether the import is clean:**

- Colors MUST be `#RRGGBB` hex.
- `{colors.primary}` style references are resolved against the front matter, so a
  component entry can point at a token instead of repeating a value. One level of
  lookup by path - keep them simple.
- **Name tokens with f0's own names and the import is deterministic and free.**
  `colors.primary`, `colors.text`, `colors.background`, `colors.surface`,
  `colors.border`, `rounded.md`, `spacing.lg` map straight through to
  `--color-primary`, `--radius-md`, `--spacing-lg` and so on, verbatim. A file
  using its own vocabulary (`ink`, `canvas`, `on-surface`, `pill`, `display-lg`)
  still imports, but it has to be TRANSLATED first, which is slower and is a
  judgement call rather than a mapping.
- Typography roles that map to a size token: `display`, `h1`-`h6`, `body`,
  `small`, `caption`, `overline`. Beyond `fontSize`, only a few properties are
  lifted: **`h1.fontFamily` becomes the heading family, `body.fontFamily` becomes
  the body family**, `h1.letterSpacing` and `h1.lineHeight` become the tight
  tracking and tight line-height, `overline.letterSpacing` becomes the wide
  tracking, and the first `fontFeature` found becomes the system-wide OpenType
  setting. Put the family on `h1` and `body` specifically or it will not be picked
  up.
- Spacing values may be numbers (treated as px) or strings with units.
- A trailing fenced ` ```css ` block is read as embedded source CSS, which is what
  makes an exported `.md` self-contained. The LAST one in the file wins.
- The `## Overview` section is the system's essence - it round-trips as the card's
  description.

Sections the spec has no slot for - shadows, transitions, breakpoints, z-index -
belong in the prose (an "Elevation & Depth" or "Layout" section), or in the
embedded CSS block if you need them to actually apply.

---

# 4. Responsive and the CSS rules

## Responsive-query behavior

For straightforward handoffs, author desktop-first base rules and step down with
plain `@media (max-width: Npx)`. Each width-bound query becomes a page-scoped
container query and a matching editor breakpoint, so it also works when the page
is displayed inside a section narrower than the browser viewport.

- Both `min-width` and `max-width` size conditions are preserved. Boundaries
  within one pixel of a standard f0 width snap to that standard width; the
  standard list is 320, 480, 767, 768, 1023, 1024, 1279, 1280, 1440, 1536, and
  1920px. Other values remain valid rather than being dropped.
- Hand-authored `@container` rules are supported and preserved. Prefer `@media`
  for normal page breakpoints because the importer can register those conditions
  in the editor's breakpoint controls.
- Non-size media conditions such as `prefers-color-scheme` remain global
  `@media` rules. A query that mixes size and non-size conditions is preserved
  wholesale instead of being partially rewritten.
- Desktop-first CSS remains the recommended authoring style for predictable
  canvas editing. Keep one block per boundary where practical and override only
  what changes instead of restating every rule.

## Element sizing

Fluid first; a breakpoint is for when fluid is not enough.

- Top-level page container: height `max-content` (hug).
- Sections: `max-width: 100%` and **`flex-direction: column`** - never row.
- Inner content container: `max-width: 100%`, `min-width: 320px`.
- Rows of cards/columns: `flex-wrap: wrap` so they wrap instead of crushing.
- Each card/column: a pixel `max-width` plus a sensible `min-width` (280-320px is
  the usual floor). Constrain - do not rewrite the element's own width/height.
- Large titles: relative font sizing, and when you use it you MUST also give a
  minimum and a maximum font size with units. Relative type with no clamp is how
  headings end up illegible on a phone and absurd on a wide monitor.
- Structural containers (`section`, `header`, `footer`, `nav`) size to CONTENT -
  never a fixed pixel height. Only the page root may carry a viewport-width px
  value.

## CSS rules the pipeline enforces

- **Style by CLASS. Never use an `id` as a styling hook.** No `#hero { ... }`,
  no `id="hero"` written so a rule can find it. An id is unique per document, so
  an id-keyed rule binds ONE element: duplicate the card, reuse the section, or
  let the user copy a band on the canvas and the copy is unstyled - and the page
  now has a duplicate id, which is invalid. Classes are also the unit f0's own
  class-level style editing works on, so an id rule is a rule the user cannot
  edit the normal way. The only ids you write are the ones something genuinely
  needs to address programmatically: an in-page anchor target (`href="#pricing"`),
  form wiring (`<label for>`, `aria-labelledby`, `aria-controls`), and SVG
  internal references (gradients, `clipPath`, `mask`, `filter`, `<use>`), which
  can only be referenced by id. Those ids carry no styles.
- **Never `!important`.** f0's per-element rules already out-specify class rules,
  and writing a selector replaces its rule wholesale, so there is nothing to fight.
  If a style "won't take", a more specific rule is shadowing it.
- **Never write `opacity: 0` or `display: none` into persistent CSS on an animated
  element.** Let the runtime own the starting state, or it stays invisible when the
  animation does not run.
- **Inline styles are the exception**, for a value that genuinely cannot be a class
  (a measured pixel height for a collapse). A whole design expressed as inline
  hardcoded styles defeats the design system entirely.
- **A class is assigned first and defined second.** Naming `.hero-eyebrow` before a
  rule exists IS the brief. Never strip a class for being undefined - that includes
  state classes (`.is-open`, `.is-active`, `.is-sticky`).

## RTL

If the content may run right-to-left, use logical properties - `inset-inline`,
`margin-inline`, `padding-inline`, `border-inline` - not `left`/`right`. In motion,
mirror the sign and the origin: shift by `dir * (rtl ? 34 : -34)`, use
`transformOrigin: rtl ? 'right' : 'left'`, wipe with
`clipPath: rtl ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'`, and swap ArrowLeft /
ArrowRight. Read direction from the DOM (`root.dir === 'rtl'`), not a build-time
guess.

---
