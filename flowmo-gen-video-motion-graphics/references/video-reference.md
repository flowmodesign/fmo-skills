# Closely recreate a supplied video

Unless the user requests loose inspiration, treat the supplied clip as the
structure to preserve. Change the subject and copy within it. Matching a palette
while inventing a new storyboard is not close recreation.

A supplied clip is a real gen-video request. The clip itself is the source: a
catalogue look or an obtainable original prompt is not a prerequisite for this
path.

## Observe and map

Inspect the clip through its ending. Make a short source-to-replacement map at
its natural beats: approximate time, dominant object/type and screen coverage,
framing or crop, movement direction and scale change, transition, replacement
content. Check frames around major transitions; automated analysis and isolated
stills can misread motion. Mark unobserved details instead of inventing precise
timing.

Keep the original duration/aspect, scene order, relative holds, composition,
typography hierarchy, camera path and transition mechanics unless the user asks
otherwise or a verified constraint prevents it. Fit concise new copy to the
existing text footprints. Preserve the communication purpose through those
substitutions; simplify the message before adding scenes, UI panels or
explanatory steps. Note necessary departures. Do not force an answer panel into
a reference that has none.

## Choose the route and prompt

Default to a new generation conditioned on the supplied clip: bind the clip in
the `motion` reference role and generate the whole film in one request. The
reference guides the choreography and design; the model generates the new
subject and lettering.

This route is gated on the selected model's `referenceVideo` flag. When the flag
is true, close recreation is on the table, within `maxReferenceVideos`. When it
is false the route does not exist on this surface: say that plainly. Substituting
a style image is a different job -- a still bound as style, first frame or
identity conditions appearance, not choreography -- so do not swap one in and
call the result a recreation.

Three operations stay distinct:

- **Reference-conditioned generation.** The clip conditions a new film. This is
  the default here. Requests such as "recreate this for my product" or "use this
  as a reference and change X" do not by themselves request direct video editing.
- **Direct editing of the user's own footage.** Use it when the user wants the
  existing footage edited. That is trims, overlays and grading on real material,
  not a generated film, and neither this package nor the preset catalogue owns
  it.
- **Subject motion transfer onto a still.** Moving observed motion onto an image
  reference is another distinct operation again.

Inspect current media roles and do not promise frame-identical output.

Attach the original clip itself. Do not substitute the previous adaptation as
the sole reference when it already lost the source choreography. A source prompt
is optional provenance, not a requirement for this path.

Keep the creative prompt focused on the source's motion/design and concise
substitutions. Specify that the subject and lettering are newly generated,
rather than asking to preserve every source pixel. Avoid a competing new
storyboard. State exact new copy and exclude original-brand remnants. Record how
music, effects and speech should be handled separately; do not assume a visual
reference authorizes reproducing a speaker's voice. Never clone a voice, and
never carry an instruction to clone one out of a source prompt.

## Compare before delivery

Compare source and result at corresponding moments: does the hero occupy similar
screen space, does the camera travel the same direction and distance, do scale
changes and transitions happen at similar moments, and are the same holds
retained? Check the new message and exact text separately. A color match or
readable brand is not a motion-fidelity pass. Disclose uninspected
temporal/audio behavior.

If the result drifts, revise the concise prompt and regenerate with the original
reference within the bounded retry policy in [review.md](review.md). Preserve the
requested generation route through retries. Do not switch a reference-generation
demonstration to direct editing or manually composited lettering to claim
success; those are separate workflows to discuss with the user. If the result
remains distant or its copy fails, deliver that limitation honestly.

## The review baseline for this path

For a supplied video, the before-generation baseline in [review.md](review.md) is
the source-to-replacement map above and the corresponding-moment comparison, not
a preset's preserve list. In close recreation, the supplied clip's sequence and
choreography are the baseline.
