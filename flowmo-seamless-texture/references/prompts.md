# Prompt language for the two edit passes

Both passes assume an image-edit capability that takes an input image plus a
text instruction and returns an edited image (see the "doable now" split in
SKILL.md - author this as prompt text for whatever image-edit capability the
calling surface actually exposes; no specific tool name is asserted here).

## 1. Seamless edit (pipeline step 2)

Fill `<MATERIAL>` with 3-6 concrete words describing the reference (for
example: "hand-painted cracked dry earth with small grey stones"). If a
shared STYLE FORMULA or STYLE TOKEN applies (see flowmo-style-formula),
append it after this prompt rather than folding it in - keep the tiling
instruction and the style instruction as separate, clearly bounded pieces
of the same prompt.

```
Reproduce the attached image as faithfully as possible: the SAME <MATERIAL>,
same colors, same lighting, same shapes and detail, pixel-level similarity
everywhere possible. Only make the MINIMAL adjustments needed so the image
becomes a perfectly seamless tileable texture: the left edge must continue
into the right edge and the top edge into the bottom edge with no visible
seam when tiled. Do not restyle, do not add or remove elements, do not
change colors or scale. Square 1:1.
```

Add one of these extra sentences when it applies:

- Structured material (bricks, planks, tiles - anything with regular
  repeating units): `The repeating units must be aligned so rows continue
  across the tile borders: unit boundaries at the left edge continue into
  the right edge and across top/bottom.`
- The reference is itself a visibly tiled preview (periodic repetition
  already visible): `Reduce the visible periodic repetition of distinctive
  features so the pattern feels organic.`
- The reference is a stock/found image that may carry a watermark: `Remove
  any watermark text.`

## 2. Offset-inpaint cross-repair pass (see the offset-inpaint section of
SKILL.md)

Run this on the tile after it has been wrap-rolled by half its width and
half its height, so the old seam sits as a cross through the center.

```
This <MATERIAL> game texture is damaged along a vertical line and a
horizontal line through the center: some pattern elements there are faded,
semi-transparent, streaky or cut in half. Replace every damaged element
with a brand-new complete one painted in the exact same crisp style: fully
opaque, sharp confident strokes, same element size, same colors. No blur,
no soft transparent elements, no smoothing - the repaired area must be
indistinguishable in sharpness and detail from the rest of the image. Keep
everything outside the damaged lines unchanged. The final image must be a
perfectly seamless tileable texture: the left edge continues into the right
edge and the top edge continues into the bottom edge with no visible seam
when tiled. Flat even lighting, no shadows, no vignette.
```

Two wording choices matter here, learned from failed attempts at the
opposite phrasing:

- Say "replace every damaged element with a brand-new complete one," not
  "repair the seam." Asking a model to "repair" biases it toward smoothing,
  which produces a blurry band of ghost elements along the line instead of
  a clean replacement.
- Explicitly forbid faded/semi-transparent/smoothed results in the prompt
  itself - don't rely on the model inferring that from "damaged."

Also do not rely on "keep everything outside the damaged lines unchanged"
alone to protect the rest of the tile - an edit pass will often repaint
more of the image than asked despite that instruction. That is exactly why
the composite step in SKILL.md's offset-inpaint section takes only the
agreement region between the original and the repaint, rather than trusting
the full output of this prompt.
