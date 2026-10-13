# Portable UX craft

This half of the package is not about games. It is the portable interaction-craft
layer, ported from a product's general app UX-craft rules, expressed in f0
vocabulary so it applies to any Designer page, section, or interactive element -
a plain dashboard included. Pair it with flowmo-design-craft (visual hierarchy,
type, color, motion in general) and flowmo-interactive-design (how f0 actually
builds code-driven pieces); this reference adds the interaction-judgment layer
those two don't cover on their own.

## Surface selection: what shape a screen should be

Match the shape of a page to the shape of the task before styling anything. The
actual product surface is the first thing shown - never a splash, never a
marketing hero, when the request is a working tool.

| Task shape | f0 surface shape |
| --- | --- |
| Primary creation/generation tool | A Designer `page` (or `dashboard`) with the working surface front and center - the main input/canvas area, controls adjacent to it, results appearing after the first action, not buried behind a click. |
| Feed / gallery / history | A `ds-grid` section with a filter row above it and a detail view (inline panel or modal, see below) for a selected item. |
| Editor / notes / project tool | A split layout: a list section, a main work section, an optional inspector section - three regions on one page, not three separate pages. |
| Board / pipeline | A horizontally-scrolling section (`overflow-x: auto` on its own container) inside a fixed page shell - the page itself never scrolls sideways, only that one region does. |
| Settings / profile | A single width-constrained column (`ds-container` at a narrower max-width) of grouped sections, not a wide dashboard-shaped grid. |
| Dashboard / stats | Bands of metric groups (`ds-card`-based stat tiles), one chart or number answering one question per section - not a wall of every metric at once. |

**Density:** pick one density per region, not per element. A console or a
table-heavy region runs tight - `--spacing-gap-tight` (8px) for internal gaps,
`--spacing-sm`/`--spacing-md` (8-16px) for padding. A content-first surface
(a feed, a gallery, a form) runs spacious - `--spacing-gap-spacious` (24px)
for gaps, `--spacing-lg`/`--spacing-xl` (24-48px) for padding, growing further
at wider breakpoints. Mixing tight and spacious inside the same region reads
as unfinished even when every individual value is a real token.

### Modal vs full page vs inline panel

Choosing the wrong container for a decision is a common failure mode independent
of visual polish:

- **Full page (a new Designer page, or full section swap):** the user is
  starting a genuinely different task with its own primary content - not a
  short decision about something they can still see behind it.
- **Inline panel / drawer / inspector section:** supplementary detail the user
  wants to check without losing the primary content - a selected row's detail,
  a settings rail next to the working canvas. Use the native engine's drawer
  pattern (`f0_invoke`, per flowmo-interactive-design) rather than hand-rolling
  a sliding box.
- **Modal (native engine, `f0_invoke`):** reserved for one focused, blocking
  decision the user must resolve - a confirmation, a short create/edit form -
  before anything else continues. Never use a modal for browsing, for a
  multi-step primary workflow, or for anything the user might reasonably want
  to leave open while doing something else; that belongs in a panel or its own
  page instead.

## Touch targets and general interaction

Keep interactive elements at least ~40px, per flowmo-design-craft's own
affordance rule - this package does not raise or lower that floor. For a
touch-primary or dense control surface (on-screen game controls, a mobile
overlay, a toolbar meant to be used one-handed), treating ~44px as the practical
minimum instead is a tighter floor on the same rule, not a contradiction of it -
pick the higher number for that region, the lower number is still the general
default elsewhere. Whichever floor applies, keep adjacent targets at least
~8px apart so a slightly-off tap doesn't land on the wrong one; pad the hit
area around a small icon rather than enlarging the glyph itself.

Two general interaction rules apply everywhere, not just to touch targets:

- Every clickable element gets `cursor: pointer`, a visible hover state, AND a
  visible pressed state that reads within ~100ms - hover is an enhancement,
  never the only signal, since a touch surface has no hover at all.
- `disabled` means the semantic `disabled` attribute plus disabled styling
  (a muted text/border token, not just lowered opacity) - a control that only
  looks faded but still fires on click is a worse bug than one with no
  disabled styling at all, because it reads as interactive and lies.

Drag interactions need a real movement threshold - roughly 6px - before a
press counts as a drag rather than a click, so an intended tap doesn't
misfire as an accidental drag; give the user real-time visual tracking while
the drag is in progress, not just a result on release.

## Async and loading states

- Disable the trigger the moment an async action starts, and show progress
  rather than leaving a clickable control sitting there while a request is in
  flight.
- Anything that could take more than ~300ms shows a real loading surface (a
  skeleton shape, or a styled loading state on the affected element) instead of
  a bare spinner with nothing else on screen.
- Every async action ends in a visible outcome: a success state change, or an
  error with an actual retry path. A silent timeout is a bug, not an edge case.
- Inspect the canvas with `get_canvas_state` before scripting a loading/async
  interaction so the states you author target the elements that actually exist,
  rather than guessing ids/classes.

## Focus management

- Every interactive element keeps a visible focus ring; tab order follows visual
  order.
- `Esc` closes the topmost open overlay only - one layer at a time, never the
  whole stack at once.
- A modal traps focus while open and returns focus to whatever triggered it on
  close.
- Icon-only controls need an accessible label (`aria-label` or equivalent) even
  when their meaning looks obvious visually; decorative images get an empty alt,
  meaningful ones get real alt text.
- Never convey state by color alone - pair a color change with an icon, a label,
  or a shape change, so the state still reads under colorblindness or on a
  washed-out display.
- A toast/notification must never steal focus - announce it politely and let
  it sit for roughly 3-5s, with an action button attached whenever there's
  something the user could actually do about it.

## Overlay layering

Popup content (a select menu, a dropdown, a popover) must be able to escape a
scrolling or `overflow-*`-clipping ancestor - never render a selector menu as
an inline, absolutely-positioned child of a creation rail, sticky footer, or a
modal/drawer; portal it to the document root instead.

Preserve one semantic layer order instead of patching collisions ad hoc:
reaching for an arbitrary very-high z-index value to fix one collision, or
assigning every popup the same top layer, both break down the next time two
overlays need to stack in a specific order. Watch for accidental local
stacking contexts too - `transform`, `filter`, `opacity`, `isolation`, or a
positioned element carrying its own `z-index` on a wrapper around a trigger
can silently trap its popup below content it should sit above.

In nested overlays (a select open inside a modal, say), `Esc` closes the
inner popover first, then the parent modal on a second press - never both at
once. Test pointer, keyboard, focus trap/restore, and click-outside behavior
with the popup open near every viewport edge, not just centered.

## Forms and feedback

- Every input carries a real, visible label - not a placeholder standing in
  for one, since a placeholder disappears the moment the user starts typing
  and screen readers don't treat it as a label. Helper text for a complex
  field stays visible, not just on focus.
- Validate on blur or on submit, never on every keystroke - an error that
  reappears on each character typed reads as the form yelling at the user
  before they've finished. The error appears under the offending field and
  states both cause and fix (e.g. "Prompt is empty - describe what to
  generate," not just "Invalid"), and the first invalid field gets focus
  after a failed submit.
- Use semantic input types (`email`, `number`, `url`) and autocomplete
  attributes so the platform's own affordances (numeric keypads, autofill)
  kick in for free.
- Every submit flow ends in a visible outcome: a success state/toast, or an
  error with a real retry path. A timeout is an error with retry, never
  silence.
- A multi-step flow shows progress and allows going back; confirm before
  dismissing a modal/drawer that holds unsaved input rather than discarding
  it silently.

## Layout and responsive

- Mobile-first, and size the page with `min-height: 100dvh` - never a bare
  `100vh`, which doesn't account for mobile browser chrome. No page-level
  horizontal scroll: wide content (a board, a table) scrolls inside its own
  `overflow-x: auto` region, never the whole page.
- Constrain flexible content deliberately: `min-width: 0` plus `text-overflow:
  ellipsis`/truncation on flexible text (with a `title` attribute carrying the
  full value), `minmax(0, 1fr)` on grid columns that hold text, a `max-width`
  on long-form body copy so a line doesn't run the full viewport width.
  - A fixed bar (a sticky submit row, a floating composer) needs to reserve
  scroll-region padding for itself so content doesn't end up hidden behind it,
  and respect safe-area insets on mobile.
- One primary CTA per screen; secondary actions stay visually subordinate.
  When actions overflow a toolbar, collapse the overflow into a menu - don't
  shrink every button to fit.
- The current location is always visible: the active nav item is highlighted
  independent of hover, and back-navigation preserves scroll position and any
  active filter state rather than resetting the view.
- Verify breakpoint behavior explicitly at three widths before calling a
  layout done: ~375px (mobile), tablet, and desktop - a sidebar that doesn't
  collapse into a smaller-surface pattern below desktop is a real bug, not a
  nice-to-have.

## Destructive-action confirmation

Separate a destructive action from the primary action spatially, give it a
visually distinct treatment, and gate it behind a confirmation step rather than
firing on a single click. In f0 terms:

- Check `get_design_tokens` for a danger/error color already defined on the
  payload before composing the button. If the design system does not carry one
  yet, that is a gap worth flagging rather than hardcoding a red hex value -
  per flowmo-frontend-design's additive-extension rule, add one new token-driven
  class rather than inlining a color.
- The confirmation itself is the native engine modal pattern above, not a
  second inline warning stacked under the button.
- For a reversible bulk action, an "undo" affordance after the fact is often a
  better fit than a confirmation dialog before it - it keeps the action fast for
  the common case and still gives the user a way back.

## Generated-media grid layouts

When laying out a grid of generated results for review (images, video frames,
audio waveforms), use `ds-grid` for the container and preserve each item's real
aspect ratio - do not force every card into one shared crop. A single uniform
16:9 or square crop belongs only on curated preset thumbnails chosen ahead of
time, never on a live results/history grid where the aspect ratio varies per
item.

`ds-grid`'s documented variants are fixed column counts (`ds-grid-2/3/4-column`),
not an auto-fit/minmax responsive primitive - there is no live f0 token yet for
a variable-count auto-fit gallery. Two honest options until that exists: pick
the `ds-grid-*-column` variant nearest the intended density and let items wrap
normally, or - flagged here as proposed, not an existing capability - add an
additive custom grid class (per flowmo-frontend-design's "additive extension"
allowance) using CSS `grid-template-columns: repeat(auto-fill, minmax(...))`
with `var(--spacing-*)` gap tokens, for the specific case where a fixed column
count genuinely does not fit a variable-count gallery.

## Motion timings

Use flowmo-design-craft's existing duration bands as the baseline - do not
invent a second scale:

- UI micro-interactions: 150-300ms.
- Entrances: 400-800ms.
- Ambient/looping motion: slow, well below either of those.

One addition worth stating explicitly for anything with real-time feedback
(a game, or a console-style tool with live controls): the raw acknowledgment
that an input registered at all - a button's pressed state, a control
responding to a drag - should read as effectively instant, at or under ~100ms.
That is a different thing from a 150-300ms micro-interaction tween: the
acknowledgment is "the system heard you," the micro-interaction is the
polished transition that follows it. Author the instant part as an immediate
state change (a pressed/active class, a `click`-triggered tween with a very
short duration) and let the 150-300ms band handle whatever settles in after it.

A few more additions not already covered by flowmo-design-craft's own bands:

- An exit transition runs roughly 60-70% of its matching enter duration - a
  panel that took 400ms to arrive should leave faster than it arrived, not at
  the same duration or slower.
- Animate `transform`/`opacity` only for interaction motion - never
  `width`/`height`/`top`/`left`, both for performance and because animating a
  layout property can trigger a visible layout shift in surrounding content.
- Animate 1-2 key elements per view at a time, not everything at once; when a
  list staggers in, a per-item delay of roughly 30-50ms reads as a wave
  rather than a stutter (prefer flowmo-motion-design's `amount`-based stagger
  when the total spread must stay constant as item count changes - see that
  package). Motion should express cause and effect - a panel slides in from
  the side of its trigger, a modal scales from its own center - never
  decorative movement with no relationship to what caused it.
- Never block user input while something is merely animating - a transition
  is not a valid reason to make a control temporarily unresponsive.

## Data and charts (dashboards)

- Match the chart type to the question: a trend over time is a line, a
  comparison between categories is a bar, a proportion of a whole is a donut
  with 5 slices or fewer - past 5 slices, switch to a bar chart instead, since
  a donut past that count stops being legible at a glance.
- Keep legends visible and tooltips available on hover/tap; gridlines stay
  low-contrast (a subtle border token, not a strong line competing with the
  data); numbers render as tabular figures and locale-formatted, not raw
  floats.
- A loading chart is a skeleton shape, an empty chart is a designed empty
  state with real copy, and a failed chart is an error with retry - never a
  bare axis frame with nothing plotted on it and no explanation.
