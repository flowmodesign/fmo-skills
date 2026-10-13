# Motion vocabulary for gen video

A flowmo addition. The skill this package derives from has no glossary, so
nothing here is source material: these are the words this package directs in,
defined as this package means them. A term used in the method, a phase line or a
review row is defined here; a term a brief introduces that is not here gets
defined in the brief rather than assumed. The same list is available as data in
`presets/glossary.json` (`{id, title, definition, family}`).

These are directing words, not model parameters. A model that ignores one is
telling you the phase needs a simpler instruction, not that the term is wrong.

## Easing

How a move accelerates. Stated once for the film in MOTION RULES, then only where a phase departs from it.

**Decelerate in** -- Fast on the first frames, dead stop on the last. The curve every arriving element takes, and the default this package assumes when a phase says nothing.

**Accelerate out** -- Slow to leave, quick to be gone. The curve for anything exiting, and it runs shorter than the entrance that put the element there.

**Symmetric ease** -- Slow at both ends. Right for a camera travelling between two resting positions, sluggish on anything that has to arrive.

**Constant speed** -- No acceleration anywhere. Correct for a turn, a continuous pass or a scroll; reads mechanical the moment it is used for an entrance.

**Attack** -- The opening frames of a move, where most of its speed sits. A soft attack is the single commonest reason a rendered move reads as machine-made.

**Settle** -- The tail of a move where speed dies and the element parks. Its length is most of the difference between motion that was directed and motion that defaulted.

**Overshoot** -- Passing the target and coming back once. Reserved for small playful elements; applied to a headline it cheapens the whole frame.

**Oscillation** -- Crossing the target repeatedly before resting. At most one in a film, and never on type.

**Step** -- A value that holds flat and then jumps. What makes a pause a beat with a measured length instead of a hole in the timeline.

**Ease character** -- The one sentence in MOTION RULES saying how everything in this film accelerates. Stated once, it stops each phase from inventing its own physics.

## Type

How words behave. The part of a motion graphic a video model is worst at, so every term here also carries when to stop generating and composite.

**Type as hero** -- Making the words the subject of the shot: very few of them, very large, with the composition built around them. The only arrangement in which generated type is dependably correct.

**Accent word** -- The one word in a line that carries the emphasis, marked by weight, color or its own move. Two accents in one line is no accent.

**Letter cascade** -- Characters resolving one after another rather than together. Keep the whole cascade under roughly half a second or the line stops reading as a line.

**Mask rise** -- Words or lines lifting out of their own clip box so they appear rather than fade. The move a title card actually makes.

**Marker swipe** -- A colored bar growing out from one edge behind a phrase, roughly a fifth of a second, origin on the leading edge. The cheapest emphasis that still looks designed.

**Outline then fill** -- Building a word as hollow letterforms and then flooding color through them in reading order. Reads as construction rather than as appearance.

**Blur resolve** -- Type arriving out of softness into crispness. Half a second is the entire budget; longer and a viewer reads it as a focus fault.

**Snap up** -- A short rise into place, decelerating to a stop with no rebound. The workhorse entrance for flat type and the safest thing to ask a video model for.

**Step reveal** -- Characters or blocks appearing on a fixed interval with no in-between motion. Suits monospaced and technical type, where smoothness looks wrong.

**Smear** -- The drawn streak that stands in for motion blur in flat work. It is drawn as shape, not applied as blur, and asking for blur instead gives mush.

**Squash and stretch** -- Deforming an element along its travel and recovering the shape on arrival. Gives weight to playful work and looks like a fault everywhere else.

**Type scale rule** -- The stated relationship between the largest and smallest readable thing in the film. Without one the model drifts a headline down toward caption size between phases.

**Copy list** -- The single inventory of every readable string in the film, phase by phase, spelled as it must appear. It is what catches a name left over from an earlier version, and it is what the review reads the frames against.

**Composited type** -- Type produced outside the video model and laid over a clean generated plate. The answer for anything small, listed or legally exact, and the route has to be named in the plan.

## Camera

Where the viewpoint is and whether it moves. One behaviour per phase, always.

**Locked frame** -- The camera does not move; elements move inside it. The default for type-led work and the only honest way to promise a stable composition.

**Push** -- Travel toward the subject along the lens axis. Reads as attention narrowing, so it belongs where the film is closing in on its point.

**Pull** -- Travel away from the subject along the lens axis. Reads as context arriving, so it belongs where the film is revealing where it was.

**Track** -- Travel sideways past the subject, the frame keeping pace. The move for a row, a queue or a tunnel of parts.

**Pan** -- Rotation across from a fixed position. Not the same as a track: the parallax is different and asking for one and describing the other confuses the render.

**Tilt** -- Rotation up or down from a fixed position. The move for revealing height or depth in a stack.

**Orbit** -- Circling a subject that stays centred. The clearest way to show an object is solid.

**Counter orbit** -- Reversing the direction of an orbit at a phase boundary. Marks an assembly turning into its result without needing a cut.

**Handheld drift** -- Small continuous unsteadiness added on purpose. Warms a live-action look and ruins a graphic one, so it is never a default.

**One move rule** -- One camera behaviour per phase. Two named moves in the same phase are averaged into a third that is neither, and the fix is a phase boundary between them.

**Persistence lock** -- The instruction that anything already arrived stays exactly where it landed for the rest of the film. Omit it and landed elements quietly reposition between seconds.

**Identity anchor** -- The reference image that makes the subject this specific product, person or building instead of a convincing generic one. Described identity always drifts; anchored identity holds.

## Cuts and joins

How one composition becomes the next, and the failures that live at those boundaries.

**Cut** -- An instant change of composition on a frame boundary. The default join in this package, because it is the one a video model executes cleanly.

**Match cut** -- A cut where a shape, a direction or a movement carries across the boundary. The cheapest way to make a set of phases read as one film.

**Motivated cut** -- A cut caused by something visible in the outgoing frame: a part leaving, a hand closing, a panel filling. An unmotivated cut is where a film starts feeling assembled.

**Seam** -- The join you did not want: a jump in position, grain or color where two pieces were meant to read as continuous. Position matching alone does not remove one.

**Dissolve** -- Two compositions overlapping in opacity through a join. Off by default here, because it is what a film does when nobody chose a transition.

**Continuous take** -- A film with no cuts at all, phases flowing through one another. Powerful and expensive: one bad second cannot be replaced without regenerating everything.

**Whip** -- A very fast camera move used as a join, the blur hiding the change of composition. One per film at most; it is a trick and it wears out immediately.

**Position jump** -- A subject moving between two frames that were supposed to be adjacent. The specific failure caused by chaining on a re-render instead of on the real last frame.

## Structure and timing

The shape of the film: what a phase is, how long things hold, and how a film ends.

**Takeaway** -- One sentence naming the thing a viewer should be able to say back once the film has ended. Written before any phase exists, because a film assembled from attractive phases with no takeaway has no repair left at the finishing stage.

**Mechanic** -- The one logic a film runs on: type accumulating, parts separating, paper rearranging, panels resolving. A film that changes its mechanic halfway is two films.

**Phase** -- A named span with its own action, its own camera and its own length, contiguous with its neighbours. Editorial unit, never a separate generation job.

**Stagger** -- One move applied to several elements offset in time. Asked for once on the group, never written out per element.

**Stagger spread** -- The total span of a stagger across all elements, whatever their number, as opposed to a fixed gap between neighbours. The right control when the count is not fixed, because with a fixed gap a nine-item row takes three times a three-item one and the phase length stops meaning anything.

**Overlap** -- Starting a phase before the previous one has finished settling. Phases laid strictly end to end read as a queue rather than a film.

**Snap** -- A move short enough to have no settle, for something that clicks into position. The right shape for a mark landing and the wrong shape for a subject arriving.

**Hold** -- A run of identical frames with a chosen length. It is a design decision, not the absence of motion, and it is not a fade.

**Reading hold** -- A hold sized by the copy that has to be read inside it at delivery size, not by what is left in the timeline. If the copy does not fit, the copy is cut. Any motion inside it makes it a failed hold.

**Final hold** -- The repeated frame a film ends on. A sound tail may decay across it, which resolves the film without lengthening it.

**Endcard** -- A built closing composition, typically a mark plus one line, which finishes assembling before the film ends and then stops. An endcard still moving at the last frame has failed.

**Loop** -- A film whose last frame equals its first, so the wrap is invisible. A final hold is not a loop, and a one-shot action forced back to its opening pose rubber-bands.

**Un-plot** -- Ending by retracting the film to the empty state it opened on, in reverse of how it was built. Reads as authored precisely because the order is preserved.

**Conclusion ending** -- Ending on the answer to the question the film opened with, with at most one small thing still alive. The ending kind for explainers.

**Source continuity ending** -- Ending on the footage carrying on with its own action after the graphics have cleared. The ending kind for anything laid over real material.

**Retime map** -- The explicit statement of how a film authored at one length becomes another: which phases are multiplied, which are re-authored, which holds keep their length. A film without one has been stretched, not retimed.

**Duration ladder** -- The discrete lengths a given model actually accepts. A wanted length off the ladder is coerced to the nearest rung, and the film has to be told.

**Frame-exact boundary** -- A phase boundary that lands on a whole frame. At thirty frames a second every tenth of a second qualifies and a quarter of a second does not.

**One film, one request** -- All phases and all shared rules go in a single generation. A provider error is not evidence that the length or the phase count is unsupported, and splitting needs a verified cause and cuts only on real boundaries.

**Style key** -- The one reference image, plus the byte-identical style paragraph, carried on every clip of a series. Attaching it only to the first clip is how a series drifts apart.

**Departure** -- A deliberate deviation from the chosen look, written down with its reason. An unrecorded departure cannot be told apart from a failure.

## Audio

Four independent decisions: effects, score, any speech already in the material, and any speech newly written.

**Soundscape** -- The effects layer, each sound named together with the visible event that produces it. Effects with no visible cause are what make a film feel dubbed.

**Score** -- The instrumental bed: character, tempo, where it lifts, how it stops. Default for launch and motion work, alongside effects and without narration.

**Sync point** -- A frame where a sound and a visible event must coincide. Name the frames that matter rather than asking for everything to be in time.

**Sound tail** -- Audio decaying across a still final frame. It finishes the film without adding length to it.

**Narration** -- Spoken words written for the film. Always a separate explicit decision, never a default, and no voice is ever cloned.

**Explicit silence** -- A stated decision that the film has no audio at all. It beats every default in this package.

## Where the rest lives

The ten ready-made looks and their own preserve vocabulary are in
`flowmo-film-presets`. Sentence-level prompt anatomy, image-to-video phrasing
and the negative-phrasing switch are in `flowmo-video-prompt-craft`. Page
animation vocabulary -- triggers, selectors, scroll-scrub, beats -- belongs to
`flowmo-motion-design` and the Designer motion skills, and none of it applies
to a model that paints frames.
