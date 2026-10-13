# Game design and build process

Full detail behind the SKILL.md summary. Read this before planning a game build;
read it whole rather than by section on a first pass.

## Execution rules

- **Artifacts.** Planning is resolved in reasoning; the only written planning
  artifact is a short asset list (see Plan, build, deliver below) - f0 has no
  dedicated planning-record surface for this yet.
- **Each phase closes with its own check**, walked in reasoning at the
  transition. An unmet item blocks the move - there is no "fails, but moving
  on".
- **The game tolerates hostile input by design.** It must keep working, not
  just avoid crashing, under: spam input, a mid-action cancel, boundary
  violations, doing it "the wrong way", conflicting simultaneous inputs
  (opposite directions held, multi-key chords, two input methods at once,
  switching input method mid-action), and losing focus or disconnecting
  mid-action.
- **Diagnose from observed behavior** (state, logs, console) - never from
  impressions.
- **One meaningful change at a time** when tuning or hunting a failure -
  changing two things at once destroys the ability to attribute the result.
- **Numbers before code.** Any numeric criterion (a budget, a window, a limit)
  is fixed before building the thing it judges, and never softened in the
  same iteration that failed against it.
- **Code permission is bound to phases** - no game code until PLAN closes
  (its sections thought through, the asset list written, the experience
  formula derived). A one-paragraph "plan" followed by code is a failed run.

## Plan, build, deliver

Every game build runs the same three phases in order. Do not skip the plan phase
because the request looks small, and do not let phases interleave - no game logic
before the plan is thought through, no plan-writing once game logic exists.

**PLAN.** Think the profile (below), the four laws, and the concept through in
reasoning. The only thing worth writing down is a short asset list: every
visual/audio asset the build needs, what role it plays, and roughly what it looks
or sounds like. f0 has no dedicated planning-artifact record type for this yet -
keep the list in reasoning, or as a short note inside a DESIGN.md if you are
already authoring a file handoff under flowmo-authoring-contract. Treat it as a
proposed convention, not an existing f0 surface.

**BUILD.** Fire every asset-generation job in parallel, then author the game
while they run, wiring each asset in as it lands. In f0 terms: `generate_image_asset`,
`generate_video_asset`, `generate_audio_asset`, `generate_logo_asset`, and
`search_stock_media` (Designer) or `generate_image`, `generate_video`,
`generate_logo` (web assistant) are the parallel jobs; the game logic itself is
authored as an interactive element (`create_interactive_element` /
`attach_interactive_to_element`, per flowmo-interactive-design) while those
generations resolve. Anything the player reads or clicks - score, buttons, menu
items, dialogue text - is passed through the TSX host's `html` parameter as real
f0 elements, never inlined as JSX. That single rule is why a game built in f0
stays editable afterward instead of collapsing into one opaque black box.

**DELIVER.** Publish and hand over. Nothing gets built or rewritten at this
stage - it is a checkpoint, not a chance to patch gaps found late.

Report progress in one to three plain sentences after each phase closes. Never
expose the phase machinery itself (no "PLAN gate passed", no section numbers) to
the person you are building for.

## Game profile

Think through a point on every axis before writing the experience formula - the
profile decides the shape every later section takes:

| Axis | Spectrum |
| --- | --- |
| Time | real-time <-> turn-based <-> pause-at-will <-> no time |
| Space | continuous 2D/3D <-> discrete <-> abstract <-> absent |
| Agency | one hero <-> squad <-> disembodied hand |
| Conflict | vs system <-> vs players <-> vs self <-> none (then what holds attention instead?) |
| Content | authored <-> procedural <-> emergent <-> player-created |
| Outcome | win/lose <-> endless <-> player-set goals <-> none |
| Players | solo <-> co-op <-> versus <-> massive |
| Session | minutes <-> hours <-> "once a day" |
| Engagement source | execution <-> calculation <-> discovery <-> expression <-> story <-> social <-> accumulation - pick 1-2 primary; rewards and balance (below) feed them |

**Delivery context** (fixed here, never retrofitted): target platforms - default
desktop + mobile + gamepad; every verb performable by every declared input
method, no hover-only interactions when touch is declared; keyboard bound to
physical key codes, never typed letters; shipping languages - all
player-visible strings external from day one. Performance budgets (see The
performance law, below) target the weakest declared platform.

## The four laws

These are the non-negotiable checks a design decision is weighed against. Any of
them can override a convention; none of them can be skipped for convenience.

- **L1 - Experience first.** Design the experience the player has, not the
  artifact you are producing. Every later disagreement about a mechanic resolves
  against the experience formula (below), not against genre habit.
- **L2 - Meaningful interaction.** Every player action needs a visible effect
  right now (discernible) and a later echo somewhere else in the game
  (integrated). Test each mechanic by tracing action to effect to where it
  resurfaces; a mechanic with no resurfacing is dead weight.
- **L3 - Mastery.** What holds interest is pattern mastery: one new pattern at a
  time, introduced only after the previous one has been examined (see the
  teaching loop below). Design the sequence in which mastery is built, not the
  raw volume of content. Grind is either a deliberate, stated design choice or it
  is a hole in the design.
- **L4 - Undecided outcome on every horizon.** Every meaningful horizon - a
  single turn, a fight, a whole session - needs its outcome genuinely open. Pick
  two or three uncertainty sources that are actually tied to real mechanics
  (execution skill, randomness, hidden information, calculation depth, another
  player's mind, anticipation of what's coming). Randomness lands before a
  decision, never after it dresses one up as fair. When one source runs dry
  (the pattern is learned, the meta is solved), a replacement source must
  already be active, or the game has ended for that player right there.

## Experience formula and interest curve

The **experience formula** is one sentence, written before anything else in the
concept phase: "The player feels ___ because the game constantly ___." No genre
labels allowed in it. It is the compass every later decision is checked against -
if a mechanic does not serve this sentence, cut it or change the sentence
honestly.

The **interest curve** is how difficulty, novelty, and pacing are shaped across a
session so the experience never flattens: hook the player in the first moments,
alternate peaks (tension, challenge, spectacle) with breathers (recovery,
exploration, low-stakes moments), and put the highest peak near the end, not in
the middle. A session with a flat middle third is the most common failure of the
curve - check for it explicitly rather than assuming pacing "feels fine."

Two supporting pieces from the concept phase: the **four pillars** (mechanics,
story, aesthetics, technology - even an abstract game needs a tension arc for
its "story" pillar) should each reinforce the other three, and a pillar serving
none of them is ballast to cut. The **formal elements** (players, goals, actions,
rules, resources, conflict, boundaries, outcome) should each get an answer or a
stated reason for its absence - an unanswered one is usually a gap, not a
deliberate omission.

## Verbs

Few strong verbs beat many weak ones - strong means several object types
respond differently to the same verb. Plan each verb's development over the
course of the build: new objects and contexts should re-weight old verbs rather
than every new object needing its own new verb. Social verbs (persuade, trade,
ally, betray) earn the same rigor as combat verbs - a social system with one
weak "talk" button is exactly the thin-verb problem in a different genre.

## Feedback-loop signing

Every feedback loop in the system gets a sign, positive or negative, and the sign
has to be chosen on purpose:

- A **positive** loop snowballs - an early lead compounds and can decide the
  outcome long before the session ends. Positive loops need a ceiling or they
  make everything after the early game decorative.
- A **negative** loop dampens - it pulls outcomes back toward the middle, which
  is stabilizing but can make continued good play stop mattering if it is too
  strong.

A comeback from a deficit must stay possible, and skilled play must still win
more often than not - a system that satisfies one of those and not the other is
broken in a specific, checkable way, not just "unbalanced."

Signing a loop is also what makes L2's "discernible effect" true for anything
that compounds over time: the player needs to be able to see, on screen, whether
a given loop is currently running for them or against them. In f0 that means the
quantity the loop is built on - score, health, a resource meter, a combo count -
is an authored, visible element with its own animated feedback, not a value that
only changes in state. The `stat-count-up` entry in flowmo-motion-design's
recipe catalog is a ready-made way to make a compounding number read as
compounding, rather than just updating silently.

## Information map

Decide the visibility of every fact the game tracks on purpose, not by default.
A hidden fact that affects the outcome needs a discoverable trail somewhere in
the game - hidden with no trail at all reads as cheating, not as mystery. In a
multiplayer build, the information map also defines who sees what: the same
fact can be visible to one player and hidden from another, and that asymmetry
should be a deliberate design choice, not an accident of what happened to get
wired up first.

## The full walkthrough

Ten subsystems, each needing a decision or a justified absence. Walk through
all ten during planning, even for a small build - a fast "no, this doesn't
apply because ___" is a valid answer, silence is not:

1. **Representation** (camera / screen layout / text order): never hides
   information needed for the current decision; the player keeps control of
   it unless taking control away is deliberate.
2. **Input**: follow platform/genre conventions; axes are not inverted by
   default (inversion is a settings option); the most frequent actions sit on
   the cheapest gestures; conflicting simultaneous inputs resolve predictably
   (see the hostile-input tolerance rule above).
3. **Agency metrics** - the numbers all content is measured by (jump length,
   move range, options on screen): frozen before mass content production;
   changing them later invalidates everything already built on them.
4. **Resistance x verb matrix**: every source of resistance in the game is a
   question some player verb answers. An unanswerable row is frustration; one
   verb answering everything is boredom.
5. **Peaks**: each period ends in a combined exam of the patterns it taught,
   with escalation over the previous exam.
6. **Rewards** feed the declared engagement source (see Game profile above);
   the strongest reward is a new verb; big rewards sit on interest-curve
   peaks, not scattered evenly.
7. **Interface**: every element on screen serves a player decision -
   otherwise remove it, or hide it until it's needed.
8. **Economy**: every resource has sources AND sinks; a resource with only a
   source is inflation waiting to happen (see Balance below).
9. **Delivery of mechanics**: one new pattern at a time (L3), the next only
   after the previous one's exam (see the teaching loop below).
10. **Game entry**: a short, counted path from launch to the first meaningful
    action; on return, the first screen shows the current goal and next step;
    controls are learnable on demand at any moment; accessibility options are
    reachable before play starts.

## Code architecture

Game code starts only after PLAN closes (see Execution rules above) - never
from a blank slate mid-thought.

- **Architecture is minimizing the cost of change:** decouple what will
  change; don't abstract what won't.
- **Reach for a pattern by symptom, not by default:**
  - Behavior depends on frame rate -> fixed-timestep simulation, render
    separately.
  - Class explosion ("FlyingShootingMerchant") -> entity = components.
  - Need replay/undo/multi-source input -> input as command objects (also
    carries the player id for multiplayer).
  - Boolean-flag forest -> state machine.
  - Gameplay code pokes audio/UI directly -> events/subscription instead.
  - Object churn eats the frame budget, profiler-proven -> pools / spatial
    index / dirty flags - never pre-emptively, only once the profiler says so.
- **Instruments:** a dev overlay (fps, frame time, entity/draw counts) toggled
  by a query flag; readable state and logs; programmatic input feeding when
  the profile has more than one player (N parallel input streams).
- Keep game logic separate from rendering; design saves/serialization early if
  anything in the game persists.

## The performance law

Performance is a frame budget fixed **before** code is written, for the weakest
declared platform - not something addressed in an "optimization pass" after the
fact. Exceeding the budget is a crash-grade bug, not a nice-to-have fix later.
Rules that follow from that:

- Any group of same-type entities renders as one draw call, never one draw call
  per instance - batch or instance them; the exact technique depends on the
  renderer, the rule doesn't.
- Anything off-screen is neither drawn nor created.
- Zero allocations inside the frame loop itself.
- Diagnose slowness in a fixed order: draw calls first, then whether the
  bottleneck is GPU-bound, then CPU-bound, then look for spikes/GC pauses.
  Measure before any claim that something is "slow."
- Common anti-patterns to catch on sight: a mesh or material created per
  instance instead of shared, shadows/post-processing left on by default,
  full-scene scans repeated every frame, and rendering things that are not
  visible.

For an interactive TSX host authored via `create_interactive_element`, this
budget applies to whatever runs inside its `useEffect`/rAF loop - keep heavy
setup in the empty-deps effect (per flowmo-interactive-design), not re-created
every frame, and keep animated field reads live rather than in a dependency
array that reruns setup.

## Content

- **Build content from modules calibrated by the agency metrics** (see The
  full walkthrough, item 3) in three grades - tight / comfortable / trivial -
  so everything assembled is traversable by construction. Cross-check every
  demand the content makes against capabilities and economy: required gap vs
  jump length, required resources vs what's actually obtainable, time limits
  vs route time, win thresholds vs reachable totals. One mismatched number
  silently makes a condition unreachable, and no crash or test will say so -
  this has to be checked deliberately.
- **Rhythm** is the alternation of compression (few options, pressure) and
  expansion (overview, safety); monotony in either direction is a defect.
  Guidance comes from observable state - landmarks, salience, what characters
  mention; a HUD arrow is the last resort, not the first tool reached for.
  Show a distant goal early, deny it, deliver the path to it later.

## The teaching loop

Every new pattern is taught the same way, in order: introduce it somewhere safe
(no real cost to getting it wrong) -> test it with a mild price attached ->
combine it with a pattern the player already knows -> examine it under real
pressure (this exam is the same thing as a peak in the interest curve). Favor
intuition over instruction: build the situation that makes the player guess the
right move rather than reading it off a screen. Treat every block of tutorial
text as a sign that a scene failed to teach the thing itself. Once a rhythm of
introduce/test/combine/exam settles in for a while, break it once on purpose -
a deliberate break only reads as interesting against a rhythm the player has
actually settled into.

In f0, this maps to progressive disclosure authored through real content and
motion, not a tutorial-overlay hack bolted on top of the game:

- A new mechanic's "safe introduction" is a moment in the actual level/scene
  where it is the only thing the player can do, staged with `author_animation`
  (a `scroll-reveal` or `load` entrance that draws the eye to the one new
  element) rather than a modal that blocks the screen and has to be dismissed.
- A hint is a `hover` or `focus`-triggered micro-animation on the element itself
  (the thing pulses, glows, or nudges), not a floating tooltip layer stacked on
  top of the game.
- The "exam" moment is a real difficulty beat in the content, not a checkbox in
  a settings menu; wire its intensity into the interest curve directly.

## Response

Every action gets an immediate acknowledgment (a long operation gets an
instant receipt plus progress). Context gives the acknowledgment weight: every
significant action has both an immediate reaction and a later echo in the
world (L2 at the presentation layer). Polish parameters (shake, hit-pauses,
easing) are config data, tunable live, not hard-coded constants buried in
logic. Input is forgiving: generous tolerance windows so honest near-misses
still count - the player's own hitbox reads smaller than its sprite, while an
enemy's hitbox stays honest. Stable frame pacing matters more than a high
average frame rate.

## Balance

- **Options.** Priced options live on one cost curve - above it is dominant,
  below it is junk; any deviation from the curve should be deliberate, not
  accidental. Keep at least one non-transitive structure in the system
  (A beats B, B beats C, C beats A) so the game can't be "solved" into one
  correct choice. Asymmetric sides should carry equal expected strength with a
  genuinely different style, not a disguised power difference.
- **Perceived difficulty** is the gap between the player-power curve and the
  challenge curve - steer that gap deliberately; the next progression step
  should cost more than its reward returns (a soft slowdown, not a hard wall).
- **Economy.** Inflation - sources outrunning sinks - kills every price in the
  game; fix the sinks, not the prices, when that happens.
- **Randomness.** Tune expected value and variance separately. Streaks read as
  cheating even when the math is fair - soften them deliberately (pity
  counters, draw-from-a-deck instead of independent rolls) and re-count the
  real odds after softening. Design the extreme tails on purpose rather than
  letting them fall out of the base distribution unexamined.
- All balance numbers live in data, and are tuned one change at a time (see
  Execution rules above) - never two knobs moved in the same iteration.

## Player's head

- **Three limiters.** Perception is subjective, so critical signals use
  several channels at once and no two critical signals collide - including
  under colorblindness. Attention is a bottleneck, so nothing instructional
  appears under load and every message shows up at its actual moment of need.
  Memory decays, so the game remembers for the player: the current goal and
  next step stay visible at any return to the game.
- Every system state should be observable; every refusal explains why and how
  to lift it; what looks interactive is interactive, and vice versa; the cost
  of an error should be repeating the interesting part, not the boring part.
  Motivation needs all three of: visible growth, real choices, and a world
  that responds.
- **Accessibility and localization are data from day one:** remappable
  bindings (physical key codes plus gamepad buttons, one binding per declared
  input method for every command); options that actually apply (text scale,
  shake/flash toggles, contrast); all player-visible strings external, so
  switching language is a data change, not a code change.

## Narrative (when the profile has story)

The hero's goal is the player's goal - any divergence between them is a
deliberate, recorded device, not an accident of writing. Build the story on
state variables, not a scene-branching tree. Every significant choice fires an
observable consequence later (L2) - a choice with no consequence is decoration,
not narrative. Deliver information up this hierarchy when possible: the player
did it, beats the player saw it happen in the world, beats the player
overheard it, beats the player merely read it.

## Determinism

Game logic runs on a fixed timestep with a seeded random-number generator, and
the code that decides outcomes is kept separate from the code that renders them.
The payoff: the same inputs always produce the same game, and any reported bug
can be reproduced exactly from the input log that caused it - which is what
makes bisecting a cause actually tractable instead of guesswork.

What this implies for how state is authored in f0:

- Anything that decides an outcome the player can see and react to (hit/miss,
  spawn timing, loot roll, AI choice) should read from one seeded PRNG function
  kept in a ref, never a bare `Math.random()` call scattered through the
  component - a bare call is what makes a reported bug unreproducible.
- Keep the "what happened" logic and the "how it looks" logic in different
  functions/passes even inside one TSX host, so a screen-shake or particle
  flourish can change without touching what the simulation actually decided.
- `author_animation` timelines are already declarative and replay identically
  given the same trigger, which is a deterministic default worth keeping -
  the risk is concentrated in hand-written TSX simulation code, not in
  authored motion.
- An interactive element's isolation freezes its timers/effects when
  deselected and resumes on reselect (per flowmo-interactive-design). A
  fixed-timestep simulation should accumulate steps rather than trust a raw
  wall-clock delta across that freeze, or the freeze/resume itself becomes a
  source of nondeterminism.
- When debugging: reproduce the failure reliably first, form a hypothesis and
  then observe (never patch blind and see if it goes away), narrow the cause
  space by bisection, fix the actual cause, and leave something in place - a
  seeded regression case, an assertion - that keeps that class of bug from
  coming back quietly.

## Honest limits

Composition, animation feel, music, and genuine player delight need a human eye
and ear that no pipeline substitutes for. Say that plainly at delivery rather
than overclaiming craft the process cannot actually verify on its own.

**Freeze points:** agency metrics freeze before mass content production (see
The full walkthrough, item 3); features freeze once content is complete.
