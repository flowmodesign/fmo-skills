---
name: flowmo-style-formula
version: 1
family: image
description: |
  Derive one STYLE FORMULA per asset family (rendering style, shape/line
  language, palette by role, light/mood, readability) and reuse it
  byte-identical across every sprite/tile/background/texture/UI prompt so
  generated assets read as one set, not "three different styles on one
  screen". Covers the compressed STYLE TOKEN, key-color selection for
  transparent assets, per-kind prompt templates, the 2-attempt regen budget,
  the contact-sheet check, and 2D vs 3D differences. Use when: generating a
  sprite/tile/background/texture/UI kit, defining a game or product's art
  style, keeping independent image assets visually consistent, or asked for
  a "style formula" / "style token" / "art bible". NOT for: the seamless
  texture pipeline itself (use flowmo-seamless-texture) or UI design outside
  an asset kit (use flowmo-design-craft).
surfaces: [flowgen-image-node, flowgen-3d-node, designer, mcp]
tools: [designer:generate_image_asset, designer:edit_image_asset]
triggers:
  - style formula
  - style token
  - style bible
  - art bible
  - asset kit
  - sprite sheet
  - game art style
presets: presets/kind-templates.json
chain_with: [flowmo-seamless-texture, flowmo-3d-asset-hygiene]
derived_from: https://github.com/higgsfield-ai/skills
---

# flowmo style formula

Every asset-generation call is stateless: the model has no memory of the
sprite it made a minute ago. Without one shared piece of text carried into
every prompt, a batch of independently generated assets reads as several
different styles stitched together. The STYLE FORMULA is that shared piece of
text: derive it once, get it approved once, then insert it unchanged into
every generation prompt for that asset family.

See [a full worked example](references/style-formula-example.md) of a
formula, its token, and assembled prompts. Per-kind templates live in
[presets/kind-templates.json](presets/kind-templates.json).

## 1. Build the STYLE FORMULA

One paragraph, 60-90 words, composed once right after the brief is read and
shown to the user for explicit approval before any asset is generated.
Concatenate five blocks, in this order:

| # | Block | Pins down | Example |
|---|---|---|---|
| 1 | Rendering style | what it looks "drawn with" | `flat vector cartoon with soft gradients` / `chunky pixel art, 32x32 grid feel` / `soft hand-painted gouache` |
| 2 | Shape & line language | silhouettes and outlines | `rounded blobby shapes with thick dark-plum outlines` |
| 3 | Palette by role | readability, not one gamma | `environment in deep violet stone with charcoal shadows, hero in warm coral-cream tones contrasting the surroundings, hazards and pickups marked with acid-green glow` |
| 4 | Light & mood | one clause | `moody but playful underground atmosphere, flat ambient light` |
| 5 | Readability + perspective word | contrast + viewing angle | `high contrast between elements and backgrounds, clean readable silhouettes, consistent side-view perspective across all assets` |

Rules:

- **Block 3 assigns roles, not one flat color list.** The environment gets its
  base colors; the subject/hero gets colors that CONTRAST with that base so it
  never blends into the background; hazards, pickups, or calls-to-action get
  one distinct signal hue. Style identity lives in blocks 1, 2 and 4 - color
  in block 3 exists to serve readability, not to carry the whole style alone.
- **The perspective word in block 5 must match the actual viewing angle**:
  side-scrolling/platformer -> `side-view`; top-down -> `top-down`; flat UI or
  puzzle grid -> `flat frontal`. Mismatching this word from the real camera
  angle is the most common cross-asset failure - the formula is where it gets
  caught before generation, not after. (3D targets: see section 6, the
  perspective word is replaced, not reused.)
- If the user supplied a reference image, describe ITS rendering style in your
  own precise words in block 1 - never paste an image URL into the formula.
- Do NOT put into the formula: asset-specific content (that belongs in the
  per-asset description), background/keying instructions (that is the kind
  suffix, section 3), or pixel dimensions/resolution.

### STYLE TOKEN (compressed form)

Some fields a formula must land in are length-limited. When the full 60-90
word formula will not fit, use the STYLE TOKEN instead: blocks 1 + a
condensed block 3 + one accent from block 4, at most 120 characters, derived
ONCE from the approved formula and then also frozen byte-identical. Example:
`flat vector cartoon, deep violet dungeon palette, glowing teal accents, warm amber torchlight, thick dark-plum outlines`.
The formula is the source of truth; the token is its compression - never
maintain two competing style strings side by side.

## 2. The byte-identical contract

The formula (or token, where length-limited) is inserted into EVERY
generation prompt of EVERY asset kind in this family without changing a
single byte: no paraphrasing, no shortening, no "improving" it per asset,
including single-asset regenerations mid-batch. Re-deriving the formula
mid-project is allowed only when the user explicitly asks to change the art
style - that reopens the approval gate and invalidates every existing asset
generated under the old formula.

## 3. Prompt assembly and kind templates

Every asset prompt is exactly four parts concatenated in order:

```
<kind template> + <asset description> + <STYLE FORMULA, byte-identical> + <kind suffix>
```

The asset description is a stable 3-4 word shorthand from the brief (`the
round blue slime`), never a proper name alone.

The five kind templates (sprite, tile, background, texture, ui) - each with
its template prefix, its suffix, which parameter needs a KEY COLOR, and its
`aspect_ratio` - are in
[presets/kind-templates.json](presets/kind-templates.json). Feed the
assembled string as the prompt to `generate_image_asset` (Designer) or the
active image-generation node's prompt field (`flowgen-image-node`); use
`edit_image_asset` for a targeted redo of one region rather than a full
regeneration. Set the kind's `aspect_ratio` in the tool's own `aspect_ratio`
field (`generate_image_asset`'s enum: `1:1` / `3:4` / `4:3` / `16:9` / `9:16`
- `mediaGenTools.ts`) rather than naming it in the prompt text: per that
tool's own field description, "naming an aspect ratio in words does nothing,
use the field." `sprite` / `tile` / `texture` / `ui` are `1:1`; `background`
is `16:9`.

Prefer one image-generation model across every kind in the family - switching
models mid-family is itself a style-consistency risk on top of everything the
formula already guards against. Pick quality/model at generation time for the
kind's real target size; do not compensate for a low-quality generation by
upscaling afterward.

## 4. Key-color selection (for assets that need a transparent background)

Most image models cannot output alpha directly; asking for "transparent
background" in the prompt tends to produce a fake checkerboard baked into the
pixels. Some models take a real `transparentBackground` node property instead
(check `flowgen_get_node_capabilities` for that control): GPT Image 2.5 returned
clean RGBA through it. When the chosen model has no such control, `sprite` and
`ui` kind assets (section 3) are generated on a solid key color and keyed out
afterward - either in a post-process step outside f0,
or via `remove_image_background` when the background is a clean solid.
Choosing the key color is a mandatory per-asset step, driven by the formula's
own palette:

1. Default: bright magenta `#FF00FF`.
2. If the asset's own colors (its description OR the formula's role palette)
   sit anywhere near pink/magenta/purple, use bright green `#00FF00` instead.
3. If both of those are taken by the asset's real colors, use bright blue
   `#0000FF`.

The chosen color goes into the kind-suffix `<KEY COLOR>` slot. Watch for
enclosed regions of the wrong color that are not touching the image edge (a
donut hole, a ring's center) - a naive edge-only keying pass misses them.

### Layered parallax backgrounds

For a background split into depth layers (back plate, middle, front), generate
one master panorama first, then each layer as its own pass with the master as
the reference image, so camera, horizon and grading stay identical across
layers. The back plate is opaque; the middle and front layers use
`transparentBackground` where the model supports it. Prompt the back plate for
clear air: "haze" or "fading into grey" produces a fog band across the skyline
that reads as smog, not depth. Do the tonal grade (duotone, contrast window,
sky gradient) after generation, on all layers together, so they match.

## 5. Regeneration budget and the contact sheet

- **Budget: 2 regeneration attempts per asset.** Style drift, a bad key-color
  read, or a tiling seam are usually sampling variance, not a prompt error -
  **re-roll the SAME prompt first**, unchanged. Only edit the description
  itself once a re-roll confirms the content (not the sampling) is wrong. If
  two identical re-rolls both fail, the prompt or approach is wrong, not the
  seed - stop regenerating blindly and revise the template instead.
- After 2 attempts, take the best result and compensate downstream (recolor,
  rescale, nudge placement) rather than spending a third generation.
- The only legitimate full-set regeneration is the user explicitly asking to
  change the whole style: new formula, new approval gate, then every asset in
  the family redone. Never regenerate the whole set in response to feedback
  on one asset.
- **Contact sheet before final approval:** place every generated asset for the
  family side by side on one canvas/page, each scaled to its `relative_scale`
  (hero-units: the hero/subject = `1.0`, a small hazard/decoration
  ~`0.5-0.6`, a large structure ~`2.0`), on a strip of any tiled
  background the set includes. `relative_scale` is metadata for this
  side-by-side check and for downstream in-canvas sizing - it is never
  inserted into a generation prompt. Look at the sheet and check: does
  everything share the same rendering style (block 1)? Consistent outlines
  (block 2)? Does the subject actually pop against the environment, or does
  it blend (block 3)? One perspective word honored everywhere (block 5)? A
  problem caught here costs one regeneration; the same problem caught after
  the assets are already placed and wired costs a much larger rework.
- **Final in-game sizes (2D):** sprite 128px, tile 256px (power-of-two),
  background 1280x720. Downscale with NEAREST for pixel-art formulas (LANCZOS
  smears them), LANCZOS otherwise.

## 6. What changes for a 3D target (flowgen-3d-node)

The same formula applies to a 3D asset, but through a different surface than a
flat sprite. 3D geometry, materials and the render-side lighting stack are
owned by the `flowmo-3d` skill once a mesh exists on the scene; GLB
verification, image-to-3D preflight, and polycount budgets are owned by
**flowmo-3d-asset-hygiene** (its own polycount table by asset class - do not
re-derive one here). This package's job for a 3D target is narrower and
happens before and after that hand-off:

| Aspect | 2D (flowgen-image-node) | 3D (flowgen-3d-node) |
|---|---|---|
| Style carrier | Formula verbatim in every asset prompt | Formula verbatim in the CONCEPT/reference image prompt generated via `generate_image_asset`, before that image enters mesh creation; token form if a downstream field is length-limited |
| Background for subject shots | Solid key color for keying (section 4) | Flat, even, shadow-free background with no ground plane in view - shadows and clutter in a concept image are the top cause of a bad mesh reconstruction; keying is irrelevant once geometry exists |
| Perspective word | `side-view` / `top-down` / `flat frontal` everywhere | Replaced by a `three-quarter isometric view` on concept/reference images (shows top plus two sides, maximum shape information); once meshed, the in-game/in-scene camera is free |
| Style-drift fix | Regenerate the asset (budget: 2, section 5) | Prefer a texture-only re-pass on the existing mesh over regenerating geometry, when the pipeline in use supports one - a shape that already reads correctly should not be thrown away for a color problem |
| Extra style surface | - | Once the mesh is in a scene, its lighting color, fog and ambient intensity should be derived from the formula's blocks 3-4 (not left at scene defaults) via the material/lighting controls in the `flowmo-3d` skill, or a perfectly on-style texture set still reads off-style in the render |
| Geometry style | - | Add a geometry clause to the concept-image prompt when the formula implies one (`low-poly faceted`, `smooth rounded blobby`) so the shape language matches blocks 1-2 before mesh generation even starts. The two low-poly paths are mutually exclusive (a stylized faceted LOOK vs. a precise polygon BUDGET, `targetPolycount`) - pick one per asset per **flowmo-3d-asset-hygiene**'s preflight checklist, never both |

**Full style change in 3D:** new formula -> re-approval gate (never skipped)
-> regenerate concept/texture references -> re-derive scene lighting, fog and
ambient from the new formula's blocks 3-4 -> revisit the geometry clause for
future assets. New textures left on old lighting read as a texture swap, not
a restyle.

**Realism ceiling:** state this at the approval gate, not after generation.
Without true mesh-level detail generation, primitives stay primitives - a
photoreal target style cannot be honestly delivered as "a texture on a box."
When the brief implies realistic/detailed geometry the formula cannot back,
say so at approval time and offer the achievable stylized version instead
(a darker palette, hard warm light, fog, grain reads as intentional; a flat
texture pretending to be realistic reads as a mistake).

## Chaining

A `tile` or `texture` kind asset generated under this formula is a starting
point for tiling, not a finished PBR-ready texture. Hand it to
**flowmo-seamless-texture** for the seam-fix and PBR-map pipeline once the
style pass above is approved.
