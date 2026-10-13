---
name: flowmo-seamless-texture
version: 1
family: image
description: |
  Turn a reference or generated image into an engine-ready seamless texture:
  the ordered pipeline (square crop, edit prompt, border trim, histogram
  match, periodic decomposition, luminance flatten, min-cut seam finding,
  PBR derivation) as a checklist, the seam-ratio metric, the offset-inpaint
  cross-repair technique for a seam that survives the first pass, and the
  PBR output set (basecolor, normal, roughness, height) delivered. States
  which steps are prompt-authorable today via an image-edit capability and
  which (FFT PBR derivation, min-cut solving, periodic decomposition) need a
  deterministic code node f0 does not yet have. Use when: making a ground/
  wall/floor/fabric/material tile seamlessly, asked for "seamless texture",
  "tileable material", "PBR maps", or fixing a visible seam/repeat. NOT for:
  deriving the art style an asset family should share (use
  flowmo-style-formula) or one-off non-tiling image generation.
surfaces: [flowgen-image-node, flowgen-3d-node, scene3d, mcp]
triggers:
  - seamless texture
  - tileable material
  - pbr maps
  - fix the seam
  - texture tile
presets: presets/texture-output-schema.json
chain_with: [flowmo-style-formula]
derived_from: https://github.com/higgsfield-ai/skills
---

# flowmo seamless texture

Turns a reference photo or a generated image into an engine-ready seamless
tile plus its PBR map set. The pipeline can be entered at any phase - only
fix a seam on an existing tile, or only derive maps from an image that is
already seamless - do not force the full chain when the input is already
partway there.

If the source material needs a shared art style first (multiple materials
that should read as one set), run **flowmo-style-formula** first and carry
its formula/token into the edit prompt below; chain back to it if the result
drifts off-style rather than treating that as a seam problem.

## The pipeline as an ordered checklist

1. **Square crop.** Crop the reference (or generated image) to a square. If
   the source has perspective or depth of field, crop the sharpest, flattest
   region - tilted detail and background blur turn into mush at the seam
   later. Measure first: if a quick seam-ratio check (step 7 below) on the
   raw crop is already close to 1.0, the crop may already be seamless -
   skip the edit prompt (step 2) and continue from step 3 with no border to
   trim, so the deterministic passes still confirm and lock in the tiling. A
   tile that is ALREADY fully seamless (post-pipeline, not just a raw crop)
   skips straight to PBR derivation (step 8) instead - do not conflate the
   two: a raw crop that merely measures well can still hide a soft residual
   the deterministic steps catch.
2. **Edit prompt.** Send the crop through an image-edit pass whose prompt
   asks it to preserve every pixel it can - same material, same colors, same
   lighting, same detail - and make only the minimal change needed so the
   left edge continues into the right edge and the top edge continues into
   the bottom edge with no visible seam when tiled. See
   [references/prompts.md](references/prompts.md) for the exact prompt
   language. Do not ask the edit pass to also fix color drift or blur at the
   border - later steps handle those deterministically and more reliably
   than another prompt round would.
3. **Trim ~4% border.** An edit pass commonly softens and blurs a thin ring
   around the whole image. Crop roughly the outer 4% away before doing
   anything else with the result, so that blur never enters the palette
   match or the seam fix.
4. **Histogram match.** Match the trimmed result's per-channel tone
   distribution back to the original reference so the edit pass's color
   drift is canceled and the material's real palette survives. This is a
   deterministic statistical remap (per RGB channel), not a visual
   "looks close enough" judgment call.
5. **Periodic decomposition.** Separate the image into its periodic
   component (the part that tiles cleanly) and its non-periodic residual
   (the drift that breaks tiling), and keep the periodic component going
   forward. See [references/pbr-pipeline.md](references/pbr-pipeline.md)
   for the shape of this step.
6. **Luminance flatten.** Even out large-scale brightness variation across
   the tile (a soft light-to-dark gradient from one corner to another) so
   tiling the result doesn't produce a visible checkerboard-of-brightness
   pattern once repeated.
7. **Min-cut seam finding.** Find the least-visible path across the
   remaining seam - a thin donor strip from elsewhere in the tile, bounded
   by a cost-minimizing cut that avoids running through high-detail
   features (individual stones, planks, distinct pattern elements) and
   prefers low-detail zones (mortar lines, moss, flat fill). This is a
   sharp, feature-aware repair, not a soft blur-the-seam cross-fade.
8. **PBR map derivation.** From the finished seamless base color, derive the
   rest of the PBR set (normal, roughness, height) using frequency-domain
   (FFT) high-pass/low-pass filtering rather than a hand-drawn map, so every
   derived map inherits the same tiling guarantee as the base color. See
   [references/pbr-pipeline.md](references/pbr-pipeline.md).

## Seam-ratio metric

Measure seam visibility as: the average pixel difference across the tile's
own wrap edges (top row vs bottom row, left column vs right column), divided
by the average pixel difference between ordinary adjacent interior pixels.
A ratio near `1.0` means the seam is no more visible than normal image
detail - effectively seamless. Flag anything above roughly `1.3` for another
pass (either step 7 again with a wider search corridor, or the
offset-inpaint technique below for a seam that keeps surviving). Always
verify visually too, at full resolution on both wrap edges and the tile
center - a downscaled 2x2 tiling preview hides a translucent smear or a
faint interior tone step that the ratio alone can miss.

## Offset-inpaint cross-repair (for a seam that survives the first pass)

When a structured material (bricks, planks, a strong repeating pattern)
still shows a visible seam after steps 2-7, move the problem to the center
of the tile instead of fighting the edge again:

1. Shift (wrap-roll) the tile by half its width and half its height. The old
   edge seam now sits as a cross through the middle of the image instead of
   at the border.
2. Send that shifted image through a second image-edit pass whose prompt
   targets only the damaged cross: ask it to replace the faded/streaky/
   cut-in-half elements along that line with brand-new, fully opaque,
   sharply rendered elements in the same style, and explicitly forbid a
   blurred or "repaired-looking" result. See
   [references/prompts.md](references/prompts.md) for the exact wording -
   asking a model to "repair the seam" tends to bias it toward smoothing and
   produces a visible blurry band instead.
3. **Never trust the edit pass's full output** - it tends to repaint more of
   the image than asked, and the repaint outside the cross often drifts in
   color or adds ghosting. Composite in only the cross itself: take the
   region where the original and the repaint agree as the boundary, cut a
   path through that agreement zone (the same min-cut idea as step 7,
   applied along both the shifted vertical and horizontal seams), and keep
   everything outside that path as the untouched original - roughly 70% of
   the tile stays untouched original pixels.
4. Unroll (wrap back) the composited result. The repaired cross becomes the
   new tile's wrap edges; the untouched original becomes its interior. Run
   the normal PBR derivation (step 8) on this result.

If a faint interior line remains where the composite boundary sat, or the
seam ratio still reads above the flag threshold after this, repeat the whole
offset-inpaint pass once more on the new result - the boundary lands in a
different place each time and a second pass usually finishes what the first
one missed.

## Output structure

A finished material delivers one seamless base image plus its derived PBR
set, addressed by one shared material id:

- `<id>_ref` - the square-cropped reference the pipeline started from (step
  1), kept for provenance and for re-running a later phase.
- `<id>_seamless` - the tileable base color image itself.
- `<id>_basecolor` (a.k.a. albedo) - the same base color, named for engine
  PBR slots.
- `<id>_normal` - surface-detail normal map derived from the height signal.
- `<id>_roughness` - micro-surface roughness derived from local contrast.
- `<id>_height` - displacement/parallax source derived from low/high-pass
  luminance filtering.

See [presets/texture-output-schema.json](presets/texture-output-schema.json)
for each map's role and typical engine use. Group all maps for one material
under its id so a multi-material set stays organized and each material's
maps stay unambiguous.

## What is a prompt versus what is deterministic code

- **A prompt, through an existing image-edit node:** steps 1 (crop), 2 (the
  edit prompt itself), and the offset-inpaint edit pass. These are ordinary
  image-generation/edit prompts - author them as such. Step 2 and the
  offset-inpaint edit pass are a masked or targeted-region edit: f0 has real
  node types for this, `maskedEdit` and `brushEdit` - route the edit prompt
  through whichever one the calling surface exposes.
- **Deterministic code, not a model prompt:** steps 3-8 - border trim,
  histogram match, periodic decomposition, luminance flatten, min-cut seam
  finding, and FFT-based PBR derivation. These are exact numerical
  operations (statistical remaps, frequency-domain filters, shortest-path
  search) that a language model cannot reliably reproduce by "trying to draw
  it right," and re-running them as prompts would reintroduce exactly the
  sampling variance they exist to eliminate. f0's `customCode` node is the
  real node type for this: a user-authored TSX module with its own typed
  input/output sockets and a deterministic `run(inputs, ctx)` transform -
  author steps 3-8 as that node's `run()` logic, not as another generation
  prompt.

## Chaining

Run **flowmo-style-formula** first when this material is one of several that
must share a look, and carry its formula or token into the edit prompt in
step 2. If a finished tile reads off-style rather than merely seamed wrong,
that is a style problem to solve there, not another seam-fix pass here.
