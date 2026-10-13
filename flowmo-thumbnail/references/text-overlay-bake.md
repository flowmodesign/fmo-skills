# Headline text: the overlay stack and the baked-text fallback

How to put a MrBeast-style headline on the thumbnail in flowmo (f0). The
source recipe (Higgsfield) rendered this in two separate layers - a live
HTML/CSS preview in a browser, then a second pass that re-rendered the same
look to flat pixels on an HTML canvas, because its deliverable was always a
static PNG. f0 has no canvas-bake tool and does not need one: on a page/`ad`
surface the document IS live HTML/CSS, so writing the CSS rule with
`set_stylesheet` already produces the final rendered result - there is no
separate bake pass. On a `media` page there is no document to write CSS
onto at all (see `renditions/designer-media.md`), so the text goes into the
generation prompt's TEXT block instead (SKILL.md's 11-block contract, block
3) and the image model bakes it into the pixels directly - also with no
canvas step. Both paths are covered below.

This is the implementation of the five overlay styles named in SKILL.md's
Text overlay section. The live overlay (`set_stylesheet`, on a page/`ad`
surface) is the DEFAULT delivery for headline text; baking text into the
`generate_image_asset` call is the fallback, on an explicit ask or when the
surface has no document (media page).

## What makes text "MrBeast-y"

Not one trick but a stack of six - remove any one and it falls apart.

| Trait | Value | Why |
|---|---|---|
| Font | **Anton** (or Anton SC), one weight, reads `900`-heavy | fat condensed grotesk - the signature |
| Case | **ALL CAPS** | maximum density and aggression |
| Stroke | manual, **thick** (8-14% of cap size), drawn UNDER the fill | separates letters from any background |
| Shadow | hard, dark, offset down, blur shifted | "sticker" depth |
| Color | white / yellow to orange to red gradient / acid lime `#D4FF3F` | punchy contrast, reads in the feed |
| Tracking | tight (`-0.01...-0.02em`), line-height `0.9` | letters lock together like a logo |

Placement rules:
- **2-4 words max.** A headline, not a sentence.
- **Not on the face.** Text in a free quarter (bottom / corner / side).
- **Large.** Cap height 12-18% of frame height. When in doubt, bigger.
- **Margins:** keep text within the frame with comfortable padding, off the extreme edges.

## The live overlay - one step, not two

Feed the picked preset's CSS from [presets/overlay-presets.json](presets/overlay-presets.json)
straight to `set_stylesheet` in `patch` mode, targeting the shared
`.thumb-headline` class - never inline per-element styles, so every headline
in the project stays on one edit point:

```text
set_stylesheet({
  css: ".thumb-headline { font-family: 'Anton', sans-serif; font-weight: 900;
    text-transform: uppercase; letter-spacing: -0.01em; line-height: 0.9;
    color: #ffffff; -webkit-text-stroke: 0.11em #000000;
    paint-order: stroke fill;
    text-shadow: 0 8px 0 rgba(0,0,0,0.35), 0 14px 24px rgba(0,0,0,0.55); }",
  mode: "patch"
})
```

> `paint-order: stroke fill` is critical. Without it the stroke paints ON TOP
> and "eats" half the letter - the #1 bug in home-made versions of this
> style.

Because the stroke, shadow and cap-height traits are sized in `em` /
percent-of-frame-height rather than fixed pixels, the same rule already
renders correctly at any frame size - there is no separate 4K/retina export
pass to run, unlike a canvas bake that has to be re-computed off the image's
native pixel dimensions.

## 5 proven presets (swap the `.thumb-headline` block)

Read the exact CSS for each from
[presets/overlay-presets.json](presets/overlay-presets.json) - Beast (white +
thick black stroke, the default), Fire (yellow to orange to red gradient),
Neon Lime (acid lime + glow), Clean Glass (Inter 800 on a frosted pill, no
stroke), and Marker (black Anton on lime line-boxes). Each preset item
carries its own `css` field ready to pass to `set_stylesheet` and a
`placement` field with where it reads best.

## Baked-text fallback (media page, or explicit request)

`remove_image_background` is available first when a preset needs the
subject isolated from its background before the text reads clearly against
it. Then write the headline directly into the main-render prompt's Text
block (SKILL.md block 3):

```text
TEXT: bold thumbnail headline text baked into the image, reading exactly
"<TEXT>" - massive, ultra-legible sans-serif with a clean outline/glow
treatment, placed where it never covers the subject's face. No other text,
no watermark.
```

Name the chosen font family and its traits (case, stroke, shadow, color,
tracking) from the tables above directly in that prompt line when a specific
preset or font-menu choice was picked, since there is no separate rasterizer
to apply the CSS afterward - the image model has to render the look itself
in one pass through `generate_image_asset`.

## Font menu (Anton is the default - these are the overrides)

If the user asks for a different font, pick from this menu. Named font -> use
it; "something else / not Anton" -> pick the closest fit below and say which
was chosen.

**A - Top 3 (punchy display, the Anton alternates)**

| Font | Weight | Vibe / use |
|---|---|---|
| Bebas Neue | 400 (reads bold) | tall narrow ALL-CAPS - the #1 Anton alternative, maximum cap height |
| Oswald | 600-700 | condensed grotesk, a touch softer than Anton |
| Archivo Black | 400 (ultra-bold) | blocky, wide, very loud headline |

**B - 5 bold workhorses**

| Font | Weight | Vibe / use |
|---|---|---|
| Montserrat | 900 (Black) | clean geometric sans, modern headline |
| Poppins | 800 (ExtraBold) | rounded geometric, friendly |
| Roboto Condensed | 700 (Bold) | neutral condensed workhorse |
| Inter | 800 | modern UI sans (same face as the Clean Glass preset) |
| Barlow Condensed | 800 (ExtraBold) | condensed, energetic |

**C - 5 aesthetic (soft-elegant)**

| Font | Weight | Vibe / use |
|---|---|---|
| Playfair Display | 700-900 | elegant high-contrast serif - classic "aesthetic" title |
| Cormorant Garamond | 600-700 | delicate refined serif, editorial feel |
| DM Serif Display | 400 | high-end display serif |
| Fraunces | 600-900 | soft "old-style" serif, trendy |
| Sacramento | 400 (script) | handwritten script - ACCENT / secondary line only, never the hero word (a script fails the ~120px legibility test as the main headline) |

**How to swap (keep everything else):**
- Live overlay: change `.thumb-headline { font-family: '<Family>', sans-serif; font-weight: <w>; }` in the `set_stylesheet` call.
- Baked text: name `<Family>` and its weight directly in the TEXT prompt block instead of leaving it default Anton.
- Stroke / shadow / `paint-order` / tracking stay as in the presets - only the family (and weight) change.

**Stroke caveat by font class:** heavy condensed faces (Anton, Bebas Neue,
Oswald, Archivo Black) take the full 8-14% stroke. The delicate serifs and
the script (Playfair, Cormorant, DM Serif, Fraunces, Sacramento) CLOG with a
thick stroke - drop it to 3-6% (or none) and lean on a soft drop-shadow for
separation instead. Sacramento (and any script) is an accent line, not the
punch word.

## Quick check before shipping the overlay or the baked text

- [ ] Font **Anton** (or the chosen menu font), ALL CAPS, 2-4 words.
- [ ] Stroke manual and **thick**, drawn under the fill (`paint-order: stroke fill` on the live overlay; named explicitly in the baked-text prompt).
- [ ] Text does **not** cover the face; sits in a free quarter.
- [ ] Text within the frame, off the extreme edges (comfortable padding).
- [ ] One punchy color: white / fire gradient / lime - one per headline.
- [ ] Live overlay written through `set_stylesheet` against `.thumb-headline`, never inline per-element styles.
