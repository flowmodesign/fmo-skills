# Rendition: designer-motion

For Designer pages of kind `page`, `deck`, `motion`, `ad` and `video`. The rules above are written for the live web editor's
`author_animation`. Designer has no `author_animation`, `read_animations`,
`update_animation` or `list_motion_recipes`: its motion is a MotionSpec written
with `set_motion`, and its triggers are an InteractionSpec written with
`set_interactions`. The spec compiles to GSAP at load, so the GSAP thinking above
carries over one to one; the GSAP syntax does not. Never write a `<script>`,
`@keyframes` or `gsap.*` call into the page: authored GSAP does not round-trip
through this editor.

## Translate each rule

| Web editor (above) | Designer |
|---|---|
| one `author_animation` call | one beat in `set_motion` (`name`, `duration_ms`, `preset`); `preset: "hold"` when the motion is written out in `tweens` |
| entry `{ method, target, vars, position }` | a `tweens[]` item: `target_id` (+ `child_selector`), `from_json`, `to_json`, `duration_ms`, `ease`, `at_ms` |
| `from` / `to` / `fromTo` / `set` | always declare both ends, `from_json` and `to_json`, so every frame is reproducible |
| `.class` selectors | `target_ids` / `target_id` are `data-dsn-id`s; `child_selector` reaches many children from one tween. The class-never-id rule is the web editor's; here the dsn id is the stable handle. |
| seconds | milliseconds (`duration_ms`, `at_ms`, `offset_ms`) |
| `vars.stagger` (`each` / `amount` / `from`) | `stagger_each_ms`, `stagger_amount_ms` (prefer it for a list whose length you do not control), `stagger_from` |
| `vars.splitText` + `splitMask` | `split: "chars" / "words" / "lines"` + `clip: true`, with `from_json` `{"yPercent":110}` |
| `position` (`"+=0.2"`, `"<"`) | `at_ms` inside the beat; a negative `offset_ms` (-150 to -300) overlaps a beat with the one before it |
| `read_animations` then `update_animation` | resend the beat with its existing `id`: `set_motion` merges by id. `mode: "replace"` only after reading the whole spec. |
| `list_motion_recipes` | not a Designer tool. The recipe names above are shapes to write as tweens, e.g. `line-mask-reveal` = `split: "lines"`, `clip: true`, from `yPercent` 110. |

## Triggers

| Web trigger | Designer |
|---|---|
| `load` | a `set_interactions` rule `on: "load"`, `action_kind: "play-beat"` |
| `scroll-reveal` | `on: "inview"`, `play-beat`; one reveal rule per section, in beat order |
| `scroll-scrub`, `scrollTrigger { scrub, pin }` | the beat's own `scroll` field (`zone`, `start`, `end`, `pin`, `pin_distance`, `smooth_seconds`, `once`); it needs no rule. Scrubbed parallax = a scroll beat with an `ease: "none"` tween. |
| `click`, `hover` | `on: "click" / "hover" / "press" / "enter" / "leave" / "keydown"` with `play-beat` (replays that beat) or `set-variant` |
| `mouse-position`, `follow-mouse`, `mouse-rotate` | `on: "pointermove"` with `parallax`, `magnetic`, `tilt` or `cursor-var` |
| `focus`, `scroll-inertia`, `swipe`, `drag`, `resize`, `page-unload`, `form-submit` | no Designer equivalent; say so instead of faking it with a script |

## By page kind

- `page`: everything above, including `scroll` beats and pinned
  stages. The baseline in "Scale motion to the brief" holds: a split reveal on
  the headline, parallax on the background, staggered entrances for cards.
- `deck`, `motion`, `ad`, `video`: rendered by seeking a clock, so a `scroll`
  beat is refused. Motion is beats on the timeline; in a deck, `stops` names the
  beat ids that pause (the slides). Keep `repeat` finite and use the `alive`
  preset for an idle.
- The component conventions (`.f0-carousel`, `.f0-tabs`, `.f0-accordion`) and
  the Import-page contract belong to the web editor and do not apply here.
- The FOUC rule holds: never write the start state (`opacity: 0`) into the
  stylesheet; `from_json` owns it.
