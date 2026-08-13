---
name: flowmo-authoring-contract
description: How to author a self-contained HTML file (and a DESIGN.md design system) that a user can drag and drop straight into flowmo / Flowgen without losing work - the token and ds-* vocabulary, the DESIGN.md front-matter shape f0 imports as a design system, the breakpoint ladder that is linted, and the exact GSAP subset that converts into native f0 interactions instead of being dropped. Use whenever you generate HTML, CSS, GSAP or a design system that will end up inside flowmo.
---

# flowmo authoring contract

You are producing a **handoff artifact**: a file the user drags and drops into
flowmo. Usually one self-contained `.html`; sometimes a `DESIGN.md` design system.
Everything below is about what survives that drop.

You do not need flowmo open, and nothing here requires a live connection to the
app. Write the file, hand it over, the user drops it in.

**Every failure mode below is silent.** A `<head>` that was discarded, a
`min-width` block that was dropped, a `gsap.timeline()` that never became
editable - none of them error. They are simply not there afterwards, and the user
finds out by noticing something missing.

## The five non-negotiables

1. **There is no `<head>`.** It is discarded on import. `<link rel="stylesheet">`,
   `<script src="...">` and CSS `@import` are recorded, warned about, and never
   loaded.
2. **Tokens and `ds-*` are the vocabulary.** Never Tailwind or Bootstrap - neither
   exists in the imported page. Never a `var()` fallback.
3. **Base IS desktop.** Step DOWN with `max-width` at 1279 / 1023 / 767 and nothing
   else. A `min-width` below 1440px is DROPPED, block and all.
4. **Only three GSAP shapes convert**, and only with a recognised trigger.
   Everything else is kept but not editable - or, with no trigger at all, does not
   run.
5. **Selectors must be stable classes and ids you put in the HTML.** f0 owns
   element ids and strips `data-f0-id`, so never target those.

---

# 1. The drop contract

What the importer does with your file, in order:

1. Parses the HTML into an editable element tree. **`<head>` is discarded.**
2. Harvests **inline `<script>` bodies** (`script:not([src])`) for analysis.
   `<script src="...">` is recorded and never executed - f0 re-implements
   GSAP/Lottie playback in its own runtime. Keep CDN tags for your own local
   testing if you like; they are ignored on import.
3. Runs two converters - CSS `@keyframes` and the GSAP subset (section 5) - and
   registers each result as a native f0 interaction.
4. Anything a converter could not take is reported in the **Import Report** as a
   warning rather than silently mangled. Nothing is a mystery afterwards, but you
   have to look.

So there are exactly two ways to get what a `<head>` would have given you:

- **Fonts** come from the design system. Use the families the project's system
  declares (or declare them in a DESIGN.md, section 3). Do not link Google Fonts
  and do not `@import` a font stylesheet.
- **Styles** go in an inline `<style>` block inside the body of the file you hand
  over. Full CSS selectors work there - descendant, `:hover`, `:nth-child`,
  `@media` - and they are guaranteed to match because you also wrote the classes
  onto the elements.

Other things worth knowing before you write:

- **Media:** where slots are supported, write `data-f0-slot="hero"` for a
  placeholder, or `data-f0-source="asset:hero_img@v3"` (`kind:id@version`, kind =
  `asset` | `node-output` | `marketplace-listing`) when you already know the
  source. Ids are short, lowercase, hyphenated and unique per page - they are what
  a user's media re-attaches by. Never hand-write JSON into that attribute.
- **Give meaningful elements a `data-name`.** It becomes the layer name.
- **Do not use engine-internal class names** (`page`, `text`, `rect`, `image`,
  `fmod`).

---

# 2. Design system: tokens and `ds-*`

Two layers. Build on both and the user can restyle everything by swapping the
system; hardcode values and the swap does nothing to your markup.

## Tokens

`--color-*`: primary (+ `-hover`, `-active`, `-subtle`), secondary (+ `-hover`),
accent (+ `-subtle`), accent-2, text, text-muted, the on-fill set
(`--color-text-on-primary`, `-on-secondary`, `-on-accent`), background, surface,
surface-alt, border, border-subtle, success, warning, error, ring, overlay, the
contrast-section family (`--color-section-dark-bg`, `-text`, `-text-muted`,
`-surface`, `-surface-alt`, `-border`, `-border-subtle`, `-glass-bg`,
`-glass-border`), and the glass material (`--glass-bg`, `--glass-border`).

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

**Compound (structure only):** `ds-tag`; `ds-accordion` / `-item` / `-trigger` /
`-content`; `ds-carousel` / `-wrapper` / `-container` / `-slide`; `ds-tabs` /
`-container` / `-trigger` / `-content`; `ds-dropdown` / `-trigger` / `-menu`.

**Utilities:** `ds-image-frame`, `ds-section-dark`, `ds-glass`,
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

## Contrast sections

`ds-section-dark` is the semantic CONTRAST band, not literally "dark": a light
system inverts to a dark band, a dark system to a light one. Descendants are
rebound to the `--color-section-dark-*` family automatically, so do NOT hand-write
dark-only compensation inside it - that fights the rebinding and breaks the moment
the system is themed.

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

## The breakpoint ladder is CHECKED, not advised

Author plain `@media (max-width: Npx)`. Each width-bound query is converted into a
CONTAINER query scoped to the page and gets a matching entry in the page's
breakpoint list - which is what lets a breakpoint work inside a section that is
not full width. **Do not hand-author `@container`.**

- The only sanctioned queries are `@media (max-width: 1279px)`,
  `@media (max-width: 1023px)` and `@media (max-width: 767px)`.
- An off-ladder `max-width` (768, 1024, 1280, 767.98) is SNAPPED to the nearest
  sanctioned boundary and reported. Your rules survive, at a boundary you did not
  choose.
- **A `min-width` below 1440px is DROPPED, block and all.** Dropped rather than
  repaired, because keeping it is worse: unchecked, it gets UNWRAPPED into the
  desktop base and a mobile-first stylesheet's narrow rules silently become the
  rules everybody sees. Base IS desktop. Step down, never up. If you catch
  yourself reaching for `min-width`, you have slipped into mobile-first - put the
  desktop styles on the base rule and flip only what changes smaller.
- `min-width: 1440px` and above is the one exception - the opt-in wide-screen
  treatment - and passes through untouched.
- ONE block per boundary. Merge selectors instead of repeating the query.
- Most pages need only the 767 query. Each query overrides ONLY what changes -
  never restate the whole rule.
- `@media (prefers-color-scheme: ...)` and other non-width queries pass through
  as raw `@media`; they render correctly but do not join the breakpoint switcher.

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

# 5. GSAP: exactly what converts

Write animations as **inline `<script>` GSAP calls**. Each converted call becomes
one native f0 interaction the user can scrub and keyframe-edit.

## The three conditions

All must hold:

1. The call is `gsap.to`, `gsap.from` or `gsap.fromTo` - **not**
   `gsap.timeline()`.
2. The target is a **CSS selector string** (`'.hero-title'`), or the
   `gsap.utils.toArray('.card').forEach((item, i) => gsap.from(item, ...))` loop
   pattern, which IS resolved back to its selector. No DOM refs, no
   `document.querySelector` variables, no arrays.
3. There is a recognised trigger, meaning either
   - `scrollTrigger: { trigger, start, end, scrub? }` inside the tween's vars -
     with a truthy `scrub` it becomes scroll-scrub, without it scroll-reveal
     (plays once on enter); or
   - the tween sits inside `el.addEventListener('mouseenter' | 'mouseover' |
     'click', ...)`, becoming a hover or click interaction.

Keep `vars` a plain object literal - strings, numbers, booleans, `null`, simple
arrays, and one nested `scrollTrigger: {}`. No function values, no computed keys,
no template-literal interpolation. Use GSAP property shorthand (`x`, `y`, `scale`,
`rotation`, `opacity`).

## What is lost, and what is kept

- `duration`, `delay`, `ease` and `stagger` are lifted into playback. **Everything
  else left in vars becomes the keyframes.** The control keys `onComplete`,
  `onStart`, `paused`, `repeat` and `yoyo` are STRIPPED - **a converted tween
  cannot repeat or yoyo.** If the loop is the point, write a timeline and accept
  that it stays uneditable.
- `delay: i * 0.2` inside a loop is promoted to a real stagger; `stagger: 0.1`
  converts directly.
- `gsap.timeline()`, `ScrollTrigger.create()` and hand-written scroll listeners
  never convert. A timeline is KEPT and runs verbatim - full GSAP, lossless round
  trip - it simply is not editable in f0's UI. That is a legitimate choice, not a
  failure; the wrong move is writing one without knowing.
- **A tween with NO trigger is reported "imported but not connected to a
  recognized trigger" and does not run.** No error, no motion.
- CSS `@keyframes` convert to load-triggered animations, but only when the
  animation defines both a `0%` and a `100%` step.

## Media scrub is DECLARATIVE - mark the element, write no script

There is no analyzable GSAP idiom for `video.currentTime = ...` or
`lottie.loadAnimation(...)` driven by a ScrollTrigger, so media scrub is wired by
**attributes on the element** instead. Opt in with the marker (bare attribute,
`""` or `"true"` = on; `"false"` / `"0"` / `"off"` = off).

```html
<!-- Lottie: frames driven 0 -> 100% across the scroll span -->
<div data-f0-lottie="https://cdn/hero.json" data-f0-lottie-scrub
     data-f0-renderer="svg"></div>

<!-- Video: currentTime driven by scroll -->
<video src="https://cdn/clip.mp4" muted playsinline data-f0-video-scrub></video>

<!-- Image sequence: flip-book frames driven by scroll -->
<div data-f0-image-sequence='{"baseUrl":"/seq/","files":["1.jpg","2.jpg"]}'
     data-f0-image-sequence-scrub
     data-f0-image-sequence-fit="cover"></div>
```

- The image-sequence manifest may be `{ baseUrl?, files: [...] }` JSON, a plain
  JSON array, or a comma / newline separated list. `-fit` takes `cover`,
  `contain` or `fill`.
- Shared optional attributes on any marked element: `data-f0-scrub-start`
  (default `"top bottom"`), `data-f0-scrub-end` (default `"bottom top"`), and
  `data-f0-scrub-trigger="<selector>"` to observe scroll somewhere else.
- A `<video>` can be marked directly, or a WRAPPER can carry
  `data-f0-video-scrub` to opt its inner `<video>` in.
- Ship a Lottie as `<div data-f0-lottie="...">`, **not** a `<lottie-player>` web
  component.
- A media element WITHOUT a marker just plays or loops as normal. The marker is
  the only opt-in.

## SVG draw, morph and motion path

These are not separate animation types - they are ordinary `simple` animations
with **special keyframe keys**, so you can express them as normal GSAP vars and
let the converter carry them through. Use f0's key names, not the GSAP plugin
syntax:

```html
<script>
  // Draw a stroke on scroll-reveal
  gsap.from('.logo-path', {
    svgDraw: { start: '0%', end: '0%' },
    duration: 1.2, ease: 'power1.inOut',
    scrollTrigger: { trigger: '.logo', start: 'top 80%' }
  });

  // Morph one path into another on click
  document.querySelector('.icon-menu').addEventListener('click', () => {
    gsap.to('.icon-menu', { svgMorph: { to: '.icon-close' }, duration: 0.4, ease: 'power3.inOut' });
  });

  // Follow a path, scrubbed
  gsap.to('.ball', {
    motionPath: { path: '#curve', autoRotate: true, start: 0, end: 1 },
    ease: 'none',
    scrollTrigger: { trigger: '.path-section', start: 'top center', end: 'bottom center', scrub: true }
  });
</script>
```

The runtime loads `DrawSVGPlugin`, `MorphSVGPlugin`, `MotionPathPlugin`,
`SplitText`, `Draggable`, `InertiaPlugin`, `Flip`, `ScrollTrigger` and
`CustomEase`, so all of these are real once they land. Keep the vars a plain
nested object literal, exactly like `scrollTrigger`.

**Verify these landed** in the Import Report rather than assuming: they ride the
generic keyframe path, so a typo in a key name does not error - it just arrives
as an unknown property.

## Text split

`splitText` on the vars (`"chars" | "words" | "lines"`, plus a mask option) is the
supported way to get per-character or per-line reveals. Do not hand-roll a split
by wrapping every character in a `<span>` - that produces hundreds of elements the
user then has to live with in the layer tree.

## Writing the script

- No `import`, no `require`, no `DOMContentLoaded` wrapper - your code runs after
  the markup exists.
- **Assume it runs twice.** Previews remount. Guard global setup
  (`if (window.__f0Tabs) return;`), prefer ONE delegated listener on `document`
  over one per element, and read state from the DOM rather than a module variable
  a second evaluation would reset.
- **Toggle state, do not restyle.** `el.classList.toggle('is-open')` and
  `el.setAttribute('aria-expanded', 'true')`, not `el.style.height = ...`.
- **Animate only what exists.** A tween pointed at nothing is silent.
- `gsap.from` sets the start state at run time, so the page paints once first. If
  that flash matters, hide the initial state in CSS and animate TO visible with
  `gsap.to`.
- Honour `prefers-reduced-motion` - guard the decorative half with
  `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
- Keyboard and ARIA are part of the behaviour: Escape closes overlays, tabs respond
  to arrow keys, `aria-expanded` / `aria-selected` stay honest, and a `div` used as
  a control needs `tabindex="0"` plus Enter/Space.

---

# 6. The native interaction model (everything GSAP cannot say)

The GSAP subset in section 5 covers tweens. f0's own interaction schema covers a
great deal more, and it is what the editor, the preview and the published site all
run. Knowing the vocabulary tells you what to ask for, and what to hand over.

## Animation types

| Type | What it is |
| --- | --- |
| `simple` | one tween: keyframes + trigger. What the GSAP converter produces. |
| `timeline` | multi-layer timeline, per-property tracks (`style`, `transform`, `action`, `plugin`), per-layer `startOffset`, nestable precomps. Keyframe-at-0 is a "from". |
| `carousel` | slider / marquee / fade controller, with bullet + arrow pickers and per-bullet labels. |
| `auto-animate` | state-to-state animation of a subtree; an indexed variant gives you a carousel-of-keyframes. |
| `morph` | element-to-element morph. |
| `variant-animate` | animate between declared variants. |
| `follow-mouse` | RAF cursor follow: smoothing, distance cap, look-at, reverse-look-at, hide-cursor, offsets. |
| `form-submit` | validation, submit action (none / email / webhook / custom), success and failure outcomes. |
| `layout` | FLIP-style class-swap layout animation. |

## Triggers, and their options

`load` (`delay`) - `click` (`reverseOnClickOutside`) - `hover` - `focus` -
`scroll-reveal` (`viewport`) - `scroll-scrub` (`start`, `end`, `startOffset`,
`endOffset`) - `mouse-position` (`axis`, `scope`) - `form-submit`
(`preventDefault`) - `resize` (`mode`, `minWidth`, `maxWidth`, `debounce`) -
`page-unload` (`delay`, `prevent`) - `swipe` (`direction`, `threshold`,
`reverse`) - `drag` (`axis`, `mapToProgress`, `bounds`, `inertia`) -
`follow-mouse` (`smooth`, `scope`) - `scroll-inertia` (`scrollInertia`).

Every trigger also takes `groupSelector` (key animations per ancestor match),
`animationTarget` (animate something other than the trigger), `instanceScope`
(`off` = one singleton across all matches), `reverseOnSibling` and `yoyo`.

Beyond tweens, the plugin set includes counter, typewriter, text-scramble,
quick-mask, lottie-control, video-control, image-sequence-scrub, spline-control
and the SVG adapters.

## Which of these survive a drag-and-drop today

This is the part to be precise about, because the gap is silent.

**Importable from a dropped HTML file:**

- CSS `@keyframes` (needs a `0%` and a `100%`) - becomes a load-triggered
  animation.
- The GSAP subset from section 5 - becomes `simple` interactions with
  scroll-scrub / scroll-reveal / hover / click triggers.
- Special keyframe keys carried on those tweens - `svgDraw`, `svgMorph`,
  `motionPath`, `splitText`.
- Media scrub via the `data-f0-*-scrub` markers.

**Not reconstructed from markup alone:** timelines, carousel, auto-animate,
variant-animate, form-submit, follow-mouse, layout, drag/inertia, and the
trigger options that have no GSAP equivalent (`swipe`, `resize`, `page-unload`,
`groupSelector`, `instanceScope`). A `gsap.timeline()` in your file is KEPT and
runs verbatim, but it arrives as a script, not as an editable f0 timeline.

**For all of those, carry the native payload instead** (below). It is imported
as authored - every animation type, `timeline` included - rather than inferred,
so nothing has to be guessable from a tween.

## The native payload: authored in, authored out

Anything the converter cannot express, the page can simply CARRY. Put the
definitions in an inert JSON block and they are imported as real f0
interactions - not reconstructed, not approximated:

```html
<script type="application/json" data-f0-interactions>
{
  "interactions": [
    {
      "id": "hero-carousel",
      "name": "Hero carousel",
      "trigger": { "type": "click", "target": ".carousel-next" },
      "animation": { "type": "carousel", "definition": { "target": ".slides" } }
    }
  ],
  "timelines": {}
}
</script>
```

- `type="application/json"` is inert by spec, so it never executes and is never
  re-attached as a script. This is the form to author.
- A `timeline` interaction references its timeline by `animation.definition.timelineId`;
  put the `TimelineDefinition` in the `timelines` map under that id. **A timeline
  interaction whose timeline is missing is dropped** - a dangling reference
  compiles to nothing and reads as "my animation vanished".
- Ids are RE-MINTED on import (so a payload can never overwrite an interaction
  already on the canvas) and selectors are SCOPED to the import (so an imported
  `.card` rule does not bind every `.card` in the project). Author plain, bare
  selectors and let the import scope them.
- `animation.definition.target: "trigger"` is a SENTINEL meaning "the element
  the trigger resolved to", not a selector. It is left alone.
- A comma group (`.a, .b`) is left unscoped, so prefer separate interactions
  over comma selectors if scoping matters.
- Malformed entries are skipped individually and reported; they do not take the
  rest of the payload down.

## Running the same file outside flowmo

f0's interactions runtime is a standalone, React-free bundle - the same one the
preview and the exported site use. The SAME definitions run outside flowmo when
the page assigns them to the global the runtime reads:

```html
<script>
  window.__F0_INTERACTIONS__ = {
    interactions: [ /* native interaction definitions */ ],
    timelines: { /* keyed by TimelineDefinition.id, for type:'timeline' */ }
  };
</script>
<script src="/interactions-runtime.js"></script>
```

This global form is ALSO imported natively (it is what an f0 export emits, so an
exported page re-imports losslessly), and the assignment is recognised and not
re-attached as a stray code element. So you can ship one file that both runs
standalone and imports cleanly. If you want the file to run before it is ever
imported, use this form; if it is purely a handoff artifact, the inert
`application/json` block above is tidier.

The bundle exposes `F0.init(...)` (also exported as `initF0Interactions`) taking
`{ interactions, timelines, scopeSelector | scopeElement, host }` and returning a
handle with `destroy()` and `refresh(next)`. It auto-initializes on
`DOMContentLoaded` when it finds `window.__F0_INTERACTIONS__`.

This is how an exported f0 site runs, which is exactly why it is the right shape
for a handoff file too: **the same artifact behaves identically inside flowmo,
in preview, on the published site, and on a plain static host.** Every animation
type above is expressible this way, `timeline` included - the schema is the full
vocabulary, not the converter's subset.

Two practical notes:

- **Where the runtime comes from.** An f0 export writes it to
  `assets/js/interactions-runtime.js` and points the page at it. For a handoff
  file that must run before it is ever imported, the user needs that bundle at a
  reachable URL - ask them for the one their project serves rather than guessing
  a path or inlining a stale copy.
- **Authoring the payload by hand is a real option** for the types the converter
  cannot reach, but it is verbose and the schema is the source of truth. Prefer
  the GSAP subset for anything it can express; reach for the payload when you
  need a timeline, a carousel, or a trigger with no GSAP equivalent.

# 7. Scripted and interactive code

Reach for code only when the visual cannot be a styled DOM element animated by
GSAP. Anything expressible as a reveal, fade, slide, parallax, scroll-scrub,
stagger, text reveal, hover tween, marquee, counter or SVG draw belongs in
section 5 - it stays editable there and becomes an opaque box here.

## What a dropped file can carry

Two routes, and they behave differently:

- **An inline `<script>`** that is not convertible GSAP is kept and runs verbatim
  as a page script. Good for bespoke canvas / WebGL / generative behaviour that
  just needs to run: write it as a normal inline script mounting into an element
  you also put in the HTML.
- **A `<script type="text/f0-tsx">` block** becomes a real interactive ELEMENT
  with sidebar controls (below). Use this when the user should be able to tweak
  it without touching code.

Keep it well-behaved, because it runs on the user's real page:

- Mount into your own element and size it to its container. Do not measure or
  write to `document.body`, and do not style anything outside yourself.
- Always clean up: `cancelAnimationFrame`, `removeEventListener`, dispose WebGL
  contexts and renderers, clear intervals.
- Do not attach global listeners without removing them.
- Scope scroll and resize handling to your own element.

## Keep the words editable

Any user-visible copy that could reasonably be edited belongs in real HTML
elements, not generated from inside a script. Text painted into a canvas or built
by JS is invisible to the editor, to search and to the CMS. The script should be
the BEHAVIOUR; the content stays the user's, as real elements they can select and
retype.

## Sidebar-controlled props

Inside flowmo, a code element can expose named controls that appear in the sidebar
and arrive as props, declared in the code itself:

```js
export const f0Fields = [
  { name: 'title',  type: 'text',   default: 'Hello' },
  { name: 'count',  type: 'number', default: 3, min: 0, max: 10 },
  { name: 'accent', type: 'color',  default: '#22d3ee' },
];
export default function Widget({ title, count, accent, children, isActive }) { /* ... */ }
```

Types: `text`, `textarea`, `number`, `color`, `boolean`, `select`, `image`,
`video`, `file`, `url`, `range`, `repeater`. `select` takes `options`;
`number`/`range` take `min`/`max`/`step`; `repeater` takes `itemFields` (no nested
repeaters). At runtime `number`/`range` arrive as JS numbers and `boolean` as a JS
boolean; everything else is a string. Declare a field for every prop you read - an
undeclared prop is `undefined`. **Field ids derive from `name`**, so keeping a name
stable keeps the user's value and renaming it orphans that value.

`number`, `range` and `color` fields are **animatable**: the editor drives them
from the timeline, scroll or hover by mutating `props.fields.<name>` in place,
every frame, **without re-rendering**. So read them live through a ref inside the
loop and keep setup in an empty-deps effect:

```jsx
const live = React.useRef(props); live.current = props;
React.useEffect(() => {
  let raf;
  const tick = () => {
    const speed = live.current.fields?.speed ?? live.current.speed ?? 1;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, []);   // EMPTY deps - never list an animatable field here
```

A value destructured at render time is captured by the closure and stays the first
frame's value forever; listing an animatable field in a deps array re-runs setup
every frame and rebuilds the whole experience.

**Ship a component in a handoff file** by putting its source in an inert TSX
block. It arrives as a real interactive element - selectable, code-editable, with
its `f0Fields` already exposed as sidebar controls:

```html
<script type="text/f0-tsx" data-f0-code-name="Hero">
  export const f0Fields = [
    { name: 'accent', type: 'color', default: '#22d3ee' },
  ];
  export default function Hero({ accent, children }) {
    return <div style={{ color: accent }}>{children}</div>;
  }
</script>
```

- `type="text/f0-tsx"` is not a JavaScript MIME type, so a browser never runs it
  and it is never mistaken for a page script (TSX would throw on line 1).
- `data-f0-code-name` is the component's KEY. Keep it stable and PascalCase - it
  is what the element is bound to across a round trip, so renaming it detaches
  whatever was using it. Without the attribute the component still imports, under
  a positional name.
- The fields are read from the source on import, so the controls are there
  immediately. Source that does not compile still imports - you get the element
  and the error in the code editor rather than a silent no-show.

## Libraries

These globals are available to code running inside flowmo, and load automatically
when referenced: `THREE`, `gsap`, `d3`, `p5`, `Tone`, `Matter`, `PIXI`, `Konva`,
`Lenis`, `CANNON`, `Howl`, `Chart`, `mapboxgl`, `L`, `Zdog`, `anime`, `Rive`,
`lottie`, `marked`, `DOMPurify`, `QRCode`, `Swiper`, `SplitType`, `Splitting`.
Reference the GLOBAL (`new THREE.Scene()`) - do not import it. If what you need is
not on that list, say so: a hand-written CDN tag will not load.

---

## Checklist before you hand the file over

- [ ] Nothing load-bearing in `<head>`; styles are in an inline `<style>`.
- [ ] `ds-*` classes and `var(--token)` values throughout; no Tailwind, no
      invented `ds-` names, no `var()` fallbacks.
- [ ] Every `@media` is `max-width` at 1279 / 1023 / 767; no `min-width` under
      1440; no `!important`.
- [ ] Sections are `flex-direction: column`, size to content, and rows wrap.
- [ ] Every GSAP tween is `to`/`from`/`fromTo`, targets a string selector, and has
      a `scrollTrigger` or a listener wrapper.
- [ ] No `repeat`/`yoyo` on a tween you expect to stay editable.
- [ ] Every selector you animate exists in the HTML, as a class or id you wrote.
- [ ] Anything the GSAP subset cannot express rides in a
      `<script type="application/json" data-f0-interactions>` payload, with every
      referenced timeline present in its `timelines` map.
- [ ] Components ship in `<script type="text/f0-tsx" data-f0-code-name="...">`
      with a stable PascalCase name.
- [ ] Copy lives in real elements, not inside scripts or canvases.
- [ ] `prefers-reduced-motion` is honoured.
