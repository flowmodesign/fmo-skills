# Journey shapes and the footage contract

Part of the flowmo-scroll-scrub skill package - see the package's SKILL.md for
routing. This reference covers what footage to shoot or generate and how to
sequence it. It is direction/content guidance, not runtime code - the markup
that plays the footage is covered in
[runtime-requirements.md](runtime-requirements.md).

## Pick a journey shape

**`single-shot` - the default.** One continuous take (~15s - the longest
single take the generating model/tool supports), scrubbed end to end by a
single `data-f0-video-scrub` or `data-f0-image-sequence-scrub` element. No
seams, because there is only one clip. Semantic HTML chapters (real
`<article>`/heading/copy elements, pinned over the media with ordinary CSS
`position: sticky` or an `author_animation` `pin` config) read over it as the
user scrolls. Choose this for a brand, product, service, portfolio, or launch
page - anything whose story is one subject seen ever more closely. When in
doubt, single-shot.

**`multi-leg` - opt in only when the brief genuinely needs several distinct
worlds or acts**, not just "more scenes would look cooler". 4-7 distinct
places the journey travels between, where each destination is a different
environment rather than a closer look at the same one. A multi-leg journey
chains several scrub elements (or several beats inside one longer sequence),
each anchored to the previous leg's real last frame (see Continuity below).
Budget one encode pass and one QA pass per leg; say so before choosing it.
"It would look cooler with more scenes" is not a reason for `multi-leg` - a
tighter single-shot beats a loosely-seamed chain, and it reaches the user far
sooner.

Journey: for `single-shot`, 3-6 chapters mapped to moments of the one clip;
for `multi-leg`, 4-7 scenes as a real narrative or value chain. Give each
chapter a physical subject, one focal point, one short headline, one sentence
of body copy, and at most 0-3 proof tags. Keep type OFF the video - chapter
copy is real HTML, never baked into the footage.

**World grammar (multi-leg only).** Lock one consistent style across every
scene before generating or shooting anything: the same palette, light
direction, surface finish, lens/perspective, and background behavior. Change
only the scene's subject and focal action between legs. A journey that
varies its own visual language leg to leg reads as several unrelated clips
stitched together, not one world.

## The footage contract

The page plays the clip forward and backward at the speed of the user's
scroll, and holds any single frame as a still whenever they pause. Direct
footage like a high-end product film, or the scrub reads as broken regardless
of render quality:

- **One continuous move, no hard cuts.** A cut becomes a jarring jump
  mid-scrub. Stage it as one unbroken camera move (slow orbit, push-in, rise,
  fly-through) or one continuous transformation of the subject.
- **One hero subject, centered, with clean negative space** for chapter copy
  to sit in. The media fills the viewport and crops the edges
  (`object-fit: cover` / `data-f0-image-sequence-fit="cover"`), so keep the
  subject center-safe on both desktop and portrait crops.
- **A background the copy can survive.** Dark, seamless, low-detail (studio
  black/charcoal, a soft gradient, the subject emerging from darkness) is the
  reliable choice. A bright, busy, full-frame background behind body copy is
  the single most common reason an otherwise-beautiful clip reads as unusable.
- **Slow, steady motion** - constant speed, gentle ease only at the very start
  and end. The scroll supplies the pacing, not the footage.
- **Locked exposure and white balance, no flicker, minimal motion blur.** Every
  frame is shown as a still at some scroll position, so exposure pumping
  shimmers and heavy blur smears.
- **Resolves at both ends.** The first frame reads as the establishing shot
  (and IS the poster - see the encode contract), the last as the closing
  beauty state. Start state must not equal end state, or the scrub has no
  payoff.
- **No on-screen text, logos, or watermarks in the footage.** All type is real
  HTML placed over the media.

Subjects that scrub well: a product slowly orbiting on black, an exploded-view
assembly, a macro detail traveling along a surface, a transformation or morph,
a hero object emerging from darkness. Avoid: cuts, fast pans, handheld shake,
busy bright backgrounds, exposure/color flicker.

## The storyboard-grid trick (plan before you spend on video)

Before generating or shooting the actual footage, generate ONE planning image:
a single 16:9 frame laid out as a grid of 6 panels, each panel one keyframe of
the SAME continuous move, in prompt order. This pins palette, lighting, lens,
and camera progression for the price of one image generation, before spending
on video. Prompt it explicitly as **one continuous move across the panels,
not six different scenes**, and with no text anywhere in the image.

In f0, produce this planning frame with `generate_image` (not a video model,
not any Higgsfield tool) using a slotted prompt naming: subject, one
continuous camera move, panel count, locked palette/lighting words, "no text,
no watermark, no browser chrome". Show the result to the user as you keep
working; do not block the build waiting for a reply, and do not re-download or
vision-inspect it yourself - you just generated it from your own prompt, and
re-viewing your own render tells you nothing the prompt didn't. The user is
the reviewer. Budget 2 re-rolls. Treat the result as a planning artifact the
author reviews before committing to the real scrub source - it is not itself
part of the shipped page.

## Multi-leg continuity (A/B continuity)

When a journey needs `multi-leg`, chain legs with exact-frame continuity so the
seam is invisible:

1. Render or capture leg A in full first.
2. Extract leg A's ACTUAL last rendered frame (not a separately generated
   still, not an imagined destination image).
3. Use that exact frame as the visual anchor for leg B's opening - either as
   leg B's real first frame (regenerate/reshoot leg B starting there) or, at
   minimum, verify leg B's first frame matches it closely enough that the cut
   is imperceptible mid-scrub.
4. Match velocity as well as position: leg B should continue the same
   direction and speed leg A was moving at its last frame, not restart from
   rest.
5. Inspect the seam in both scroll directions (forward and reverse) before
   treating a leg as final. A seam that only works scrolling down is still
   broken.

Translated to markup: chain multiple `data-f0-video-scrub` (or
`data-f0-image-sequence-scrub`) elements as consecutive bands in the page, each
with its own `data-f0-scrub-start` / `data-f0-scrub-end` range, or express
multiple beats inside one longer encoded sequence when the source supports it.
Each element's poster must be the exact first frame of ITS OWN encoded clip
(see [encode-and-hosting.md](encode-and-hosting.md)) - never the previous leg's
still or a generic placeholder.

## What this is not

This reference governs content and sequencing only. It does not describe a
scroll listener, a `requestAnimationFrame` loop, or a `currentTime` assignment
anywhere - f0's scrub runtime already owns playback. See
[runtime-requirements.md](runtime-requirements.md).
