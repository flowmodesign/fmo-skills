---
name: flowmo-reference-boards
version: 1
family: image
description: |
  Generate and use reference boards - per-section mood-board images that
  function as the design brief BEFORE any HTML is written - for a flowmo
  page build. Covers the combinatorial pick axes (theme, background,
  typography, hero architecture, section system, signature components,
  narrative spine, second-read moment), the generate_image prompt template,
  the re-roll rule, what the build copies from a locked board (ds-* tokens
  and write_html/write_css, never literal pixels), anti-drift rules and
  ambiguity precedence, the downstream asset kit, and the personalization
  ladder. Use when: "mood board", "design reference", "visual direction
  before we build", "reference images for the page", "lock the look first".
  NOT for writing page markup once a board is locked (use
  flowmo-frontend-design and flowmo-authoring-contract), general design
  judgment with no board involved (use flowmo-design-craft), or directing
  scroll-scrub footage (use flowmo-scroll-scrub).
surfaces: [assistant-web, flowgen-chat, mcp, designer]
kinds: [media]
tools: [assistant-web:generate_image, assistant-web:generate_video, assistant-web:remove_image_background, assistant-web:write_html, assistant-web:write_css, designer:generate_image_asset, designer:remove_image_background]
presets: presets/board-picks.json
chain_with: [flowmo-design-recipe, flowmo-brand-lock]
derived_from: https://github.com/higgsfield-ai/skills
---

# flowmo reference boards

A reference board is a generated per-section image that functions as the
design brief before a single line of markup exists. A generic board
guarantees a generic build - no amount of code-level polish recovers from a
weak one. This skill governs generating boards, locking their design
decisions, and carrying those decisions faithfully into the actual
`write_html`/`write_css` build.

## Boards as spec

Generate ONE board per section (never one tall full-page image - detail goes
mushy and per-section variety disappears). Each board must be able to answer
"what does the build copy from this?" (design language, layout/spacing logic,
component family, palette logic, rhythm motifs) - if it can't, it's mood art,
not a spec, and should be re-rolled or reconsidered.

## Lock the combinatorial picks first

Before prompting any board, commit to one option per axis from
[presets/board-picks.json](presets/board-picks.json) and hold that
combination across the whole set: `theme_paradigm`, `background_character`,
`typography_character`, `hero_architecture`, `hero_scale` (giant statement,
mid editorial, or mini minimalist), `section_system`, four picks
from `signature_component`, one `narrative_spine`, and one
`second_read_moment`. Full axis descriptions and how to combine them for
per-board variety are in
[references/board-prompting.md](references/board-prompting.md), along with
the `generate_image` prompt template (a slotted template filled from these
picks plus each section's real headline copy) and the re-roll rule (when a
board reads generic, escalate the direction; if it still reads generic after
two re-rolls, change the category pick, not the wording).

## What the build copies from a locked board

The board fixes DESIGN DECISIONS - text, type-scale relationships, spacing
LOGIC, color logic, component structure, repeated motifs - never exact
pixels. Translate every decision into f0's real build vocabulary: `ds-*`
classes and `:root` `--vars` (see **flowmo-frontend-design**) authored
through `write_html`/`write_css`, not an attempt to trace the board's pixel
grid. Full anti-drift rules (what NOT to simplify/flatten/merge away from the
board) and the ambiguity-resolution precedence order for when the board and
the written brief conflict are in
[references/build-contract.md](references/build-contract.md). That reference
also covers which parts of a board are non-normative (incidental nav/footer
chrome a board renders around its own section, generic default buttons) so
you don't over-copy things the board never meant to specify, and the
page-rhythm checks a per-section board set cannot make on its own
(repetition thresholds, cross-section contrast, fixed media frames, the
first screen on a small laptop, every section has a job).

## The downstream asset kit

A locked board set art-directs a coherent generated asset kit for the actual
build: hero visual, section background plates, content imagery, a custom
icon set, an OG image, and a head kit (favicon/meta), generated with
`generate_image` / `generate_video` / `remove_image_background` and
palette-locked to the boards. Full kit list, optional "personalization
ladder" items (animated logo sting, brand pattern, spot illustrations, and
similar), and how far to tailor a kit to one specific brief versus keep it
reusable are in
[references/asset-kit-and-ladder.md](references/asset-kit-and-ladder.md).

## Pair with

**flowmo-design-craft** for the underlying visual-quality judgment (avoiding
the generic-AI look, hierarchy, type, color) that should inform which
combinatorial picks you choose in the first place. **flowmo-frontend-design**
for the `ds-*` token vocabulary the build phase writes into. For a file
handoff (Import page / drag-drop) rather than a live canvas build, also load
**flowmo-authoring-contract**. For a scroll-scrubbed hero specifically, hand
off to **flowmo-scroll-scrub** once the board has locked the visual direction
the footage needs to match.
