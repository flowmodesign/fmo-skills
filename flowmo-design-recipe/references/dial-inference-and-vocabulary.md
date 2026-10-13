# dial inference, extended AI-tells, and pattern vocabulary

Supplementary material the main SKILL.md defers to: the full brief-signal to
dial-range inference table, the production-test AI-tell patterns that do not
already appear in SKILL.md's own rule sections, and the pattern-naming
vocabulary the agent should know. None of this overrides SKILL.md; it fills
in the detail SKILL.md keeps to a summary line for space.

## Dial inference table

Map the design read's own words to a starting range for each dial, then pick
the nearest value (or the closer preset in `presets/dials.json`). This is
guidance for a first read, not a hard lock; state the read, then adjust.

| Signal in the brief | Design Variance | Motion Intensity | Visual Density |
|---|---|---|---|
| minimalist / clean / calm / editorial / Linear-style | 5-6 | 3-4 | 2-3 |
| premium consumer / Apple-y / luxury / brand | 7-8 | 5-7 | 3-4 |
| playful / wild / Dribbble / Awwwards / experimental / agency | 9-10 | 8-10 | 3-4 |
| landing page / portfolio / marketing site (default, no other signal) | 7-9 | 6-8 | 3-5 |
| trust-first / public-sector / regulated / accessibility-critical | 3-4 | 2-3 | 4-5 |
| redesign, preserve | match existing | existing +1 | match existing |
| redesign, overhaul | existing +2 | existing +2 | match existing |

Cross-references throughout the design-recipe rules use these exact three
dial names (Design Variance, Motion Intensity, Visual Density); never invent
aliases like "layout variance" or "anim level."

## Dial technical reference (what each level actually looks like)

- **Design Variance 1-3 (predictable):** a symmetrical grid, equal padding,
  centered alignment throughout.
- **Design Variance 4-7 (offset):** deliberate overlaps, varied image aspect
  ratios sitting next to each other, a left-aligned header over
  center-aligned data.
- **Design Variance 8-10 (asymmetric):** masonry-style layouts, fractional
  grid columns (one wide, two narrow), large deliberate empty zones. At
  these levels, an asymmetric layout collapses to a strict single column
  below the mobile breakpoint; declare that collapse explicitly per section.
- **Motion Intensity 1-3 (static):** no automatic animation; `:hover` and
  `:active` states only.
- **Motion Intensity 4-7 (fluid):** short, eased transitions and staggered
  load-in delays, `transform`/`opacity` only.
- **Motion Intensity 8-10 (advanced choreography):** scroll-triggered
  reveals, parallax, and scroll-scrubbed motion via `author_animation`'s
  `scroll-scrub` trigger; never a hand-rolled `window.addEventListener`.
- **Visual Density 1-3 (art gallery):** generous section gaps, lots of
  whitespace.
- **Visual Density 4-7 (standard):** normal web-app section spacing.
- **Visual Density 8-10 (cockpit):** tight padding, no card boxes (hairline
  dividers instead), numeric data set in the mono font family.

## Extended AI-tell patterns (production-test tells)

These are additional to the bans already stated in SKILL.md's Hero, Layout,
and Copy sections (version labels in the hero, section-number eyebrows,
em-dash, filler verbs, fake stats, performative-craftsman labels,
locale/weather strips, pills on photos, decorative status dots, middle-dot
rationing, generic step labels). Treat all of these as hard bans unless the
brief explicitly asks for one.

- No `01 / 4`-style pagination captions on images or bento tiles; if the
  visitor can count the tiles, they do not need a counter.
- No mock-humble asides in body copy ("we respect the honest ones" style
  performative modesty).
- No micro-meta sentence sitting under an eyebrow explaining what the
  section is about; eyebrow, headline, and body is already enough.
- No photo-credit captions decorating a stock or generated image
  ("Frame XII, 35mm") unless a real photographer is being credited for a
  real photo with permission; otherwise skip the caption or use one
  functional line.
- No "Reservation 412 of 800"-style live-stock counters as decoration
  unless the brief is a real limited-run waitlist with real data.
- No decoration text strip at the hero's bottom ("BRAND. MOTION. SPATIAL.")
  unless it carries real, navigable links or real status information.
- No floating top-right sub-paragraph beside a giant left-aligned section
  headline; put the sub-text directly under the headline, or build a clean
  two-column header, never a small corner floater.
- No `border-top` plus `border-bottom` on every row of a long list or spec
  table; pick one edge and use it sparingly, or move to the grouped-chunk /
  card-per-spec layouts SKILL.md's Layout rules already call for.
- No scoring or progress bar with a filled background track as a comparison
  visual on a marketing page; prefer a number plus a small icon, or a thin
  bar with no background track.
- No vertically rotated text ("INDEX OF WORK, 2018-2026" rotated 90
  degrees) unless the brief is explicitly agency/Awwwards/experimental and
  it serves a real compositional purpose.
- No crosshair or hairline grid lines added purely to make the page "feel
  designed"; use dividers only when they organize real content.
- No `<br>`-broken, italicized headline split as a default "design move"
  ("for thirty<br>*years.*"); headlines read naturally first, get clever
  only when the brief demands it.
- Mathematically inconsistent padding and margins (floating elements with
  awkward, non-systemic gaps) are as much a tell as an over-designed page;
  keep the spacing scale consistent.

## Pattern vocabulary (naming reference, not an implementation library)

Names the agent should know to communicate about a composition and to reach
for deliberately when the design read calls for them. This is naming only;
build each one with the mechanisms in **flowmo-motion-design** and
**flowmo-interactive-design** (`author_animation` triggers, `list_interactives`
/ `insert_interactive` / `create_interactive_element`), and reach for
**flowmo-wow-catalog**'s Tier-1 catalog when the pattern is meant to be the
page's signature moment rather than incidental craft.

**Hero paradigms:** asymmetric split hero (text one side, asset the other),
editorial manifesto hero (large type, no asset, almost a poster),
video/media mask hero (type cut out as a mask over video), kinetic-type
hero (animated typography as the primary visual), curtain-reveal hero (hero
parts on scroll like a curtain), scroll-pinned hero (hero stays pinned while
content scrolls behind it).

**Layout and grids:** bento grid (asymmetric tile grouping), masonry layout
(staggered grid, no fixed row height), split-screen scroll (two halves
sliding in opposite directions), sticky-stack sections (sections that pin
and stack on scroll).

**Cards and containers:** parallax tilt card (3D tilt tracking the cursor),
spotlight border card (border illuminates under the cursor), glassmorphism
panel (frosted glass with inner refraction), holographic foil card
(iridescent shift on hover).

**Scroll animations:** sticky scroll stack, horizontal scroll hijack
(vertical scroll drives a horizontal pan), zoom parallax (a central
background image zooms on scroll), scroll progress path (a line draws along
scroll position).

**Typography and text:** kinetic marquee (endless text band, reverses on
scroll), text mask reveal (massive type as a window onto video), text
scramble effect (matrix-style decode on load/hover), circular text path.

**Micro-interactions:** directional hover-aware button (fill enters from
the cursor's exact side), ripple click effect, animated SVG line drawing,
mesh-gradient background (organic blob gradients), lens-blur depth
(background blurred to focus the foreground).
