# Downstream asset kit and the personalization ladder

Part of the flowmo-reference-boards skill package - see the package's SKILL.md
for routing. Once boards are locked, they art-direct a coherent generated
asset kit for the build - not just a hero image. This reference lists what
that kit typically contains and how far to personalize it.

## The asset kit (palette-locked to the boards)

Generate these with f0's own tools - `generate_image` for stills,
`generate_video` for motion, `remove_image_background` for cutouts/icons -
never an external model. Every prompt should carry the locked palette (name
the concrete hues/mood words from the chosen `theme_paradigm` pick) and "no
text, no logos, no watermark" (type is set in real HTML, not baked into the
image).

**The user's own assets always win.** Anything the user already provides -
logo, product photos, team photos, an existing icon set - is used as-is.
Generation fills gaps only; never regenerate a replacement for something they
gave you.

- **Hero visual** - the centerpiece asset for the hero section. Generate 2
  candidates and pick the strongest rather than taking the first result.
  Consider an interaction pair too: a dark/desaturated grade plus a
  lit/color grade of the SAME composition for reveal effects - generate the
  base, then a re-grade with `generate_image` in edit mode using the base as
  reference so the two stay aligned.
- **Section plates** - 2-3 background textures or atmospheric plates matching
  each board's `background_character` pick, so sections aren't flat CSS
  fills where the board showed texture.
- **Content imagery** - portraits, product shots, or illustrative imagery the
  sections actually need, style-matched to the boards. A fictional
  product/project UI shown on a board should be generated as an image, not
  hand-built as fake div-chrome.
- **Custom icon set** - do not default to an icon font when the board implies
  a bespoke one. Generate the icons as ONE consistent set: a single image
  containing a grid of 6-12 glyphs in the brand's stroke style and palette
  (e.g. "icon set, consistent 2px-stroke line glyphs, [motifs], flat on solid
  background, no text"), sized to f0's `--size-icon-*` scale (16/24/32px via
  the `ds-icon`/`ds-icon-small`/`ds-icon-medium`/`ds-icon-large` classes -
  see **flowmo-frontend-design**) rather than an arbitrary grid, then run
  `remove_image_background` on the sheet slices or individual cutouts so
  icons composite cleanly over page backgrounds. `lucide-react` (f0's bundled
  icon library) remains the right fallback for dense functional UI (form
  chrome, 20+ small utility glyphs) where a bespoke set isn't worth the cost.
- **Logo or monogram** - use `generate_logo` (its own iterative
  generate/evaluate/refine pipeline, background removal, and optional SVG
  vectorization) only when the user has no logo of their own; otherwise use
  theirs everywhere and skip this. If a brand logo is already in context,
  reuse its URL rather than regenerating.
- **OG image** - a real 1200x630 social card composed in the brand language
  (generate it wide and on-brand, not a crop of the hero), wired into the
  page head. A multi-page build gets a distinct OG per major route (same
  template, swapped subject/title).
- **Head kit** - the full favicon/meta set, derived from the user's own logo
  when provided, from the generated monogram only as the fallback, worked
  from a high-res source (>=512px, downscale - never upscale a small
  render):
  - `favicon.ico` (32px) + `favicon.svg` if the mark vectorizes cleanly,
    else `favicon-32.png` / `favicon-16.png`.
  - `apple-touch-icon.png` (180px, opaque background, comfortable padding).
  - `icon-192.png` / `icon-512.png` plus a maskable 512 variant (mark kept
    within the 80% safe zone), referenced from a minimal `site.webmanifest`
    (name, colors, icons).
  - `<meta name="theme-color">` set to the brand ground (light + dark values
    when the page has both).
  - The full social meta block: `og:title` / `og:description` / `og:image` /
    `og:url` / `og:type`, plus `twitter:card=summary_large_image`, with
    absolute image URLs.
  - Sanity-check the favicon at 16px: if the mark turns to noise, use a
    simplified glyph (initial letter on the brand ground) for the small
    sizes rather than shrinking the full logo.
- **Hero motion, when a hero needs to move.** A scroll-scrubbed hero (the
  default cinematic treatment - the user's scroll plays the film) is its own
  contract; hand off to **flowmo-scroll-scrub** once the boards have locked
  the visual direction it needs to match. A muted, autoplay ambient loop with
  a poster (`generate_video`) remains a lighter fallback only when the
  composition genuinely can't carry a scrub, or a mid-page band wants motion
  without becoming the scroll-driven hero.

## Optional ladder items (pick by fit, not by count)

Reach for these only where the board/brief has a genuine slot for them - a
few executed coherently beat many scattered ones:

- **Brand identity kit** - logo + wordmark + monogram as a consistent family,
  not three unrelated marks: generate the primary mark with `generate_logo`,
  then derive the others via `generate_image` edit mode with the primary as
  reference. Include favicon renders and ink/inverse variants for dark and
  light grounds.
- **Animated logo sting** - a short image-to-video (`generate_video`) of the
  mark assembling or a light sweep, for a nav-load flourish or footer
  sign-off (or a static frame under reduced motion).
- **Seamless brand pattern/texture** - a tileable motif in the locked palette
  for section dividers or card backs. Prompt "seamless repeating pattern" and
  check the tile edge.
- **Spot illustration set** - 3-6 scene illustrations in ONE named style
  (same line weight, same palette, same perspective logic) for feature or
  process sections, generated as a batch with the style spelled identically
  in every prompt.
- **State artwork** - dedicated art for 404/empty/success/loading states
  instead of reusing generic placeholder text.
- **People imagery** - founder/team portraits or testimonial faces, generated
  or re-graded consistently with the rest of the kit; never watermarked stock.
- **Product universe** - multiple angles or lifestyle context shots of one
  approved product image, generated so every view reads as the same product.
- **Restyled user photos** - if the user's real photos don't match the locked
  direction, offer a re-grade (`generate_image` in edit mode, boards as the
  grade reference) rather than discarding their real assets.
- **Diagrams as images** - process/architecture explainer panels composed as
  art-directed images in the brand language, not box-and-arrow divs.
- **Micro-animation sequences** - short generated clips turned into frame
  sequences for hover/scroll micro-moments on a signature component - the
  same image-sequence-scrub mechanism as a scroll-scrubbed hero
  (**flowmo-scroll-scrub**), just smaller and local to one component.

## Generation hygiene

- **Coherence check - one batched look, maximum.** When the kit lands, view
  the assets together in one pass, not one look per asset and not
  re-inspecting something already viewed. Any piece whose grade/palette
  fights the boards gets regenerated with the hexes named harder - a
  mixed-grade kit reads cheaper than no extra assets at all.
- **Multi-image results can be grid sheets.** A batch/count request may come
  back as one combined sheet (e.g. four images as a single 2x2 grid) instead
  of four standalone files. Check what actually came back before wiring
  slots; a grid can be sliced like the icon sheet, but don't assume N
  requests produced N files.
- **On repeated failure, change approach, not just retry.** If a generation
  fails twice, change model/tool or restructure the prompt - never silently
  fall back to a stock photo or a flat CSS placeholder. A known false-positive
  failure mode: an innocuous product prompt gets flagged for mood/atmosphere
  words ("seamless loop feel", "ambient", "intimate") - fix it by removing
  those words and re-describing the shot as a plain product film/photo.
- **Monochrome direction:** force grayscale explicitly in the prompt, not
  just as an assumed default.
- **People imagery:** locale-appropriate, believable, never watermarked
  stock faces - testimonial faces are generated, not sourced.

## The personalization ladder

How far to tailor an asset kit to one specific brief versus keep it generic
and reusable:

- A board and its resulting asset kit are always ANCHORED to one specific
  brief's locked picks (theme, narrative spine, palette) - they are never
  meant to be a generic template reused unmodified across unrelated briefs.
- Within that anchor, scale effort by what the brief actually has a slot for.
  A thin brief (small site, tight timeline) stops at the always-on kit above.
  A brief that names a real brand identity, has multiple pages, or explicitly
  asks for a distinctive/premium feel earns ladder items - start with
  whichever ladder items compound the "this was made for this brand"
  effect (a real icon set, a matched hero+OG pair) before reaching for
  novelty items (an animated sting, a brand pattern) that cost more to
  generate than they add.
- Never let personalization effort substitute for locking the combinatorial
  picks first (see [board-prompting.md](board-prompting.md)) - a large asset
  kit generated against a weak or inconsistent board combination still reads
  generic, just with more images.
