---
name: flowmo-thumbnail
version: 1
family: image
description: |
  Create high-click-through YouTube/Shorts thumbnails and vertical video
  covers in flowmo (f0): a truthful information-gap concept picked from 16
  proven frameworks, up to three identities locked across generations, an
  optional 3D logo render, and a headline text either as a live CSS overlay
  stack or baked into the image. Use when: "make a YouTube thumbnail",
  "thumbnail for this video", "MrBeast-style cover", "Shorts cover", or
  "Instagram video cover". NOT for producing the underlying video itself (use
  flowmo-video-prompt-craft), for generic brand or catalog product photography
  with no video-cover context (use flowmo-product-photoshoot), or for
  marketplace listing cards (use flowmo-product-photoshoot's marketplace
  section).
surfaces: [designer, flowgen-image-node, assistant-video, mcp]
kinds: [ad, media]
triggers:
  - youtube thumbnail
  - shorts cover
  - thumbnail for this video
  - mrbeast style cover
  - video cover
tools: [designer:generate_image_asset, assistant-video:generate_image, designer:edit_image_asset, assistant-video:edit_image, designer:remove_image_background, assistant-video:remove_image_background]
default_on: [designer:media]
presets: [presets/frameworks.json, presets/overlay-presets.json]
chain_with: [flowmo-brand-lock, flowmo-product-photoshoot]
derived_from: https://github.com/higgsfield-ai/skills
renditions:
  designer-media: [designer:media]
---

# flowmo thumbnail

You author the literal prompt text yourself and pass it to
`generate_image_asset` - there is no backend prompt enhancer here. Build the
prompt from the 11-block contract below, generate, run the post-render gate,
then use `edit_image_asset` only for the narrowly scoped surgical tweaks it
is meant for.

## Intake gates

Collect only what is not already answered:

- The video's topic/title and the truthful promise the thumbnail may imply.
- Exact scene requirements, if any.
- Who appears: 0-3 people. If a concept needs a person and no face reference
  was provided, ask whether to use the user, another provided person, or a
  generic character - never choose silently.
- An optional style-reference thumbnail: read it for energy, framing, split
  layout, palette, and emotion only. Never pass it as one of the generation
  inputs and never copy its exact composition.
- An optional logo, and whether it stays flat or becomes a 3D object (see
  below).
- An optional headline, 2-4 words. Default delivery is a clean image with no
  text; use the live overlay stack when the user asks for an overlay, and
  bake text into the generation only when explicitly requested.
- Ratio: 16:9 for YouTube by default, 9:16 for Shorts, 4:5 for Instagram.
  Pass it as the aspect ratio input on `generate_image_asset`.
- One final concept or a small variant set (about four) when alternatives
  would materially help. Hard cap: 16 total generations.

If the user asks for emotion variants without naming them, use this ladder:
shock, hype, rage, awe, laugh, fear, smug, charisma, confusion,
determination, disgust.

## Concept gate

Read [presets/frameworks.json](presets/frameworks.json) - 16 concept
frameworks with a `when` (pick condition), `composition` (the shot/layout),
and a shared `truth_rule`. See
[references/thumbnail-frameworks.md](references/thumbnail-frameworks.md)
for the same 16 frameworks as the source's own table plus the underlying
10-rules cheat-sheet. Brainstorm at least five truthful concepts across
multiple frameworks before picking one, and select the strongest information
gap with one focal subject and minimal clutter. A concept often combines two
frameworks (for example Posed Portrait + Map/Aerial) when it deepens the gap
without adding clutter - combine only when the result still reads in under
one second at roughly 120px wide.

When a reference thumbnail exists, extract its brief, subject pose/action,
elements, location, composition, background, whether it is split, person
count, and emotion before prompting. The reference supplies art direction,
never a specific identity; the user's own instructions override it field by
field.

## Reference manifest line

When two or more reference images are attached to one `generate_image_asset`
call, open the prompt with a manifest naming each one in order, for example:

```text
IMAGE REFERENCES: image 1 = CHARACTER 1 face reference; image 2 = brand logo.
```

Attach face references first in character order, then the logo.

## The 11-block prompt contract

Assemble every main-render prompt in this order. Five blocks are called out
below because they carry the most weight; port and write out all 11 for
every prompt.

1. **Frame (aspect/composition):** `Bold, punchy YouTube-thumbnail
   composite - poster-grade, photoreal and high-impact, NOT a muted
   cinematic movie still, <ratio>, single unified frame - no split-screen, no
   diagonal divide, everything blends smoothly and organically across the
   same continuous shot.` For `9:16`, add `faces in the upper two-thirds`. A
   requested graphical/diagram concept replaces the photoreal language with a
   clean diagram brief (see the `graphical-representation` framework).
2. **Scene brief:** depict the user's exact content, nothing invented.
3. **Text (default/baked):** default is `No text, no readable UI labels, no
   watermark.` For an explicit baked headline: `TEXT: bold thumbnail headline
   text baked into the image, reading exactly "<TEXT>" - massive,
   ultra-legible sans-serif with a clean outline/glow treatment, placed where
   it never covers the subject's face. No other text, no watermark.`
4. **Subjects (40-60% of frame):** large, foreground-dominant, chest-up or
   medium-close, filling about 40-60% of the frame. End with `All faces
   crisply sharp as the anchors of the shot.`
5. **Key elements:** only the signature props/effects that explain the
   information gap - nothing decorative that adds clutter.
6. **Logo:** preserve exact shapes, colors, proportions, and letterforms;
   keep it away from faces.
7. **Location:** place, time, weather, and atmosphere when relevant.
8. **Composition:** one power-third hero, clear scale hierarchy, depth, and
   strong subject/background separation.
9. **Background:** vivid high-contrast color field or environment, soft
   vignette and edge falloff; do not divide it unless a split layout was
   explicitly requested.
10. **Lighting on people:** `signature YouTube thumbnail lighting rig -
    strong key light sculpting the face, soft dreamy fill lifting shadows,
    and defined back light plus hair light tracing a clean bright rim around
    hair, shoulders and silhouette.` Only the rim may carry a colored accent.
11. **Grade:** vivid, bright, glossy, poster-punchy, deep blacks, crisp
    highlights, rich saturated colors, cohesive as one image. Restrain it
    only for an explicit calm/premium/muted brief.

## Identity lock

For each photo-referenced person, add this block to the prompt, filling in
the expression from the emotion ladder or the user's brief:

```text
CHARACTER N: the person from attached face reference #K - IDENTITY LOCK:
reproduce this exact person with a photographic identity match - same bone
structure, eye shape, nose, lips, jawline, skin tone, hairline and hair
texture. Do not beautify, average, or restyle the face. Expression: <emotion
phrase>.
```

## Split rule

Use a left/right or foreground/background split only when the user asks for
`split`, `before/after`, `versus`, `side by side`, or the analyzed reference
is itself split. A topical phrase such as "X vs Y" does not by itself
require a split. When a split applies, replace the Frame block with a clear
halves/panels contract and keep labels out unless short, truthful baked text
was explicitly requested.

## Optional 3D logo

When the logo should render as a dimensional object in-scene, generate it as
its own asset first, then attach the result as a reference on every
thumbnail call in the same set:

```text
Transform the attached 2D logo into a premium 3D logo render: extrude the
exact logo shapes into glossy dimensional volumes; preserve every letterform,
proportion and brand color; soft studio reflections, subtle bevels, crisp
edges, clean dark neutral background, soft contact shadow, centered,
generous margins, no extra text, no watermark.
```

Generate this at a square aspect ratio through `generate_image_asset` with
the flat logo as the reference image, then reuse the resulting asset as a
reference image on the main thumbnail prompt(s).

## Post-render gate

Inspect every result before presenting it:

- Referenced identities visibly match their reference.
- No stray text or watermark exists unless baked text was ordered.
- Explicit baked text matches character-for-character.
- The face/emotion and hero element stay readable at about 120px wide.
- The concept truthfully matches the video promise.

On a hard failure, retry the same prompt at most twice through
`generate_image_asset`. Present every passing variant and let the user pick
before making any optional tweak.

## Surgical tweaks - edit_image_asset, not a regeneration

A picked thumbnail's small fix is an `edit_image_asset` call against that
exact asset, never a fresh `generate_image_asset` call - a full regeneration
risks drifting identity, pose, and composition the user already approved.

Allowed tweak scopes: expression only, background replacement only,
background recolor only, or rim-light recolor only. State in the edit prompt
that every other pixel-level property (identity, face structure, hair, pose,
body, clothing, logo, lighting rig, composition) stays exactly unchanged.
Never silently regenerate the full composition for a request scoped to one
of these.

## Text overlay

Keep the generated image text-free by default. When a headline overlay is
requested, use `set_stylesheet` to write one of the five presets in
[presets/overlay-presets.json](presets/overlay-presets.json) against a
shared headline class (for example `.thumb-headline`) - never as per-element
inline styles. Every preset is built from the same six-trait stack (font,
case, stroke, shadow, color, tracking); the JSON file documents each trait
and carries the exact CSS for Beast (the default, white-on-black-stroke
stack), Fire, Neon Lime, Clean Glass, and Marker, plus a shared placement
rule: 2-4 words, never over the face, cap height 12-18% of frame height,
comfortable padding off the extreme edges. `remove_image_background` is
available when a preset needs the subject isolated from its background
before layering the overlay. See
[references/text-overlay-bake.md](references/text-overlay-bake.md) for the
full six-trait breakdown, the five presets' exact CSS, the font-menu
overrides, and the baked-text fallback for a media page or an explicit
bake request.

## Delivery

Present passing variants with short semantic labels such as "shock /
close-up" or "product / size contrast". State the selected ratio and whether
the deliverable is clean, overlay-ready, or text-baked. Do not expose
internal prompts or retry mechanics unless asked.
