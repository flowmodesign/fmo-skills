---
name: flowmo-game-design
version: 1
family: web
description: |
  Two-part package. Part 1 ports a game-creation system into f0 vocabulary:
  plan/build/deliver, the four laws, experience formula and interest curve,
  feedback-loop signing, the performance law, the teaching loop, determinism,
  and game audio scope/mix. Part 2 is a portable UX-craft layer for any
  surface, game or not: surface selection (page vs panel vs modal), touch
  targets, async/loading states, focus management, destructive-action
  confirmation, generated-media grids, motion timings. Use when: "build a
  game", "game mechanics", "game feel", "teach the player a mechanic", "game
  audio", and general craft like "loading state", "confirm before delete",
  "results grid layout", "modal vs page", "touch target size". NOT for:
  authoring the motion itself (use flowmo-motion-design), TSX/WebGL
  interactive-element mechanics (use flowmo-interactive-design), file
  handoffs for Import page (use flowmo-authoring-contract), or general
  visual polish with no interaction call (use flowmo-design-craft).
surfaces: [assistant-app, assistant-web, designer, mcp]
kinds: [page, dashboard]
presets: presets/audio-mix-targets.json
chain_with: [flowmo-design-craft, flowmo-interactive-design]
derived_from: https://github.com/higgsfield-ai/skills
---

# flowmo game design

This package has two independent halves. A game build uses both. A plain
dashboard or tool with no game in it only needs Part 2 - use it on its own.

## Part 1: game design and build craft

Read [references/game-design-process.md](references/game-design-process.md) in
full before planning any game build - it carries the complete phase structure,
the four laws, the teaching loop, and determinism in detail. This section is
the summary.

**Plan, build, deliver.** Plan by thinking the profile and the four laws through
in reasoning; the only thing worth writing down is a short asset list (role,
type, rough look/sound per item) - f0 has no dedicated planning-artifact surface
for this yet, so keep it in reasoning or a DESIGN.md note if you're already
authoring a file handoff. Build by firing every asset-generation job in parallel
(`generate_image_asset` / `generate_video_asset` / `generate_audio_asset` /
`generate_logo_asset` / `search_stock_media` in Designer, or `generate_image` /
`generate_video` / `generate_logo` on the web assistant) while authoring the
game itself as an interactive element (`create_interactive_element` /
`attach_interactive_to_element`) - wire assets in as they land. Anything the
player reads or clicks goes through the TSX host's `html` parameter as real f0
elements, never inline JSX, exactly like any other interactive element (per
flowmo-interactive-design). Deliver by publishing - it's a checkpoint, not a
chance to patch gaps found late.

**Game profile.** Before writing the experience formula, think through nine
axes (time, space, agency, conflict, content, outcome, players, session,
engagement source - full spectrums in the reference) - the profile decides
the shape everything after it takes. The build also tolerates hostile input
by design (spam, mid-action cancel, conflicting simultaneous inputs, focus
loss mid-action), fixes numeric criteria before code, and changes one thing
at a time when tuning.

**The four laws** (full text in the reference): **L1 Experience first** - every
dispute resolves against the one-sentence experience formula below. **L2
Meaningful interaction** - every action needs a visible effect now and an echo
later; an action with neither is dead weight. **L3 Mastery** - one new pattern
at a time, examined before the next; grind is a deliberate choice or a hole.
**L4 Undecided outcome** - every turn/fight/session stays genuinely open, on
two or three uncertainty sources tied to real mechanics, randomness landing
before the decision it affects.

**Experience formula and interest curve.** Write one sentence first: "The
player feels ___ because the game constantly ___" - no genre labels. Then shape
the session so difficulty/novelty/pacing hook early, alternate peaks and
breathers, and peak highest near the end - a flat middle is the most common
failure to check for explicitly.

**Feedback-loop signing.** Every loop gets a sign: positive snowballs (needs a
ceiling or the late session goes decorative), negative dampens (needs to stop
short of making good play pointless). A comeback from behind must stay
possible, and good play must still win more often. Sign the loop visibly, too -
the compounding quantity (score, meter, combo) is a real, animated f0 element,
not a value that only changes in state; `flowmo-motion-design`'s
`stat-count-up` recipe is a ready-made way to make a compounding number read
as compounding.

**Verbs, information map, and the full walkthrough.** Few strong verbs beat
many weak ones; decide the visibility of every fact on purpose (a hidden
fact affecting the outcome needs a discoverable trail). Ten subsystems get a
decision or a justified absence each build: representation, input, agency
metrics, resistance-x-verb matrix, peaks, rewards, interface, economy,
delivery of mechanics, game entry - full detail in the reference.

**The performance law.** A frame budget is fixed before code, for the weakest
declared platform - exceeding it is a crash-grade bug, not a later polish pass.
Same-type entities batch into one draw call, nothing off-screen is drawn or
created, zero allocations inside the frame loop, and slowness is diagnosed in
order (draw calls, then GPU-bound, then CPU-bound, then spikes/GC) - never
"optimize" from impression. See the reference for the full anti-pattern list.
This budget is exactly what governs a `create_interactive_element` host's
rAF/`useEffect` loop.

**The teaching loop.** Introduce a new pattern somewhere safe, test it with a
mild price, combine it with something known, then examine it under real
pressure (that exam is the same thing as an interest-curve peak). Treat every
block of tutorial text as a scene that failed to teach the thing itself. In f0,
that means progressive disclosure through real content and motion - a
`scroll-reveal`/`load` entrance staging the one new element, a `hover`/`focus`
micro-animation as the hint - never a tutorial-overlay layer stacked on top of
the game.

**Response, balance, player's head, narrative.** Every action gets an
immediate acknowledgment plus a later echo; input stays forgiving (the
player's own hitbox reads smaller than its sprite). Priced options live on
one cost curve, keep a non-transitive structure so the game can't be
"solved", and fix economy sinks rather than prices when inflation hits.
Perception/attention/memory are the three limiters on what the player can
take in at once; accessibility and localization are data from day one. When
the profile has story, the hero's goal is the player's goal and every real
choice fires a later, observable consequence. Full detail in the reference.

**Determinism.** Fixed timestep, seeded RNG, outcome-logic separated from
render logic - same inputs, same game, every reported bug reproduces from its
inputs. For hand-authored TSX game logic: read randomness from one seeded PRNG
kept in a ref, never a bare `Math.random()` call for anything the player can
react to; keep "what happened" and "how it looks" in separate passes;
`author_animation` timelines already replay deterministically, so the risk is
concentrated in hand-written simulation code, not authored motion. An
interactive element's isolation freezes its loop when deselected and resumes on
reselect - accumulate fixed steps rather than trust a raw wall-clock delta
across that freeze.

**Audio.** See [references/game-audio.md](references/game-audio.md) for full
scope and prompt discipline, and
[presets/audio-mix-targets.json](presets/audio-mix-targets.json) for the
numbers. Short version: at most two music loops, roughly five essential SFX
(primary verb, damage/feedback, pickup/reward, one environment cue, one
ambience layer), one locked voice per speaking entity. Mix voice around
-6 dBFS, SFX around -10 to -12 dBFS, music around -18 to -20 dBFS, final true
peak at or below -3 dBFS - voice above SFX above music, always. Start/resume
audio from a real user gesture, and keep the game playable muted.

## Part 2: portable UX craft (any surface, game or not)

Read [references/ux-craft.md](references/ux-craft.md) for the full detail.
This half applies to a plain dashboard exactly as much as to a game's UI -
skip Part 1 entirely if there's no game involved.

- **Surface selection.** Match the page shape to the task shape (generator
  console, feed/gallery, editor, board, settings, dashboard - the reference has
  the full table mapped to `ds-grid`/section/panel shapes). For a single
  decision, choose deliberately between a full page, an inline panel/drawer, or
  a blocking modal (native engine via `f0_invoke`) - a modal is for one focused
  decision only, never for browsing or a multi-step primary task.
- **Touch targets and general interaction.** ~40px minimum, per
  flowmo-design-craft's own affordance rule (a tighter ~44px floor for
  dense/touch-primary regions), targets kept ~8px apart. Every clickable
  element gets `cursor: pointer` plus a pressed state within ~100ms;
  `disabled` means the real attribute, not just faded opacity; drag needs a
  ~6px movement threshold before it counts as a drag rather than a click.
- **Async/loading states.** Disable the trigger while in flight, show a real
  loading surface past ~300ms (not a bare spinner), and always land on a
  visible success or a retryable error - never silence. Check
  `get_canvas_state` before scripting one so it targets what's actually there.
- **Focus management.** Visible focus ring everywhere, tab order matches visual
  order, `Esc` closes one overlay layer at a time, modals trap and restore
  focus, icon-only controls carry an accessible label, state is never
  color-only, a toast never steals focus and sits ~3-5s.
- **Overlay layering.** Popups escape their scrolling/clipping ancestor
  rather than rendering as an inline absolutely-positioned child; keep one
  semantic layer order instead of ad-hoc `z-index` patches; watch for
  accidental stacking contexts (`transform`/`filter`/`opacity`/`isolation`)
  on wrappers; nested overlays close innermost-first on `Esc`.
- **Forms and feedback.** Real visible labels, not placeholder-only; validate
  on blur/submit, never every keystroke; errors state cause and fix and
  focus the first invalid field; every submit ends in a visible outcome.
- **Layout and responsive.** Mobile-first with `min-height: 100dvh`, never
  bare `100vh`; constrain flexible text (`min-width: 0` + truncate,
  `minmax(0, 1fr)` grid columns); one primary CTA per screen; verify at
  ~375px, tablet, and desktop explicitly.
- **Destructive-action confirmation.** Spatially separate the destructive
  action, check `get_design_tokens` for an existing danger/error token before
  inventing a color, gate it behind the modal pattern above (or an undo
  affordance for reversible bulk actions).
- **Generated-media grids.** Lay results out with `ds-grid`, keep each item's
  real aspect ratio - one shared crop is for curated preset thumbnails only,
  never a live results/history grid. `ds-grid`'s fixed column-count variants
  aren't an auto-fit primitive yet; the reference flags a proposed additive
  grid class for the rare case a fixed count genuinely doesn't fit.
- **Motion timings.** Use flowmo-design-craft's existing bands (UI 150-300ms,
  entrances 400-800ms, ambient slow) - don't invent a second scale. One
  addition for real-time feedback surfaces: the raw "the system heard you"
  acknowledgment should read at or under ~100ms, distinct from the
  150-300ms polish tween that follows it. Exits run ~60-70% of their enter
  duration; animate `transform`/`opacity` only; stagger list entrances
  ~30-50ms per item; never block input while something is merely animating.
- **Data and charts (dashboards).** Trend -> line, comparison -> bar,
  proportion -> donut at 5 slices or fewer else bar. Loading = skeleton,
  empty = a designed state, failed = error with retry - never a bare axis
  frame.
