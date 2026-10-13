# Rendition: gen-video

The surface-facing rule set for handing a motion-graphic prompt to a video
model. Keyed to capability flags, never to a model name, so a model added to
the catalogue with its flags is already covered.

## Production defaults

- Choose the production unit from the request: separate generated plates plus
  native editable overlays for a hybrid film; one complete flattened film only
  when requested and legal for the selected model. Preserve the full editorial
  map in both cases. A whole-film preset never overrides task routing.
- Prefer the strongest suitable accessible model the surface exposes. Inspect its
  actual schema for duration, references, audio and prompt constraints; read its
  `ModelCapabilities` rather than a model name. Source model and format are
  provenance and a useful comparison, not a permanent model lock. Explain a
  material route change or access limitation.
- References are conditional. Start prompt-only for typography or abstract
  motion. Reuse relevant existing assets when product, person or UI identity
  matters. Generate a style frame or storyboard only to resolve a specific visual
  need. Create starting stills only where conditioning needs them; a storyboard
  panel is planning evidence, not an automatically approved generation.
- Default new launch and motion campaigns to instrumental music plus
  synchronized motion effects, without narration. Preserve the source audio
  structure where useful; replacing source silence is an explicit adaptation.
  Separate music, effects, existing speech and new narration as four decisions.
  Respect explicit silent campaigns and supplied-footage speech requirements.
- Default new campaigns to 15 seconds, 16:9 and a 30fps delivery target unless
  user or source continuity calls for otherwise. Native generation fps may
  differ. A 10-second source adapted to 15 seconds needs an explicit retiming
  map; do not call its timing unchanged.

## The prompt skeleton, with slots

```text
{{DURATION}}s, {{ASPECT}}, {{FPS}}fps motion graphic. {{SUBJECT}}.
{{STORY_IN_ONE_SENTENCE}}

DESIGN WORLD
Ground: {{GROUND}}. Ink: {{INK}}. Accent: {{ACCENT}}.
Key light from {{LIGHT_DIRECTION}}; {{MATERIAL_BEHAVIOUR}}.
Type: {{TYPEFACE_CHARACTER}}, {{TYPE_SCALE_RULE}}.
Objects present: {{OBJECT_LIST}}.

MOTION RULES
Camera: {{CAMERA_DOCTRINE}}.
Mechanic: {{ONE_MECHANIC}}.
Easing: {{EASE_CHARACTER}}.
Everything that has arrived stays exactly where it landed.
{{PROHIBITIONS_POSITIVE}}

[0.0-{{T1}}s] Phase 1 -- {{PHASE_1_NAME}}
{{PHASE_1_LINE}}

... one section per phase, contiguous, the last ending at {{DURATION}}s ...

SOUNDSCAPE
{{EFFECT}} on {{VISIBLE_EVENT}}. Speech: {{YES_OR_NO}}.

MUSIC
{{INSTRUMENTAL_CHARACTER}}, {{TEMPO}}, lifts at {{LIFT_POINT}}, ends
{{ENDING_BEHAVIOUR}}.

ON-SCREEN TEXT
Phase {{N}}: "{{EXACT_STRING}}"
... every readable string, spelled as it must appear, and nothing else ...

REFERENCES
{{ASSET}}: {{ROLE}}
... omit the whole section when there are none ...
```

Never summarise a phase away to fit a prompt limit. Cut a phase deliberately,
record it as a departure, and say the film is now a shorter adaptation.

## The phase line format

One line per phase, five parts, always in this order:

```text
[start-end s] label - action, camera, transition, exact copy, hold
```

- **start-end s** -- the interval, on tenths of a second, contiguous with its
  neighbours.
- **label** -- what this phase is called, three words at most. It is how a
  revision refers to the phase later.
- **action** -- the one thing that happens, as a verb with a subject.
- **camera** -- one behaviour: locked, or one named move. Not two.
- **transition** -- how it leaves into the next phase: cut, match cut on a named
  shape or direction, or continuous.
- **exact copy** -- the readable strings that appear here, quoted, matching the
  ON-SCREEN TEXT list character for character.
- **hold** -- the still tail, with its length, sized by the copy above.

Worked shape, not a template to paste:

```text
[0.0-2.4s] mark lands - the wordmark snaps up 40px into a locked frame and
stops dead, camera locked, cut on the last frame, "Field Notes", 0.6s hold
```

## Capability table, expanded

| Flag | Present | Absent |
|---|---|---|
| `firstFrame` | Bind the opening composition and describe motion only, never the still. | Describe the opening. Do not promise a locked opening framing. |
| `lastFrame` | Bind the payoff frame. This is the strongest fix for exact type: render the endcard and bind it. | The reveal degrades to a described ending. Say so in the plan. |
| `referenceImages` / `maxReferenceImages` | Bind by role, one purpose per asset, up to the published count. | Identity rests on description and will drift. Above the count, drop extras yourself and name the ones you kept; a provider route drops them silently. |
| `referenceVideo` / `maxReferenceVideos` | Close recreation of a supplied clip is on the table. | It is not available on this route. Do not swap in a style still and call it recreation. |
| `audio` | Keep SOUNDSCAPE and MUSIC. | Delete both sections and carry the audio spec to the composition. Leaving them in spends tokens on nothing. |
| `audioInput` | A supplied track can condition the generation. | The track is a composition layer only. |
| `negativePrompt` | One short exclusion line, plain words. | Fold every exclusion into positive phrasing in the main prompt. |
| `fpsSelect` | Ask for the delivery frame rate. | Native rate is whatever the model runs at; the conform happens downstream. |
| `seed` | A variation on the same film is possible. | Reruns are not reproducible. Do not promise a variation. |
| `extend` | Length can be grown after the fact. | Get the duration right in the request. |
| `resolution4k` | Ask for the top tier this model lists. | Ask for the top tier it lists, which is not the top tier that exists. |
| `cfgScale`, `characterOrientation`, `personGeneration` | Extra controls. | Absent controls, never a reason to change the film. |

`imageToVideo` true with `textToVideo` false: the model needs a starting still.
Make or pick it first, then write the MOTION.

## Resolve the film and route

The video route is the surface's own tool: `generate_video` on the assistants,
`generate_video_asset` on Designer, or a `videoGeneration` node in Flowgen.
Inspect duration, aspect ratio, resolution, reference roles and limits, audio
support and prompt limits through the actual tools, not from memory.

Keep the source endpoint and format as provenance. The captured originals ran on
a hosted marketing-studio product; a raw-model adaptation on this surface is a
different route. Preserve the creative template while disclosing that
difference, and never claim the adaptation reproduces that product's internal
workflow. Do not guess an unavailable preset id or read catalogue exposure as
account entitlement. Use read-only estimation for cost and access preflight
where it is supported, never a generation as a probe. A request to see the
prompt first stops before any image generation, upload or video submission.

Submit each planned production unit with its actual duration and conditioning.
A provider failure does not establish that the duration or shot count is
unsupported. Inspect the error and schema, and repair that unit. Do not turn
separately generated shots into a managed long-video job, or flatten requested
editable text/graphics, merely because one attempt failed.

A missing capability is reported through `ModelCapabilities`. There is no
connection guide here, and an unavailable model or tool is a specific handoff
issue: complete the authorized prompt rather than silently switching providers or
production methods.

## Decide whether references help

- **Prompt-only:** Type, abstract motion and scenes whose identity can be
  expressed adequately in text.
- **Existing assets:** Product appearance, recognizable people, actual software
  outputs or supplied footage. Use the minimum set covering the required identity
  or content.
- **Generated references:** A style frame, hero design or storyboard that
  resolves a specific ambiguity. Use the surface's own image tool at the highest
  quality tier it lists, and inspect the result. A storyboard is optional
  full-film reference material, not an instruction to create one video per frame.

Identify each asset's purpose: identity, style, motion reference, start frame or
end frame. A generic reference must not accidentally become a start frame that
fixes the film to one layout. Use a storyboard contact sheet only when supported
as a general reference and explicitly describe its panels as temporal guidance;
never supply it as the literal opening image.

Reuse acquired assets. Do not regenerate source screenshots to make them look
more polished. Only create assets the chosen request will actually use. Record
whether the model output is an illustration or preserves original source media;
do not promise pixel-exact screenshots from conditioning alone.

## Submit the complete request

Attach only the selected assets through the supported media mechanism, then bind
real media identifiers and roles. A local path is not a remote attachment, and a
job id is not automatically a media id. Preserve the exact reviewed creative
prompt; technical adaptation should not silently change its content. Include
the selected shot or film unit and its shared motion rules, with one requested
output by default. Keep editable overlay copy outside the plate prompt. Never send unresolved source attachment markers, draft paths or
placeholders as remote inputs.

For audio-enabled campaigns, include both the soundscape and music directions in
the full prompt and enable native audio where the `audio` flag is present. Music
and effects do not imply narration. If native audio is unavailable, explain the
needed audio route before changing the workflow. Respect explicit silence or
source-speech instructions.

Save a small record with the adapted prompt, deliberate changes, exact-copy list,
source and evidence URLs, actual input roles, model and settings, job id and
status, and the eventual result. A failed or uncertain submission is not a
completed film. Rejoin an existing job after an uncertain response instead of
submitting a duplicate.

## Inspect and revise

Inspect playback for the full sequence: shot order, transitions, camera
amplitudes, light and dark passages, pacing, identity, text, data and ending.
Compare with both the original reference and the product content map.
Representative stills alone cannot establish smooth temporal behavior.

Listen for music and effects synchronization, unintended speech, clipped audio
and a clean ending. Exact copy and benchmark values must survive the rendered
frames; prompt instructions are not proof. A source preview's polish is not a
guarantee of first-attempt output.

Continue authorized repairs of the failed unit or supported targeted video edit
while changed inputs or findings justify the next action. Retain earlier results
for comparison. Honor explicit human retry and budget limits, Stop, the real
cost gate and provider constraints; this method supplies no attempt allowance.
Reconcile accepted or uncertain jobs under their original receipts before any
new submission. Do not repeat an unchanged failure or repurchase identical
inputs: report that blocker and the needed change. Preserve successful units
and the requested production method; do not make segmentation the corrective
default.

Honor the chosen production method. In a hybrid film, native editable overlays
and finishing are required parts of delivery. In a flattened generation, a
composite is a disclosed fallback when generated exact copy or media fails. Use the surface's own media tools for finishing; no local
render substitutes for the requested generation. Verify the delivered duration,
dimensions, fps, audio, copy and final hold. A 15-second 30fps delivery has 450
frames, but frame count alone says nothing about visual fidelity.

Deliver the inspected film or the precise remaining limitation. Distinguish
prompt-ready, submitted, completed and reviewed states.

## Duration, aspect and retiming

Coerce the wanted length onto the model's ladder before writing the prompt. If
the coerced value differs from the plan, publish the retime map: which phases
are multiplied, which are re-authored, which holds keep their original length.
Scaling everything by one multiplier is honest only when the look says so;
otherwise actions keep their lengths and holds absorb the difference, never the
reverse. A ten-second render of a fifteen-second film is not the same timing.

For a vertical deliverable, rebuild type, paths and subject placement around the
tall frame with generous top and bottom margins. Do not solve it by cropping
into the subject, and do not bolt one text column onto every phase. Record the
aspect change as a departure.

## Reference roles

One role per asset, stated:

- **identity** -- this exact product, person or place.
- **style** -- material, light and palette only, never the subject.
- **content** -- what is inside the panel, the card or the diagram.
- **first frame** -- the literal opening composition.
- **last frame** -- the literal closing composition.
- **motion** -- the choreography or camera path to follow.

Zero references is a valid and often correct answer for type-only or abstract
work. A style reference must never quietly become a first frame.

## Series and loops

- Same style-key image on every clip of a series, and the STYLE paragraph
  byte-identical across every prompt in it. Paraphrasing between clips reads as
  drift.
- Chain on the ACTUAL rendered last frame of the previous clip.
- Prefer one model within a continuously matched series; classify different
  shot categories separately. Preserve look references and verify seams when
  different task-appropriate models are used.
- Loop means start frame equals end frame. A final hold is not a loop.

## Copy

Generated type is unreliable small and in lists. For every string that must be
right, either bind a rendered still as the last frame, or produce the type on a
page or Designer motion page and composite it -- and say which route was taken.
Every readable string lives in ON-SCREEN TEXT and nowhere else.

## Out of the prompt

Job ids, upload ids, model names, cost estimates, editing instructions, render
scripts, internal research. The creative prompt stands alone beside its declared
references; everything else lives in the production record.
