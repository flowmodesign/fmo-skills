---
name: flowmo-product-photoshoot
version: 1
family: image
description: |
  Generate brand-quality product images and marketplace listing assets in
  flowmo (f0): 10 photoshoot modes picked by intent with short labeled-option
  interviews, plus the 13-asset marketplace listing taxonomy (main image,
  secondary images, A+ content modules) as one ordered bundle. Use when:
  "product photo", "studio shot", "lifestyle image", "Pinterest pin",
  "hero/banner", "carousel", "ad creative", "Meta ads", "virtual try-on",
  "model wearing", "person holding product", "levitating/floating/splash
  product", "restyle", "marketplace listing images", "A+ content", or
  "product infographic". NOT for text-to-image with no product or brand
  context (use flowmo-thumbnail or a general image build), YouTube/Shorts
  thumbnails or video covers (use flowmo-thumbnail), or branded avatar video
  (use flowmo-video-prompt-craft).
surfaces: [designer, flowgen-image-node, mcp]
kinds: [ad, media]
tools: [designer:generate_image_asset, designer:edit_image_asset, designer:remove_image_background]
default_on: [designer:media]
presets: presets/modes.json
chain_with: [flowmo-thumbnail, flowmo-brand-lock]
derived_from: https://github.com/higgsfield-ai/skills
renditions:
  designer-media: [designer:media]
---

# flowmo product photoshoot

You author the literal prompt text yourself and pass it to
`generate_image_asset` - there is no backend prompt enhancer here, unlike
the Higgsfield source this skill is derived from (its CLI called a backend
prompt enhancer that held the mode-specific photography vocabulary; f0 has
no such backend, so every `prompt_skeleton` below is a flowmo addition,
written to fill that gap, not part of the source). Pick a mode, run its
interview tree, fill the mode's `prompt_skeleton` from
[presets/modes.json](presets/modes.json), generate, and use
`edit_image_asset` only for a small scoped correction on an already-approved
result. `remove_image_background` is available whenever a mode needs the
product isolated (for example before compositing a marketplace main image
onto pure white).

## The 10 photoshoot modes

| Mode | Pick it when the user wants |
|---|---|
| `product_shot` | Product on a neutral / studio / catalog background |
| `lifestyle_scene` | Product in a real-world environment, hands, action, atmosphere |
| `closeup_product_with_person` | Tight crop with hands / partial face - beauty application, holding, demonstrating |
| `moodboard_pin` | Vertical 2:3 Pinterest-native aesthetic, moodboard feel |
| `hero_banner` | Wide-format website / email / campaign header |
| `social_carousel` | 3-10 connected slides for IG / LinkedIn / Facebook |
| `ad_creative_pack` | A coordinated pack of static ad variants for Meta / TikTok / Pinterest / Google Ads |
| `virtual_model_tryout` | Product worn or used by an AI-rendered model |
| `conceptual_product` | Surreal / CGI-style / levitating / splash / sculptural product |
| `restyle` | Transform an existing image's aesthetic, mood, or seasonal context |

## Mode selection and tie-breakers

Pick by intent, not by surface keyword. When two modes could both plausibly
fit, prefer the more specific one:

- product + neutral/clean/white/studio/catalog/Shopify -> `product_shot`.
- product + scene/in use/kitchen/outdoor/cafe/gym -> `lifestyle_scene`.
- hands holding / face with product / beauty application / demonstrating ->
  `closeup_product_with_person`.
- Pinterest, pin, vertical pin -> `moodboard_pin`.
- hero, banner, website header, landing page, email header, wide format ->
  `hero_banner`.
- carousel, slide post, multi-slide, swipeable -> `social_carousel`.
- ads, ad pack, paid social, Meta/TikTok/Pinterest ads -> `ad_creative_pack`.
- model wearing, virtual try-on, on body, fashion shoot, lookbook ->
  `virtual_model_tryout`.
- levitating, floating, splash, frozen motion, surreal, CGI, sculptural ->
  `conceptual_product`.
- modify an EXISTING image's aesthetic, mood, or season without changing the
  subject -> `restyle`.

Named tie-breakers: "Pinterest pin of my product on a kitchen counter" ->
`moodboard_pin` (Pinterest is the platform). "Hero banner showing my product
in use" -> `hero_banner` (banner format wins). "Carousel of my product in
different scenes" -> `social_carousel` (multi-slide wins). "Closeup of
person applying my serum" -> `closeup_product_with_person` (specific genre
wins).

## The 6 interview trees

Ask at most 4 labeled-option questions before generating - never open free
text for a question that can be a short list. Skip any question whose
answer is already obvious from context (an uploaded image, a prior turn, a
brand memory the project already carries).

**Type A - uploaded a product photo, "make me images / photoshoots":**
1. How many? `[1 / 3 / 5]`
2. What style/mood? `[Clean studio / Lifestyle / Conceptual / With a model / Other]`
3. Where will you use them? `[Shopify / Instagram / Pinterest / Paid ads / Website hero]`
4. Brand colors to match? (skip if already obvious)

**Type B - uploaded a product photo, named a use case** (for example "make
ads for my product", "make a Pinterest pin", "make a hero banner" - the mode
is already obvious, so ask only the gaps):
1. How many? (only if the mode produces multiple outputs)
2. What is the offer / mood / hook?
3. Anything in particular to emphasize?

**Type C - text only, no product photo:**
1. Can you upload a product photo? (preferred - much higher fidelity than a
   description)
2. If not: describe the product - category, packaging, color, distinctive
   features.
3. What style? (same options as Type A)
4. Where will you use it?

**Type D - uploaded an existing image, "redo / change vibe / different
version"** (routes to `restyle`):
1. What aesthetic? `[Clean girl / Cottagecore / Quiet luxury / Dark academia / Y2K / Other]`
2. Seasonal context? `[Christmas / Valentine's / Halloween / Black Friday / None]`
3. What to preserve, what to change? (only if ambiguous)

**Type E - model wearing a product** (fashion, accessories; routes to
`virtual_model_tryout`):
1. Model archetype? (suggest 2-3 based on the brand's audience)
2. Environment? `[Studio clean / Outdoor natural / Street style / Editorial / Home cozy]`
3. Framing? `[Full body / Three-quarter / Waist up / Closeup on product area]`

**Type F - vague request, unclear subject** (for example "make me something
cool for my brand"):
1. What product or topic?
2. Goal? `[Sell on a marketplace / Build awareness / Run paid ads / Update website]`
3. Upload a reference image?

After answers, route back into the matching Type A-E flow.

## Multi-variant rule

Generate one `generate_image_asset` call per distinct concept, angle, or
scene - never ask one call to silently produce several unrelated looks.
Offer more than one variant when the interview answers leave a real open
choice (mood, angle, palette); vary preset, lighting, angle, or palette
across the calls so the set reads as distinct options, not paraphrased
copies of one image. For `social_carousel` and `ad_creative_pack`, lock the
visual system (lighting, palette, background treatment) across every call in
the set before varying the scene per slide/variant - see the `n`/`total`
slots in their `prompt_skeleton`.

## Aspect-ratio defaults

Each mode and each marketplace asset carries a `default_aspect` in
[presets/modes.json](presets/modes.json), drawn from this allowed set: 1:1,
4:5, 5:4, 3:4, 4:3, 2:3, 3:2, 9:16, 16:9. Use the default unless the user
explicitly asks for a different ratio; `restyle` has no fixed default and
instead preserves the source image's own ratio. These per-mode defaults are
proposed here (f0 has no server-side default-picker to defer to) - treat
them as a sensible starting point, not a hard rule, and confirm with the
user when a placement's real requirement is unclear.

## Marketplace listing taxonomy (13 assets)

A second, related surface: full marketplace listing sets. Each asset below
is one image; a listing ships them together as one ordered bundle.

| Asset id | What it is |
|---|---|
| `main_image` | The primary compliant listing thumbnail - product only, clean background |
| `infographic` | Secondary image explaining key specs/benefits at a glance |
| `multi_angle` | The product from a second meaningful angle |
| `detail_shot` | Tight closeup proving a material, texture, or feature |
| `lifestyle` | The product in context so the buyer can picture using it |
| `whats_in_box` | Flat-lay of every included item |
| `aplus_hero_banner` | Wide opening module of the A+ content stack |
| `aplus_pain_points` | Module naming the problem the product solves |
| `aplus_features` | Module calling out 2-4 key features |
| `aplus_ingredients` | Module showcasing formula, materials, or components |
| `aplus_efficacy` | Module showing a truthful result/proof point |
| `aplus_how_to_use` | Module walking through application/usage steps |
| `aplus_endorsement` | Module carrying a review quote or trust signal |

### Bundle scopes

- `main` - `main_image` only.
- `product-images` - `main_image` plus the 5 secondary assets (`infographic`,
  `multi_angle`, `detail_shot`, `lifestyle`, `whats_in_box`).
- `aplus` - `main_image` plus the 7 `aplus_*` modules.
- `full-set` - all 13 assets: `main_image`, the 5 secondary assets, and the 7
  `aplus_*` modules, in that order.

Each marketplace item in [presets/modes.json](presets/modes.json) lists its
own `bundle_scopes`; generate the full bundle for the scope the user asked
for, one `generate_image_asset` call per asset, reusing the same product
reference image(s) across every call in the bundle so the set reads as one
coherent listing.

## Delivering results

Print a short bulleted list of the resulting image references with a label
per item (mode name or asset id). No internal prompt text, no retry
mechanics, unless the user asks. If a generation failed, mention it briefly
with the failure status rather than silently omitting it.

## What this skill does not do

- Does not auto-pick a different image-gen model for a photoshoot job -
  always `generate_image_asset` / `edit_image_asset` on this project's
  configured image model, never a video or avatar generator.
- Does not replace `flowmo-video-prompt-craft` for branded avatar video.
- Does not replace a general image build for raw text-to-image with no
  product or brand context.

## Common mistakes to avoid

- Asking more than 4 interview questions in one message, or leaving a
  question open-ended when it could be labeled options.
- Picking the wrong mode by surface keyword instead of intent (see the
  tie-breakers above).
- Writing one `generate_image_asset` prompt that tries to cover an entire
  multi-slide carousel or multi-asset bundle at once - one call per
  slide/asset, with the visual system locked across them.
- Reaching for a fresh `generate_image_asset` regeneration when the user
  asked for a small, scoped correction - use `edit_image_asset` on the
  approved asset instead.
- Pasting the assembled prompt text back to the user - they want the image
  references, not the prompt.
- Using a mode or marketplace asset id that is not in the tables above.
