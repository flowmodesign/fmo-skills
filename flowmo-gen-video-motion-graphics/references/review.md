# Review the film against its brief

Use for production and substantive revisions. Keep the record with the rest of
the production record; it is a working check, not an extra user approval step.
Browsing and simple prompt review do not require creating files. Where
`review_film` is callable it samples frames and fills this table; where it is
not, fill it by watching the file.

## Before generation

For catalogue adaptation, read the selected guide's **Fidelity checks**, the
catalogue's **preserve** list and the actual prompt skeleton as source
baselines. For a supplied video, use the source-to-replacement map and
corresponding-moment comparison in [video-reference.md](video-reference.md).
State the viewer takeaway and the actions and transitions that deliver it.
Catalogue scene counts are not universal requirements; in close recreation, the
supplied clip's sequence and choreography are the baseline. Use this compact
table when helpful, without turning it into a mandatory scoring system.

| Requirement and expected time | Planned shot / asset / exact copy | Observed result and timestamp | Status / next action |
|---|---|---|---|
| Key actions and transitions retained or adapted for this brief | Where the resolved prompt specifies them | Fill only after inspection | Not inspected |
| Product identity and meaningful action/result | Real asset and its content role | Fill only after inspection | Not inspected |
| Exact wording, labels, values and geometry | Verified copy/data and reading hold | Fill only after inspection | Not inspected |
| Audio and ending | Requested speech/music/effects and final behavior | Fill only after inspection | Not inspected |

For example, the Glass UI source uses seven shots, a dark macro and pullback, two
inserts without main headlines, a meaningful product action/result and a fully
frozen ending. An adaptation can reshape that sequence while retaining its useful
visual techniques. These are observable events, not a generic instruction to make
polished glass panels. Use each preset's own checks instead of applying this
example to other styles.

Take the requirements off the takeaway sentence, the phase list, the copy list
and the recorded departures, and write the time each one is expected at. Leave
the observed column empty. Filling it before inspection is exactly how a review
becomes paperwork.

Resolve unknown product claims before submission. Record deliberate source
departures separately; do not silently downgrade a failed requirement by changing
the brief after generation.

### Extra rows this package adds

These rows are flowmo additions, not source material. The source's four-row
table has no equivalent for them, and each one catches a failure specific to a
model that paints every frame.

| Requirement and expected time | Planned shot / asset / exact copy | Observed result and timestamp | Status / next action |
|---|---|---|---|
| The takeaway arrives from the actions and their order | the takeaway sentence | what a first-time viewer would be able to say | Not inspected |
| Each phase happens, at its interval, with its own action | the timed phase lines | frame-sampled boundaries | Not inspected |
| Reading holds are actually still, and long enough | each phase's hold | frame difference across the hold | Not inspected |
| Anything already arrived stayed where it landed | the persistence lock in MOTION RULES | positions across later phases | Not inspected |
| Delivered duration, aspect and frame rate | the format line | the container metadata | Not inspected |

## Inspect the output

Watch the film through its ending, inspect both sides of transitions, check
readable holds frame by frame where necessary, and listen to its audio. Compare
requirements with the delivered file, not a tool's completion status. Use
**pass**, **fail**, or **not inspected**, with a timestamp or artifact reference.
If playback or audio inspection is unavailable, state that limit; stills alone do
not justify a motion or sound pass.

Judge communication and motion separately: does the takeaway land, and do the
transitions connect cleanly? A pretty but aimless sequence or a technically
correct yet sluggish explanation still needs revision. Do not mark a composite
correction as fixing the story if it interrupts the action.

Also verify duration, aspect ratio/dimensions and actual fps. Distinguish native
generation settings from any later export conversion. Save the exact submitted
prompt/settings, job ID, actual inputs and roles, departures, returned cost if
available, and the review alongside the rest of the production record. Label
estimated cost separately from actual charges; unknown is not zero.

## The three questions the film has to answer

**Communication:** Can a viewer follow the intended takeaway from the actual
actions and sequence? For an explanation, check that causes and results are
shown, not merely named. For a reveal or brand film, check that the intended
impression builds toward a meaningful ending. Readable text alone is
insufficient.

**Motion and source character:** Compare the actual film with the adapted brief
and the source techniques intentionally retained. Inspect both sides of
transitions: does the outgoing action lead clearly into the next composition,
with enough reading time and no unnecessary lingering? Source shot count/order is
binding only when retained in the brief or explicitly requested. Attractive
materials or a valid export do not establish clean motion.

**Product relevance:** Check the actual assets, actions, labels and evidence
against the shot map. Verify that panels contain meaningful product content,
charts encode the right data, and source-demo names/claims have been replaced.
Generic scenery under exact headline overlays still fails if the intended product
demonstration is absent.

Record each failed requirement, the affected shot and its remedy. Correct the
full prompt or use a supported targeted edit within the authorized retry scope;
do not automatically create replacement shot clips. If the available model or
source assets cannot achieve it, report the precise departure instead of
presenting the result as an equally faithful recreation. Finish technical checks
only after content and motion are assessed; finishing cannot restore an absent
camera move or missing product action.

## What each check looks at

- **Takeaway.** Watch once at speed and say the sentence back. If it comes out
  vaguer than the one that was written, the film is decoration.
- **Joins.** Look at the frame before and the frame after every boundary. A cut
  with nothing in the outgoing frame causing it reads as assembly. A match cut
  whose shape does not line up is worse than a plain cut.
- **Copy.** Read the strings off the frames and compare character by character.
  A leftover name from a previous version is the most common single failure.
- **Holds.** Compare consecutive frames across the hold. Near-zero difference
  passes. Motion inside a hold is a fail even when it is pretty.
- **Persistence.** Find an element that landed early and check its position in
  the last phase. Quiet repositioning is the failure this catches.
- **Ending.** A hold means the final frames are identical. An endcard means it
  finished assembling and then stopped. A conclusion means the opening question
  is answered. An un-plot means the film retracted to its opening state. A loop
  means the last frame equals the first, and a hold is not a loop.
- **Technical.** Read the delivered file, not the tool's success status, and keep
  the native generation settings separate from any later export conform.

## Choose the correction that addresses the failure

| Failure | Next action |
|---|---|
| Wrong motion, missing shot or broken transition | Revise the affected instruction within the complete-film prompt, or use a supported targeted video edit; preserve the intended full-film method. |
| Product/identity drift | Correct the semantic shot mapping or relevant identity reference, then use the supported revision route. Extra decorative images are not a remedy. |
| Incorrect text, chart or source screenshot | Check the exact copy/data; use supported replacement/compositing of verified graphics when available. If exact pixels are essential and the connected tools cannot preserve them, deliver a clearly incomplete film plus the required finishing handoff. |
| Wrong music, speech or synchronization | Adjust the supported audio controls or audio finishing route; preserve source speech when required. |
| Duration, crop or export mismatch | Use supported conforming/trimming when it preserves the story, reading holds and ending; otherwise revise the film. |

Generated reference images do not lock text, chart geometry or source pixels. For
fact-heavy films, decide before generation whether a verified graphic needs a
separate exact overlay. Use only actually available finishing tools and disclose
that adaptation. Do not claim a pixel-exact route exists merely because the
prompt mentions compositing.

### Extra failures this package routes

Flowmo additions. The source's table has no row for these, and they are the
failure modes of one flat generated file.

| Failure | Next action |
|---|---|
| The takeaway does not arrive | Re-order or replace phases so the actions carry it. Not a grade, not a music change, not more phases. |
| A seam or a position jump inside a series | Re-chain on the ACTUAL rendered last frame, and confirm the same model and the same style key ran on every clip. |
| A hold is not still | Shorten the action bleeding into it, or lengthen the phase. Do not slow the action. |
| Everything moves at once | One element or one group per phase. This is a re-author, not a retouch. |
| A capability the film needed turned out to be absent | Report the exact departure. Do not deliver it as though the look were intact. |

## Repair and actual limits

Continue authorized repairs of the failed production unit or supported targeted
edit while changed inputs or findings justify the next action. Retain earlier
results for comparison. Honor explicit human retry and budget limits, Stop, the
real cost gate and provider constraints; this method supplies no attempt
allowance. Reconcile accepted or uncertain jobs under their original receipts
before any new submission. Do not repeat an unchanged failure or repurchase
identical inputs: report that blocker and the needed change. Preserve successful
units and the requested production method; do not quietly split the film into
clips or make segmentation the corrective default.

Do the technical rows last. Conforming a file cannot restore a camera move that
never happened or an action that was never shown.
