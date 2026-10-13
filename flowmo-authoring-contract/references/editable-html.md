# Editable HTML and design-system contract

## Contents

- Drop/import behavior
- Design-system tokens and classes
- DESIGN.md handoffs
- Responsive CSS and sizing
- Writing for the CMS that follows

# 1. The drop contract

What the importer does with your file, in order:

1. Parses the HTML into an editable element tree. The `<head>` node, metadata,
   links, and scripts are not part of that tree, but inline `<style>` blocks are
   harvested from anywhere in the document before the head is removed.
2. Harvests **inline `<script>` bodies** (`script:not([src])`) for analysis. In
   editable import, a remote `<script src="https://...">` is recorded and never
   executed because f0 re-implements GSAP/Lottie playback. **Run as live
   sandbox** instead preserves absolute HTTPS script dependencies. A LOCAL
   `<script src>` dropped with its file (folder or zip import) is inlined and
   kept as an "Imported script" code element that runs in Preview and Export
   only, on every page of the project (see motion-handoff.md, "Shapes that
   convert but play differently").
3. Runs two converters - CSS `@keyframes` and the GSAP subset (section 5) - and
   registers each result as a native f0 interaction.
4. Anything a converter could not take is reported in the **Import Report** as a
   warning rather than silently mangled. Nothing is a mystery afterwards, but you
   have to look.
5. Uploads every local asset it can see to project storage and rewrites the
   reference to the hosted URL. It sees `img[src]`, `video[src]`,
   `source[src]`, `poster`, linked stylesheets and scripts, and CSS `url()` in
   `style` attributes and `<style>` blocks. **Nothing else.** A path inside a
   `data-*` attribute (a JSON gallery list, `data-bg`, `data-src`) or inside a
   script string is neither uploaded nor rewritten, so it points at nothing in
   f0; `build-f0-export.mjs` doesn't bundle it either, and still reports every
   asset resolved. Keep each asset in a real attribute: a script-driven
   gallery keeps its photos as hidden `<img>` elements and reads `img.src`,
   which also hands the script f0's hosted URL after import. The validator
   warns on asset paths that appear only in `data-*` or inline scripts.

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
  outline, transparent background, inherited color, `cursor: pointer` on
  buttons, no resize on textareas, no native select arrow. Style them with
  `ds-input` / `ds-button` or your own rules - there is no UA chrome to remove.
- **`summary { list-style: none }`** plus the webkit marker removed - the native
  `<details>` triangle is gone, so supply your own chevron.
- **`[data-f0-id] { position: relative; min-width: 0; }`** on every element.
  So every element is a containing block: an absolutely positioned child that
  should anchor to a grandparent (a menu panel spanning the nav bar, not its
  40px toggle) anchors to its parent instead. Give the in-between element
  `position: static` with a selector of two classes or more
  (`.site-nav-pill > .site-burger`); one class ties with the attribute rule.
- **Lists and headings lose their UA look too**: `ol`/`ul` have no margins (the
  `*` rule) and bare `h1`/`h2` are weight 400. State `margin-block` and
  `font-weight` on anything that relied on them, or the page reads lighter
  and tighter than your local build.
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

**A page only renders as designed if the project HAS these tokens.** When the
DESIGN.md was not imported (or was imported into another project), every
`var(--color-*)`, `var(--font-*)` and `var(--spacing-*)` resolves to nothing:
white page, default font, collapsed spacing. The same goes for `ds-*` classes:
they style only if the project's design system defines their rules, and
`complete_design_system` deliberately holds back a class that elements already
carry. Key elements (the primary CTA) should carry their own class with full
styles rather than depend on `ds-button` alone. Check coverage after import (see
references/after-import.md).

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

## Prose that makes a DESIGN.md useful

The front matter is what imports; the prose is what the in-app assistant reads
as the brand's rules every time it generates or edits on this system. Keep both
working:

- Keep f0's own token keys in the front matter (`colors.primary`,
  `rounded.md`, ...). The descriptive names belong in the prose, never in place
  of the keys.
- In the prose, give each color a descriptive name, its hex and its job, one per
  line: "Deep Ink #18181B - body text", "Signal Lime #C6F432 - the one call to
  action per screen". A name plus a role tells a reader when to reach for it; a
  bare hex does not.
- Describe each component in plain words: its shape (pill, soft square, sharp),
  its edge (hairline border, none), its elevation (flat, offset block shadow,
  soft shadow) and how it responds (lifts on hover, darkens on press).
- End with a "Never" list: the treatments this brand bans (gradients on text,
  drop shadows on cards, a second accent color, centered body copy, and so on).
  A short, concrete list prevents more drift than a long description of what is
  allowed.

---

# 4. Responsive and the CSS rules

## Responsive-query behavior

For straightforward handoffs, author desktop-first base rules and step down with
plain `@media (max-width: Npx)`. Each width-bound query becomes a page-scoped
container query and a matching editor breakpoint, so it also works when the page
is displayed inside a section narrower than the browser viewport.

- Both `min-width` and `max-width` size conditions are preserved in current
  source, BUT the packaged app that published a real handoff (2026-10-04)
  flattened a `@media (min-width: 768px)` block into a base rule, hiding a
  phone-only element everywhere. Until that ships, write show/hide as a base
  rule plus a `max-width` override (`.x { display: none }` then
  `@media (max-width: 767px) { .x { display: block } }`), with the base rule
  earlier in the file. Boundaries
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
- **Never `!important`**, with one exception below. f0's per-element rules
  already out-specify class rules, and writing a selector replaces its rule
  wholesale, so there is nothing to fight. If a style "won't take", a more
  specific rule is shadowing it.
- **Never follow a selector group with a rule for one of its members** in the
  same scope (`.a, .b { ... }` then `.b { ... }`). The importer gives every
  selector in the group ONE shared declaration list and merges the later rule
  into it, so `.b`'s override lands on `.a` too. On a real handoff this
  collapsed a phone grid, turned a plus icon into a dash and put two masks in
  phase. Write one full rule per selector instead. Bare element groups
  (`h1, h2, ...`) are handled separately and are fine.
- **No top-level `@starting-style` or `@supports`.** The rule store flattens
  both: `@starting-style`'s entry state becomes the element's permanent state
  (an open menu stuck at opacity 0), and an `@supports` condition is dropped
  so its rules always apply. Put `@starting-style` inside
  `@media (prefers-reduced-motion: no-preference) { ... }` (shipped verbatim)
  with extra specificity on its selectors.
- **Non-size media blocks land before the page CSS.** `@media
  (prefers-reduced-motion: ...)`, `(hover: ...)`, `print` and similar ship
  verbatim as global CSS emitted AHEAD of the page's rules, so an override in
  them loses to an equal-specificity base rule. In
  `@media (prefers-reduced-motion: reduce)` mark the declarations
  `!important` (the exception), or better, put motion only in a
  `no-preference` block so there is nothing to undo. Those blocks also never
  render on the editor canvas, only in Preview and Export.
- **No `-webkit-mask-composite`.** It is renamed to `mask-composite` with its
  webkit value (`source-in`, `xor`), which is invalid there. Use the standard
  `mask` / `mask-composite` (`intersect`, `exclude`) only.
- **Put `@font-face` before any comment** if you package with an older
  `build-f0-export.mjs`: older versions read a leading comment as part of the
  first rule's selector, and a word like `DESIGN.md` looked like a class, so
  the font file was left out of the export. Current versions strip comments
  first.
- **Never write `opacity: 0` or `display: none` into persistent CSS on an animated
  element.** Let the runtime own the starting state, or it stays invisible when the
  animation does not run.
- **The published HTML is pretty-printed.** Every element starts on its own
  indented line, so whitespace now sits between siblings that had none in your
  file. Inline and inline-block children render it as a space: letters split
  into `<span>`s read "S t o p" and the heading wraps. Make such a parent
  `display: inline-flex` / `flex` (flex ignores whitespace-only text), never
  rely on "no space between tags".
- **Inline styles are the exception**, for a value that genuinely cannot be a class
  (a measured pixel height for a collapse). A whole design expressed as inline
  hardcoded styles defeats the design system entirely.
- **A class is assigned first and defined second.** Naming `.hero-eyebrow` before a
  rule exists IS the brief. Never strip a class for being undefined - that includes
  state classes (`.is-open`, `.is-active`, `.is-sticky`).

## Pages publish flat; link to them by their published names

A published site has no folders: every page is `<site>/<page-name>.html` at the
root, and the homepage is `index.html` only (`homepage.html` 404s). The import
does not rewrite links between pages (`build-f0-export.mjs` rewrites asset
paths only), so:

- name the homepage file `index.html` and link it as `./index.html`;
- keep every page at the project root (`blog/post.html` publishes as
  `post.html`, and both `./blog/post.html` and the post's own parent-folder links
  break);
- after publishing, request every internal link and expect 200.

## RTL

**Put the direction on your own top-level wrapper**, e.g. `.page-main {
direction: rtl; }` on the `<main>`. A published f0 page is served as `<html
lang="en">` with no `dir`, and f0's page wrapper (where the editor keeps the
page's own `direction`) is not published - `<main>` sits straight under `<body>`.
`dir="rtl"` on `<html>` in the source, or `direction` on the page root, works in
the editor and is gone on the live site: the whole page flips to LTR. The same
goes for anything else page-level (background, font): set it on your wrapper.

If the content may run right-to-left, use logical properties - `inset-inline`,
`margin-inline`, `padding-inline`, `border-inline` - not `left`/`right`. In motion,
mirror the sign and the origin: shift by `dir * (rtl ? 34 : -34)`, use
`transformOrigin: rtl ? 'right' : 'left'`, wipe with
`clipPath: rtl ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'`, and swap ArrowLeft /
ArrowRight. Read direction from the DOM (`root.dir === 'rtl'`), not a build-time
guess.

# 5. Write for the CMS that follows

Once a project is wired to a CMS (the WordPress flowmo theme, or f0's own
content lists), the content is edited there, not in your source. These rules
come from a real site that broke in production after its first CMS editing
session, while the f0 Preview and the staging publish were both fine.

- **Nothing lives inside an element the CMS binds as text.** Connecting the
  CMS (`cms_auto_connect`) binds each text element as ONE text field holding
  its text content, and every child element inside it is gone from then on;
  later CMS edits save plain text too. That killed count-up spans
  (`<p class="stat"><span class="stat-num">88</span><span>%</span></p>` became
  the field value `88 %`), the FAQ "+" icon span inside a `<summary>` bound as
  the question, a typewriter caret span, and a title nested in a text block.
  Animations aimed at them then target nothing, silently. Make each part its
  own sibling element:

  ```html
  <div class="stat-value">
    <span class="stat-num">88</span><span class="stat-suffix">%</span>
  </div>
  ```

  Here the number and the suffix are separate fields, and the wrapper is
  never a text field. Draw decorative marks (icons, carets, bullets) with CSS
  pseudo-elements on the element itself (`.faq-trigger::after`), which no
  binding or edit can remove. After connecting, read `get_cms_state` and check
  which element each text field is attached to.
- **WordPress rich-text fields run `wpautop`.** A rich-text (`wysiwyg`) field
  goes through WordPress's automatic paragraphs on output: every newline in
  the stored HTML becomes a `<br>` and loose text is wrapped in `<p>`. Exported
  HTML has a newline between tags, so a legal page came out as
  `<span>...</span><br><strong>Applicant</strong><br><span>...</span>` (each
  defined term on its own line), every link and list item gained `<br>`s
  (text broken a word per line, empty numbered items), and a `<p>` holding a
  `<strong>` was wrapped into a `<p>` inside a `<p>`, which the browser splits,
  so the line falls outside its own selector. Before a rich-text field ships:
  - store its value with no whitespace between tags, or turn off automatic
    paragraphs on that field;
  - prefer plain text fields and plain markup for anything that is not
    long-form prose;
  - check the published HTML of every rich-text field for injected `<br>` and
    nested `<p>`.
- **Build every repeated item as one uniform template.** Repeated cards, FAQ
  items, logos and team members are turned into a CMS list that renders one
  template for every item. Per-item classes (`.tile-acme { background: ... }`)
  and per-item ids do not survive. Any per-item difference must come from a
  field the list can hold (an image, a colour value), or from a CSS selector
  on the content itself (`.tile:has(img[src*="acme"])`).
- **Header and footer content is per page.** The shared header/footer keep one
  element id on every page, but their text and links are stored per page. The
  homepage was filled in and every other page published an empty logo `href`,
  an Apply button with no text, and an empty newsletter card. Keep the chrome's
  content minimal and identical. After the CMS is wired, open EVERY page and
  check the chrome, not just the homepage.
- **Nothing important may rely on an imported script or local-only CSS.**
  Imported scripts run in f0 Preview but are not published to WordPress
  (marquee drag/pause, a video pause button and Lenis all vanished). CSS that
  f0 replaces (a scroll-snap or coverflow track under f0's carousel) never
  applies. Ship the behaviour natively, or plan its WordPress-side injection
  before launch.
- **Plan scroll length per device.** A pinned scroll story measured in `vh`
  is as long on a phone as on a desktop (one ran to about 2,300 screen
  heights). Give the range markers shorter heights under 767px.
