# The deterministic steps, as an algorithm specification

This describes the shape of pipeline steps 3-8 (SKILL.md) precisely enough
to hand to a deterministic implementation. It is a specification to
implement or invoke, not something to approximate with another generation
prompt - see the "what needs a future node" section of SKILL.md for why.

## Border trim (step 3)

A plain crop: remove roughly the outer 4% of the image on all four sides.
Skip this step entirely when the input did not come from an edit pass (an
already-seamless or already-clean tile has no blurred border to remove).

## Histogram match (step 4)

For each of the three color channels independently: build the channel's
value distribution (a histogram) for both the trimmed result and the
original reference, then remap every pixel value in the result through the
lookup that makes its cumulative distribution match the reference's
cumulative distribution for that channel. This restores the reference's
exact tonal identity per channel without touching the image's spatial
structure (edges, detail) at all - it only remaps values.

## Periodic decomposition (step 5)

Split the image into two additive components: a periodic component that
tiles with zero discontinuity at the edges, and a smooth non-periodic
residual that absorbs whatever large-scale drift (a gradient, an uneven
wash of light) would otherwise break tiling. The periodic component is
solved in the frequency domain: build a small boundary-difference field
from the mismatch between opposite edges, solve for the smooth correction
that field implies, and subtract that correction from the original. What
remains is the part of the image that already wraps cleanly. Keep that
periodic component and discard the residual going forward - carrying the
residual into later steps would reintroduce the same drift the decomposition
just removed.

## Luminance flatten (step 6)

Take the image's brightness channel, low-pass filter it (blur it heavily in
the frequency domain) to get its large-scale brightness trend, and subtract
that trend from every pixel so the overall large-scale brightness becomes
uniform across the tile. This does not touch fine detail or local contrast
- only the slow, large-scale brightness gradient - so texture and pattern
detail survive untouched while a repeating tile stops showing a visible
light/dark checkerboard once placed side by side with copies of itself.

## Min-cut seam finding (step 7)

Wrap-roll the tile by half its size on one axis so the old edge seam now
sits in the middle as a straight band. Pick a donor strip from elsewhere in
the tile whose own edges are smooth (so it becomes a clean new wrap pair
once used) and that visually matches the seam band. Build a per-pixel cost
field across that band that penalizes both (a) disagreement between the
band and the donor and (b) cutting through high-detail features (measured
as local edge energy - individual stones, planks, distinct pattern
elements). Find the cheapest path across the band from one side to the
other under that cost field (a shortest-path search, one row of choice per
column, constrained so the path's two ends line up for the wrap) - this is
the min-cut. Use that path as a hard boundary: donor pixels on one side of
it, original band pixels on the other, with only a few pixels of feather
directly on the cut line itself so the join disappears without the
soft-blurred-band look of a plain cross-fade. Repeat on the other axis, then
unroll. The result: a seam that hides in the material's own low-detail
zones (mortar, moss, flat fill) instead of averaging across a wide band the
way a blur-based fix would.

## PBR map derivation via FFT filters (step 8)

Work from the finished seamless base color's luminance (its average
brightness per pixel, so material color does not bias the geometry signal):

- **Height**: a band-pass result - low-pass (heavily blurred) luminance
  subtracted from a lightly low-passed luminance - then normalized to a
  0-1 range using the image's own bright/dark percentiles rather than its
  absolute min/max (so a few outlier pixels cannot flatten the whole map).
- **Normal**: the height map's local slope in both directions (a wrap-around
  finite-difference gradient, so the normal map tiles exactly as cleanly as
  the height map it comes from), combined into a standard tangent-space
  normal vector per pixel and remapped into the usual 0-1 color range that a
  normal-map texture slot expects.
- **Roughness**: a measure of local high-frequency contrast (luminance minus
  its own lightly-blurred version), inverted and clamped into a plausible
  roughness range so busier, higher-contrast micro-detail reads as rougher.

Every filter above operates in the frequency domain using a wrap-around
(cyclic) convolution rather than a bounded one, which is what guarantees
every derived map tiles exactly as cleanly as the seamless base color it was
computed from - a non-wrap-around blur would reintroduce a seam in the
derived maps even though the base color has none.
