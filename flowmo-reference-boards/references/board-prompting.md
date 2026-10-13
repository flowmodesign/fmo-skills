# Generating the boards

Part of the flowmo-reference-boards skill package - see the package's SKILL.md
for routing. This reference covers how to actually produce reference boards:
the combinatorial picks, the prompt template, per-board variety rules, and the
re-roll rule.

## Boards as spec, not decoration

A reference board is a generated image that stands in for a page section's
design BEFORE any HTML is written. Treat it as the actual specification, not
mood art: if a board can't answer "what does the build copy from this?" (see
[build-contract.md](build-contract.md)), it isn't done. A generic board
guarantees a generic build - no amount of code-level craft recovers from a
weak board. Generate one board per section, never one tall full-page image
(detail gets mushy and per-section composition variety disappears). Prefer a
landscape aspect (16:9 or 3:2) so each board reads like a real desktop layout.

**What each board must communicate:** layout grid, section hierarchy,
spacing rhythm, typography scale relationships, palette + accent placement,
CTA priority, component styling, and image treatment. A board that can't be
read for all of these is mood art, not a spec - re-roll or reconsider it.

## The combinatorial picks

Before prompting a single board, commit to ONE option per axis from the
package's `presets/board-picks.json` (schema
`flowmo-reference-boards/board-picks@1`, grouped by `axis`) and hold that
combination across every board in the set:

- `theme_paradigm` - overall light/dark/color field.
- `background_character` - what fills the space behind content.
- `typography_character` - the type family's personality.
- `hero_architecture` - how the hero section is composed.
- `section_system` - the dominant rhythm across sections.
- `signature_component` - pick four distinct items from this axis; each board
  can draw from the set, not just one.
- `narrative_spine` - pick exactly one; thread it through every board's
  subject matter and framing.
- `second_read_moment` - pick exactly one; place it in exactly one board, not
  scattered across several.

Do not mix categories inconsistently - a strong, consistent combination beats
a mash of unrelated picks. Write the chosen combination down (in the page's
design notes, or wherever the project tracks brief decisions) so later boards
and the eventual build stay aligned.

**Per-board variety is still mandatory within that one locked combination.**
Each board should pick its own composition anchor within the chosen
`hero_architecture`/`section_system` (centered statement, top-left lead,
bottom-left over image, off-grid offset, stacked center, image-as-canvas,
inverted classic...) - at least three distinct anchors across the set, and
the hero must NOT open on left-text/right-image (the most overused AI
pattern) - use it at most once, mid-page, and only if it is genuinely the
strongest reading for this brief. Background treatment should also vary board
to board within the chosen `background_character` (solid + inline asset,
duotone image, color-blocked diptych, graded atmospheric photo, flat block +
detail crop).

**CTA variety.** Boards should show different CTA garments per section -
underlined inline link + arrow, oversized headline + tiny CTA hint, framed
block, banner CTA, a classic pill at most once. This feeds the garment-catalog
rule in [build-contract.md](build-contract.md): do not let every board render
the same generic button.

## Palette bans

Banned as default reaches - all are recognizable AI tells, and picking one
without a real reason reads as a template rather than a designed page:

1. **Graphite/near-black + orange/amber/ember accent** (`#FF4B1F`-family,
   `#F97316`, `#FF6B35`, amber-500...) - the "technical premium" default.
2. **Near-black + neon cyan/blue/green glow accent** (`#22d3ee`, `#00FFC2`,
   `#3B82F6`-on-zinc-950...) - the "AI dark SaaS" default.
3. **Beige/cream + brass/clay/oxblood** - the "premium craft" default.
4. **AI purple/violet glow** on anything.

Also avoid reusing the palette family of the previous build in the same
session. Override a ban only when the user's brand explicitly names those
colors. What to reach for instead: Bold Studio Solid fields (bottle green,
oxblood, royal blue, vermilion), chromatic lights (limestone, celadon, warm
grey + one unexpected saturated accent: chartreuse, vermilion-pink,
ultramarine), duotone photographic palettes. One accent, decisive, defended
in one line in the brief.

## The prompt template (`generate_image`)

Generate boards with f0's `generate_image` tool - not any external image
model. A slotted template, filled from the locked picks plus the section's own
brief:

```
website design mockup, desktop landing page section, [SECTION ROLE],
[theme paradigm title + concrete palette words for it], [typography character
title] typography, [hero architecture / composition anchor for this board],
[background character title + treatment for this board], [narrative spine
title as a motif], professional layout, clear hierarchy and spacing,
award-winning web design, no watermark, no browser chrome
```

Notes on filling the slots:
- `[SECTION ROLE]` is the actual section this board represents (hero,
  features, pricing, testimonials, footer...).
- Name the REAL headline/sub/CTA wording you plan to use, not lorem ipsum -
  type sits believably only when the words are real.
- Request the tool's highest quality setting explicitly where available;
  don't let it default to a lower tier for a spec-grade image.
- Keep the palette words concrete (named hues/moods), not generic ("modern",
  "clean") - vague palette language is how boards drift back to generic
  defaults.

## The re-roll rule

Look at every generated board before treating it as locked. For each, ask:
would this survive on a real studio's portfolio, or does it read as a
template? Re-roll (regenerate with an escalated direction - push the
composition anchor harder, or swap the background treatment) any board that
reads generic: a centered flat hero, a glowing gradient blob, a default
card-trio, dashboard filler, or unearned "luxury" serif-on-beige. Budget up
to 2 re-rolls per build. If a board still reads generic after two re-rolls,
change the underlying pick (a different `hero_architecture` or
`background_character`), not just the wording - the category choice was the
problem, not the prompt phrasing.

## Hero-board minimalism

- At most four visible text elements in the hero board: an eyebrow (or none),
  the headline, one sub-line, one CTA. No feature lists, no floating UI
  clutter.
- The headline should read at a glance - typography IS the design in a strong
  hero board.
- One focal visual (or decisively empty space functioning as the focal
  element) - never three competing objects.
- No fake dashboards or fake product UI unless the brief is genuinely a
  product with a real UI to show.

## What craft guidance to pair this with

Palette cliches to avoid (the generic dark-plus-neon-accent SaaS look, the
default beige-plus-brass "premium craft" look, and similar overused
combinations) and general "avoid the generic-AI look" judgment live in
**flowmo-design-craft** - read its "Avoid the generic-AI look" section before
locking a theme/background pick, rather than defaulting to whatever a model
reaches for first.
