# Type in motion, when a model draws the frames

Type is where generated motion graphics fail most often and most visibly. This
file is the rule set and the decision about when to stop asking the model for
words at all. The source skill has no type-motion document; this file is a
flowmo addition that gathers the source's own copy rules and adds what a model
that paints every frame does to lettering.

## The two honest positions

**Type as hero.** Few words, very large, the composition built around them, one
line or two at a time. At this size a video model gets letterforms right, and
the shot is about the words rather than decorated by them. Announcements,
statements, offers, quotes and stings all belong here.

**Type composited later.** The model renders a clean plate with room reserved
for words, and the words arrive afterwards on a page or a Designer motion page
and are laid over it. Everything small, listed, numeric or legally exact belongs
here: pricing tables, feature lists, axis labels, legends, disclaimers, long
names, anything with a unit attached.

There is no third position. Asking a video model for a paragraph, a table or a
chart with correct labels produces text that is nearly right, differently nearly
right on every run, and impossible to correct without regenerating the film.

Start by asking the model for the intended typography; only plan deterministic
finishing when required by the task or a demonstrated failure, and disclose that
change. An exact typography or source-media composite is a disclosed fallback
when generated content fails, not a mandatory production pipeline.

## Word budget

Copy must be concise enough for its actual reading hold, and values and
qualifications must stay readable at delivery size.

- One idea per phase, and one accent word inside it.
- A short line lands in roughly half a second of reading hold. A two-line
  statement needs about a second. A three-line list does not belong in a
  generated frame at all.
- If a phase needs more words than its hold can carry, the copy is cut. The hold
  is not lengthened, because the phase after it was timed against the original.
- Never two accent words in one line. Two accents read as none.

## Entrance by the character of the typeface

Match the move to what the letterforms already say. A mismatch is why a
well-rendered title can still look wrong.

| Typeface character | Entrance that fits | Why |
|---|---|---|
| Heavy grotesque, tight tracking | Snap up, or a mask rise per line | It already reads as impact; a slow arrival argues with the weight. |
| Light or high-contrast serif | Slow settle, long tail, small travel | The thin strokes need time to be seen; a snap makes them flicker. |
| Monospaced or technical | Step reveal on a fixed interval | Smooth motion looks wrong on a face designed on a grid. |
| Rounded or geometric sans | Scale in from just under full size, with a short overshoot | The forms tolerate play; keep the overshoot to one pass. |
| Script or handwritten | Plot on along the stroke, in writing order | Anything else contradicts how the letters were made. |
| Condensed display | Clip wipe from one edge | The tall narrow forms read best as revealed rather than moved. |

Use the selected example's palette roles, scale contrasts, layer behavior and
typography as the visual foundation, and use a single clear visual mechanic. One
type system for the whole film: a second typeface arriving in phase four is read
as a different film, not as variety.

## Placement rules

- Never across a face. Not over the eyes, not over the mouth, not partly.
- Never over a subject that will pass under the words later in the phase. Check
  the whole phase, not the frame where the words land.
- Keep readable strings well clear of the frame edges, and further clear on a
  vertical deliverable, where players and captions eat the top and bottom.
- One block of copy on screen at a time. Two blocks make the viewer choose and
  they read neither.
- Type over a moving plate needs a ground: a solid, a scrim or its own panel.
  Relying on contrast that happens to exist in the plate fails the moment the
  plate changes.

## Motion the model will actually draw

Reliable: snap up, mask rise per line, clip wipe from an edge, letter cascade
under half a second, marker swipe behind a phrase, outline then fill, step
reveal, scale in from just under full size.

Unreliable, so do not spend a render on them: per-character rotation on a long
line, type on a curved path, letters colliding with physics, text wrapping onto
a moving surface, a word morphing into another word. Composite these instead.

Motion blur on type is a fault, not an effect. In flat work, ask for a drawn
smear; in dimensional work, ask for the move to be slower.

## The copy list

Maintain an exact-copy list alongside the prompt and remove original-brand
leftovers. Keep one compact inventory of every readable string in the film,
phase by phase, spelled exactly as it must appear, with its units and its
qualifiers attached, which also catches spelling and punctuation. Keep benchmark
labels, values, units and conditions together. It does three jobs: it catches a name left over from an earlier version, it is what the
review diffs the frames against, and it is the list you hand the compositor when
a string turns out to need the composited route after all.

Every readable string goes in the prompt's ON-SCREEN TEXT section and nowhere
else. A string mentioned inside a phase line as well as in that section is a
string that will be rendered twice.

## Deciding the route before you generate

Ask, per string: does it have to be exact? A brand name, a price, a date, a
figure, a unit, a legal line and a person's name all answer yes.

- Yes, and it is the film's payoff: render the closing composition as a still,
  bind it as the last frame, and let the model resolve onto it.
- Yes, and it is somewhere in the middle: reserve space in the plate and
  composite it.
- No: let the model draw it, and put it on the copy list anyway so the review
  can still check it.

Say which route each exact string took. A film delivered without that statement
looks finished and is not.

Exact copy and benchmark values must survive the rendered frames; prompt
instructions are not proof. Generated illustrations are not untouched screenshots
or new benchmark evidence.
