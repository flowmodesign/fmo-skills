# Prompt format and supporting brief

What to write down before a prompt exists, and the shape the prompt then takes.
The phase line format and the filled skeleton live in `renditions/gen-video.md`;
this file is the thinking that fills them.

For a selected preset, read its prompt in full. There is no archived prompt file
in this package: the original prompt is the parameterised
`renditions["gen-video"].prompt_skeleton` in the catalogue, and the adaptation
guide that sits beside it in `flowmo-film-presets` is its mapping aid. Start
with its useful format and detailed craft instructions. Establish the viewer
takeaway and a short purposeful sequence, then adapt story-dependent sections
and timings. Keep specific choreography in the final prompt; do not retain a
scene merely to match source section order. No fixed beat count or story
formula is required.

Keep production metadata outside the creative prompt: chosen model and native
settings, reference assets and roles, evidence links, exact-copy inventory,
departures and review/submission status. The full prompt must stand alone when
accompanied by its declared references. Do not add local render scripts or
mandatory compositing directions to a generative prompt.

## 1. The takeaway sentence

One sentence naming the thing a viewer should be able to say back once the film
has ended. Written first, before phases, before a look, before any asset. Everything
downstream is checked against it, and a film with no takeaway has no repair left
at the finishing stage.

Write it as a viewer would say it, not as marketing would. "This tool turns a
week of work into an afternoon" is a takeaway. "Category-leading efficiency" is
not a sentence a viewer says.

## 2. What stays and what changes

Use the source's visual character and effective motion as the foundation. Its
sequence, scene count and durations describe how that source tells its story;
keep them where they fit and rebuild them where this subject needs different
actions or emphasis. Preserve useful specificity in scale changes, camera
behavior, materials, transition causes and typography. Close recreation is
appropriate when explicitly requested; otherwise the communication goal governs
the sequence. Do not flatten the source into generic house styling.

Replace the product, story, copy, asset content and factual claims with the
user's subject. Brand colors can replace hue roles while retaining useful
contrast. Recompose for an explicit aspect ratio, retime for an explicit
duration, and preserve the user's audio choice. For new launch/motion campaigns,
use music and synchronized effects by default, without narration. Replacing
source silence is a recorded adaptation; explicit project silence still wins.

The catalogue records each look's provenance: the source URL, its section and the
model label observed at capture. This package archives no prompt file and no
hash, so the parameterised skeleton is the production starting text and its guide
is a mapping aid, not replacement source wording. Build from a copy of the
skeleton, retaining useful wording and detail while rewriting story-dependent
sections. Keep its format where it helps; section order is not a constraint on a
clearer story. Archive any genuine source discrepancy and record your
correction. Matching a prompt does not guarantee identical output.

## 3. Map content before designing its container

For a real launch, inspect the product's authoritative page and supplied media.
Verify the name, release context, capabilities, examples and any numbers used.
Collect usable source assets: actual outputs, screenshots, product images,
demonstration frames, diagrams or accurate component views. A URL is a lead to
inspect, not an asset already obtained.

State the viewer takeaway and a short sequence first. For content that needs
evidence or asset tracking, this compact mapping can help; do not require a
separate table for a simple brief:

| Template shot/phase | Product meaning or claim | Evidence | Visual asset or action | Asset state | Copy | Preserved mechanics / departure |
|---|---|---|---|---|---|---|
| ID and interval from template | What viewers learn | Source URL + section, supplied fact, or creative premise | The specific input, action or output shown | acquired / to create / missing essential | Exact strings or none | Camera, transition and contrast retained; justified changes |

Every product shot needs a defensible relationship to its content. A generic
chip, house, waveform, code screen or glass panel is not evidence of a capability
simply because the headline names one. A generated depiction may illustrate a
supported idea, but label it as an illustration in the asset record and do not
present it as a genuine screenshot or test result. Reuse one real workflow across
multiple shots when that makes the causal sequence clearer than unrelated
feature cards.

For a benchmark, capture the benchmark name/version, compared systems, values,
units and relevant conditions. In 15 seconds, show a small number of claims with
adequate reading time. Use brief on-screen qualifications when necessary and
preserve fuller sources alongside the deliverable. Set numeric chart geometry
deterministically when feasible. If three equal-looking decorative bars would
imply false data, use honest data or non-quantitative result components.

Use this meaning test before assets and again during review: **with the headline
hidden, what in the shot connects it to this particular product or claim?** If
the answer is only the color or logo, strengthen the mapped action or asset. Some
macro/style inserts need no new claim, but they must remain a recognizable detail
of the adjacent product action.

The exact-copy column is the source of the copy list. Units and qualifiers travel
with their numbers.

## 4. The look

Either a preset, picked by outcome, which brings its own phases and its own
preserve list -- or, where no catalogue is reachable, three concrete sentences:

- **Ground and palette by role.** Ground, ink, one or two accents, key light
  direction, and what materials do with that light. Roles, not a swatch list.
  Brand colors REPLACE roles; they do not get appended to them, and the
  contrast relationships survive the hue change.
- **Typography.** The character of the face and the scale rule, per
  `type-motion.md`.
- **The mechanic.** The one logic the film runs on. If it changes halfway, it is
  two films.

## 5. The prompt structure

For an original concept without a source template, a useful prompt structure is:

```text
[Duration, aspect ratio, film type, subject and one-sentence story]

design world:
[Concrete objects, palette roles, material/light behavior and typography]

motion rules:
[Camera travel, continuity, easing, geometry, blur and text behavior]

[Contiguous timed shots or phases, with the action, camera, transition, exact copy and reading hold]

overall_soundscape:
[Specific effects tied to visible actions; state whether speech exists]

non_diegetic_music:
[Instrumental character, tempo, progression and ending; or explicit silence]

[Reference roles only if references are actually planned]
```

`overall_soundscape:` and `non_diegetic_music:` are the original's own naming and
are what a hand-written prompt should use. A compiled `prompt_skeleton` in the
catalogue instead uses the section headings `SOUNDSCAPE`, `MUSIC`,
`ON-SCREEN TEXT` and `REFERENCES`, because the audio capability gate removes the
first two by name when the selected model has no `audio` flag.

Use music and synchronized effects by default for new launch/motion films; new
narration requires a separate choice. Preserve explicit project silence. Audio
and all visual events must fit inside the requested duration. A static final
frame can have a short sound decay without extending the film.

## 6. Timing and readability

Set timings from the new actions, transitions and reading needs. Keep source
timings where they serve this sequence; do not stretch scenes just to fill the
duration. Label retiming or changed structure briefly. Every interval must fit
the film, without missing time or conflicting overlaps. Shots/phases are
editorial units inside one generation request.

Contiguous intervals: no gaps, no overlaps, the last ending exactly at the
duration, boundaries on tenths of a second so they are whole frames at 30fps.
Defaults are 15 seconds, 16:9 and a 30fps delivery target unless user or source
continuity calls for otherwise, and native generation fps may differ. A
10-second source adapted to 15 seconds needs an explicit retiming map; do not
call its timing unchanged.

Each phase either reveals something or develops the impression, and its motion
carries into the next. There is no phase count to hit; a preset's count is that
look's answer, not a quota.

Use a compact exact-copy inventory to catch spelling, punctuation and
original-brand leftovers. Keep values and qualifications readable at delivery
size. Start by asking the model for the intended typography; only plan
deterministic finishing when required by the task or a demonstrated failure, and
disclose that change.

## 7. Audio, as four decisions

The effects layer, the score, any speech already present in supplied material,
and any narration newly written are four independent choices. The default for
launch and motion work is instrumental score plus effects tied to visible
events, with nobody speaking. Explicit silence beats the default. Narration is
its own decision and no voice is ever cloned.

Every audio event fits inside the duration. A still final frame may carry a
short decay, which resolves the film without lengthening it.

## 8. References and vertical work

Choose references for a concrete purpose; zero is a valid choice. Identity
references, style references and start/end frames are distinct. Research is
needed for factual claims even when no visual references are attached.

One role per asset, stated: identity, style, content, first frame, last frame,
motion. A style reference is not a first frame. A contact sheet or a storyboard
grid is never a literal opening image.

For vertical delivery, recompose type, motion paths and subjects around
1080x1920, with conservative top/bottom margins. Do not crop the hero or add a
fixed text column to every source shot. Record the aspect-ratio departure,
retaining the original motion logic where practical.

## 9. Compile the brief

1. Read the selected skeleton, its adaptation guide and its known source
   differences. Use existing campaign context to resolve fields; ask only for
   missing essentials.
2. Bind the shot map, product identity, palette roles, exact copy and audio.
   Resolve every placeholder, including macro contents and embedded UI labels.
   Select real assets before generating decorative containers.
3. Write a concrete timeline for the new sequence, retaining useful source
   action/camera/transition detail. Give each beat time for its action and
   understanding, then move on; do not fill duration by proportionally
   stretching holds. Explain meaningful structural changes briefly. When
   retaining the same sequence at a different duration, record the retiming.
   Remove obsolete source timestamps and keep actions and reading holds
   feasible.
4. Define each asset's role. A material/style frame establishes appearance; it
   is not automatically the start frame of all shots. Different shots need
   different compositions in the prompt, but not necessarily different reference
   images. Start prompt-only or reuse a minimal set of identity references; add a
   storyboard only for a concrete need and when supported. Keep a canonical
   identity across those compositions.
5. Save the short sequence or shot map and a small list of deliberate
   departures. This is an internal completeness check, not a new user approval
   gate.

Keep the full resolved prompt available. Submit all shot instructions and shared
rules in one complete-film request by default. Segmentation requires a verified
constraint and an explained, accepted change to the method. Do not summarize away
the distinctive instructions to fit a model's prompt limit. Select a capable
route first. Only an accepted segmentation fallback may divide at actual
editorial cuts. Do not split a continuous reference move without identifying the
departure.

## 10. The production record, kept separate

Model choice and its capability readings, the coerced duration and the retime
map, reference assets and their roles, the copy list, the recorded departures,
job ids and costs, and the review. None of it goes in the creative prompt, which
has to stand alone beside its declared references.

## 11. Departures

Record a meaningful departure with its reason: user request, source ambiguity, a
factual correction, a poor semantic fit, or a verified model limitation. Do not
silently drop a signature shot because one attractive starting image is easier to
animate. A change that removes the defining mechanic should be called a custom
adaptation, with the difference identified. An unrecorded departure cannot be
told from a failure.
