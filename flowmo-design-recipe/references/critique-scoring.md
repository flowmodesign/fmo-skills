# critique scoring: a scored UX review

The review rubric is a mechanical gate (grep, inspect, pass/fail). This file is
the judgment pass that sits next to it: a scored usability critique of a page
or flow built in f0, with severity-tagged issues, persona walk-throughs, a
cognitive-load check and a verdict on whether the design belongs to this
brand at all. Use it when asked to "review", "critique", "score" or "audit"
a page, and before presenting any redesign.

## Order of operations: eyes first, tools second

1. **Look before you read tool output.** Take an `f0_screenshot` (desktop
   and a phone width) or do a visual read of the canvas, and write down the
   design-specificity verdict, the heuristic scores and the top issues
   FIRST.
2. **Only then** read `validate_canvas`, lint, contrast or any other
   automated output. Tool findings are precise but narrow; seen first, they
   anchor the review onto what the tool happens to measure and the larger
   problems (wrong hierarchy, generic composition, a confusing flow) go
   unnamed.
3. **Reconcile.** Merge the two: note where the tool confirms an eye
   finding, where it caught something the eye missed, and where it is a
   false positive. Never just append the tool list to the critique.

## Design specificity verdict (start here)

One question: could this page be re-skinned for an unrelated brand by
swapping the logo, the copy and the accent token, with the layout, imagery
treatment, motion and type left unchanged? If yes, the page is
category-interchangeable and that is the headline finding, whatever the
scores below say. Name what is generic (the composition, the card grid, the
hero pattern, the palette family) and name one move that would tie it to
this product's own world (its material, its audience's scene, its actual
artifact). A page can score well on usability and still fail here.

## Ten heuristics, scored 0-4

Score each heuristic on this scale:

| Score | Meaning |
|---|---|
| 0 | Absent or actively broken; the user is lost on this axis |
| 1 | Present in a few places, missing in most |
| 2 | Main paths covered, clear gaps elsewhere |
| 3 | Solid, with small gaps |
| 4 | Genuinely excellent; nothing to add (rare, earn it) |

The ten heuristics and what to look at on an f0 page:

1. **System status is visible.** Hover, focus and pressed states on every
   control; loading and progress feedback; the current page marked in the
   nav; inline form validation; a confirmation after submit.
2. **Speaks the user's language.** Plain words over internal jargon, the
   order of information matches how the audience thinks, icons and
   metaphors they already know.
3. **User control and freedom.** A way back or out of every state: close
   on a dialog, Escape on an overlay, cancel on a multi-step flow, clear on
   a filter, a pause on anything that moves on its own.
4. **Consistency and standards.** One label per intent, one button system,
   one radius family, the same interaction behaving the same way on every
   section; web conventions (logo goes home, underlined text is a link)
   respected.
5. **Error prevention.** Constrained inputs where possible (select, date,
   input types), sensible defaults, a confirm step before anything
   destructive, nothing that throws away typed work.
6. **Recognition over recall.** Options visible rather than hidden, labels
   on icons, context carried forward so the user never has to remember a
   value from an earlier screen.
7. **Flexibility and efficiency.** Keyboard paths, shortcuts, bulk actions,
   saved state for repeat visitors; accelerators that stay out of a
   first-timer's way.
8. **Aesthetic and minimalist design.** Every element earns its place, one
   clear focal point per view, decoration never competes with content.
9. **Error recovery.** Messages in plain words, placed next to the field,
   saying what went wrong and how to fix it, keeping the user's input.
10. **Help and documentation.** Help reachable in context (inline hints, an
    FAQ, a contact path) without leaving the task.

### n/a and renormalizing

A heuristic that genuinely cannot apply to the surface may be scored `n/a`
with a one-line reason. Typical: a marketing landing page, portfolio or
campaign page has no expert workflow, so heuristics 7 (flexibility) and
sometimes 10 (help) may be `n/a`; a page with no inputs may mark 5 and 9
`n/a`. Do not use `n/a` to dodge a low score: if the surface could have
offered it and did not, score it.

Report the raw total over the applicable maximum (4 x the number of scored
heuristics), then renormalize to 40 for comparison:
`normalized = raw / applicable_max * 40`. Example: 24 of 32 (two `n/a`) is
30/40. Always print both, never a bare "/40" over a partial set.

### Score bands (on the normalized /40)

| Band | Range | What it means |
|---|---|---|
| Excellent | 36-40 | Polish only; ship it |
| Good | 28-35 | Sound foundation, a few weak axes to fix |
| Acceptable | 20-27 | Usable, but real problems before users are happy |
| Poor | 12-19 | Core experience broken in places; major rework |
| Critical | 0-11 | Redesign; the page does not do its job |

Most real pages land in 20-32. A first build that scores 36+ deserves a
second, harder look before the number is reported.

## Severity: P0-P3

Tag every issue with one level:

| Level | Name | Definition | When to fix |
|---|---|---|---|
| P0 | Blocking | The user cannot complete the primary task (CTA unreachable, form cannot submit, content invisible, keyboard trap) | Before anything else |
| P1 | Major | The task completes, but with real confusion, a failed accessibility criterion, or a credibility hit | Before shipping |
| P2 | Minor | An annoyance with an obvious workaround | Next pass |
| P3 | Polish | No measurable user impact; craft only | When time allows |

Tie-breaker between two levels: would this make someone email support or
leave the page? If yes, it is at least P1.

Each issue is written as: **what** (the exact element, by `data-name` or
section), **why it matters** (the user consequence), **fix** (concrete: the
token, the `ds-*` class, the native interaction, the copy change).

## Persona walk-throughs

Pick 3-5 personas that fit the surface and walk the page's primary action
as each one. Report what broke for that person on this page, not a generic
profile.

| Persona | Walks the page by | Typical red flags |
|---|---|---|
| **First-timer** | Reading top to bottom with no context, needing to know what this is and what to do in the first screen | Vague headline, jargon, no obvious next step, icon-only controls |
| **Power user / returning visitor** | Skipping copy, scanning for the one link or action they came for | No direct path, forced intros, slow reveals blocking content, nothing remembered |
| **Keyboard and screen-reader user** | Tab, Shift+Tab, Enter, Escape only; landmarks and headings for navigation | Missing skip link, invisible or obscured focus, unlabeled controls, motion that cannot be paused, drag-only controls, skipped heading levels |
| **Stress tester** | Long names, empty data, slow network, 320px width, 200% zoom, double-submits, back button mid-flow | Overflowing text, broken empty states, layout shift, duplicate submissions, lost form input |
| **Distracted mobile user** (optional) | One thumb, interrupted halfway, glare | Small targets, content under sticky bars, key info below long hero, low contrast |

Suggested picks by surface:

- Landing / marketing page: first-timer, distracted mobile, keyboard and
  screen-reader, stress tester.
- Dashboard / app view: power user, keyboard and screen-reader, stress
  tester, first-timer.
- Form or checkout flow: first-timer, stress tester, keyboard and
  screen-reader, distracted mobile.
- Content / article / docs: first-timer, keyboard and screen-reader,
  power user.
- Deck / document: first-timer (the reader who was not in the room) and the
  screen-reader user (reading order, alt text).

## Cognitive load checks

Mark each that fails; 0-1 failures is low load, 2-3 moderate, 4+ high (P1
at least).

- **Too many equal choices.** Count the options visible at each decision
  point (nav items, CTAs side by side, plan cards, filter chips). More than
  about 4 of equal visual weight overloads the choice: promote one, group
  the rest, or move them behind a disclosure.
- **No single focal point.** Every element at the same weight; squint at
  the screenshot and nothing leads.
- **Chunking.** Long runs of items not broken into groups of a handful.
- **Memory bridge.** Acting on screen B requires remembering something only
  shown on screen A.
- **Context switch.** One decision needs information spread across tabs,
  modals or distant sections.
- **Jargon tax.** Domain terms the audience must translate.
- **Simultaneous demands.** Reading, deciding and navigating at once
  instead of one step at a time.
- **Hidden location.** No active nav state, breadcrumb or progress
  indicator; the user cannot tell where they are.

## Report shape

1. Design specificity verdict (two or three sentences).
2. Heuristic table: number, heuristic, score or `n/a` with reason, the key
   finding. Raw total over applicable max, normalized /40, band.
3. Two or three things that work, and why.
4. Three to five priority issues, P-tagged, worst first.
5. Persona red flags, one short paragraph per persona.
6. Cognitive load: failed checks and the over-loaded decision points.
7. Tool reconciliation: what `validate_canvas` / lint added, and which of
   its findings are false positives.

Then hand the issues to the fix: mechanical items go through
[review-rubric.md](review-rubric.md), color decisions through
[color-strategy.md](color-strategy.md).
