---
name: flowmo-brand-lock
version: 1
family: brand
description: |
  Reads the project's linked Brain brand record first (logos, colors, fonts, tone, references) and the design system second (:root tokens, dsFontVars.ts), and compiles one Brand Lock block every generating surface carries into its prompts/edits: exact spelling, authoritative logo reference, exact palette hex/role, exact typography, layout/shape rules, forbidden treatments. Bound to every generating surface (assistant web and video, every Designer kind, Flowgen chat, image/video nodes) since brand drift can start from any of them. Use when: a brand kit or design system exists and a request would generate or edit a logo, palette, typography, mockup, thumbnail, photoshoot, or any on-brand asset - keep this on brand, use our logo, match our colors/fonts. NOT for: building a brand identity from scratch with no design system yet (use flowmo-frontend-design's create_design_system), general page-layout craft (use flowmo-design-craft), or video prompt anatomy unrelated to brand assets (use flowmo-video-prompt-craft).
surfaces: [assistant-web, assistant-video, designer, flowgen-chat, flowgen-image-node, flowgen-video-node, mcp]
tools: [assistant-web:get_design_tokens, assistant-video:get_design_tokens, designer:generate_logo_asset, assistant-web:generate_logo, assistant-video:generate_logo, designer:generate_image_asset, assistant-web:generate_image, assistant-video:generate_image, designer:set_stylesheet]
default_on: [designer:media]
triggers:
  - on brand
  - on-brand
  - our logo
  - our brand
  - brand colors
  - brand palette
  - brand fonts
  - brand kit
  - brand guidelines
  - match our brand
  - keep it on brand
  - brand lock
presets: [presets/brand-lock-template.json, presets/graphic-formats.json]
chain_with: [flowmo-thumbnail, flowmo-product-photoshoot, flowmo-reference-boards, flowmo-design-recipe]
derived_from: https://github.com/higgsfield-ai/skills
---

# flowmo brand lock

One skill, bound to every surface that can generate or edit a visual asset.
A brand is not "on brand" because one generation looked right - it is on
brand because every surface reads the SAME lock before it writes anything.
This package is that lock: where it lives in f0, how it is compiled into a
prompt, and what invalidates what when the user changes a foundation slot.

## Reading the lock from f0

Read the LINKED BRAND RECORD first, the design system second.

A project can be linked to a Brain brand record from Settings > Brand
(`components/modals/settings/brandLink.ts`). You do not have to wait for that
link: `lib/brand/resolveBrand.ts` is the one resolution policy every surface
runs - the surface's own link first, then the FlowGen project link
(`projects/{pid}.brandRecordId`), then the single brand record in scope. It
answers null only when the Brain holds several brands and nothing says which,
and then the surface shows "link one" rather than guessing. When it answers,
the system prompt carries a `<linked_brand>` block built by
`lib/brand/linkedBrandContext.ts`, and that block is the brand's own
declaration of itself: name spelling, mission, audience, tone, the emotions
to evoke, the palette by role, the heading/body/mono families, the vector
and raster logo URLs, and the tagged visual references (a title, a URL and a
style paragraph per reference, grouped by tag - social, website, video,
print, ad, ...). Fill the lock from it before reading anything else:

- **Logo** - `logo_vector` (SVG) is the authoritative mark; `logo` (raster)
  is the same mark for surfaces that cannot take SVG. Either is a real,
  fetchable URL - pass it as the reference image rather than describing the
  mark in words.
- **Palette** - the `primary` / `secondary` / `accent` / `background` /
  `text` roles on the record are exact hex by declaration, which outranks a
  measured `:root` value.
- **Typography** - `heading_font` / `body_font` / `mono_font` are exact
  family names.
- **Spelling, mission, audience, tone, emotions** - copy the spelling
  verbatim; let the rest drive copy and mood, never invent a brand fact the
  block does not state. Turning a declared tone into usable copy rules (four
  voice spectra, "X, not Y" traits, tone by context, a messaging hierarchy
  with proof, and how they fill `brand_context.tone`) is in
  [references/voice-and-messaging.md](references/voice-and-messaging.md).
- **References** - a reference's tag says WHICH surface it governs. Use the
  `social`-tagged rows for a social graphic, `website` for a page, `video`
  for a shot. A reference's style paragraph is a rule, not a suggestion.

The values the editor's own Settings > Brand panel shows are a COPY of that
record taken at link/sync time - treat them as a stale mirror, not a second
source, and never "reconcile" the two by averaging them.

No linked brand record means no `<linked_brand>` block; compile the lock
from the design system alone, exactly as below.

- **Palette** - call `get_design_tokens` first, every turn this skill is
  active. It returns the live `:root` custom properties, which are the same
  values as `DesignSystemPayload.colors`. Read exact hex from here, never
  from memory or a prior turn.
- **Typography** - the `:root` vars named in `dsFontVars.ts`
  (`--font-heading`, `--font-body`, `--font-mono`), cross-checked against the
  `typography` roles in the project's DESIGN.md when one exists
  (`designSystemMarkdownExporter.ts` round-trips it). Exact family name and
  weight, not a description of the font.
- **Logo** - `DesignSystemPayload` has **no logo asset slot yet**. `.ds-logo`
  on `designSystemAsset.ts:962` is a CLASS CONVENTION: it tells you where the
  logo lives on the canvas (an element carrying that class inside the
  authored master), not a URL, color variant, or clear-space value. Treat any
  authoritative-logo field below as "when a logo slot exists on the design
  system payload" until one ships - in the meantime, the authoritative logo
  is whatever element on canvas carries `.ds-logo`, or a user-supplied image
  reference passed into `generate_image_asset`/`generate_logo_asset` by hand.
- **Layout / shape / graphic device** - read from the same `:root` tokens
  (`--radius-*`, `--shadow-*`, `--spacing-*`) per **flowmo-frontend-design**,
  plus anything DESIGN.md states in prose.

No design system on the project means no lock to enforce - fall back to
**flowmo-design-craft** and, if the user actually wants an identity built,
route to `create_design_system` / **flowmo-frontend-design** first.

## Creative DNA and the visual axes

Before locking anything, a brand's Creative DNA (product truth, audience
desire, positioning, name cues, reference signals) and its three visual axes
(Restrained-Expressive, Geometric-Organic, Familiar-Experimental, each
0-100, unspecified = 50) explain WHY a rule exists, so a later edit can
reason about intent instead of just copying values. Full compile method,
logo-type routing (wordmark, lettermark/monogram, pictorial, abstract,
combination, emblem), the one-expressive-move rule, and the
brand-identity-specific anti-slop list live in
[references/creative-dna-and-axes.md](references/creative-dna-and-axes.md).
This is a different list from **flowmo-design-craft**'s generic-AI-look
section - that one is about page layout, this one is about identity marks
and palettes; read both, don't merge them.

When a Creative DNA field cannot be filled from the brief, the design
system, or a prior turn, ask ONE compact message containing only the
still-missing blocking fields (name/offering/positioning/audience, or which
visual axis actually matters) - never repeat what is already known, and
never force a full identity questionnaire for a partial task. Skip the
question entirely when nothing blocking is missing.

## The Brand Lock block

Every prompt to `generate_logo_asset`, `generate_image_asset`, or a
`set_stylesheet` call that touches brand-governed CSS carries this block,
reproduced verbatim as a structural header, with the slots filled from the
`<linked_brand>` block when the project has one, and otherwise from what
`get_design_tokens` and the design system just returned:

```text
[BRAND LOCK - DO NOT DEVIATE]
Brand spelling: <exact>
Authoritative logo: <the linked brand record's logo_vector/logo URL + preservation instruction, or "no logo slot yet - see .ds-logo on canvas">
Palette: <exact hex + role, from the linked brand record, else DesignSystemPayload.colors>
Typography: <exact font family/weight, from the linked brand record, else dsFontVars.ts / DESIGN.md>
Layout: <grid/alignment/spacing tokens>
Shape language: <radius/border/forms>
Graphic device: <motif/pattern rule>
Must preserve: <fixed invariants>
Never: <forbidden treatments>
```

Repeat the block verbatim across every related asset in one request; change
only the asset-specific content and dimensions section below it. The full
canonical JSON shape this block is compiled from - lock states
(`fixed`/`proposed`/`not_applicable`/`unknown`), evidence labels, source
precedence when facts conflict, and the per-format `applications` overrides
- is in
[references/brand-lock-shape.md](references/brand-lock-shape.md). The
templated empty shape is [presets/brand-lock-template.json](presets/brand-lock-template.json).

## The dependency rule

**A palette change invalidates the logo. A typography change does not.**

A generated logo was drawn against a specific palette's hex values as color
constraints - change the palette and the mark's own colors are now wrong, so
it must be regenerated. Typography never entered the mark's own generation
(logos are symbol-only, see the enhancer reference), so a font change only
invalidates typography-DEPENDENT outputs: wordmark lockups, text-bearing
mockups, decks. It never touches the symbol mark itself.

In f0 terms: `targets.web`/`targets.video` on `DesignSystemPayload` are
deterministically rebuilt from `css` (which carries the `:root` palette) and
`markdown`. A palette edit changes the `:root` values those targets and any
`.ds-logo`-adjacent color reference were built against, which is the live
signal that dependent generated assets need a fresh pass; a typography-only
edit changes `--font-*` vars that the symbol mark never read, so it never
forces a logo regeneration. Treat "was this asset generated against the
CURRENT palette" as the actual staleness check, not a stored revision
counter.

## Stage order and required slots

When creating a NEW logo mark (not applying an existing one), the creation
order is fixed: **palette, then logo, then typography.** Never generate
logo candidates against an unselected palette - intake color preferences
("blue", "warm neutrals") are inputs to palette OPTIONS, not a selected
palette. Logo-mechanism generation may only start once the palette is
user-selected, or the user already supplied/selected an authoritative
palette. Typography selection is optional, and when it runs it follows an
approved logo so the display face can be matched to the mark's own anatomy.

Each requested output only needs the slots it actually uses - never force
an unrelated missing slot before continuing:

- **Logo-only** - palette + logo for a new mark; the existing logo
  reference alone for an existing mark.
- **Palette-only** - palette.
- **Typography-only** - typography.
- **Copy-free mockup/application** - logo; add palette only when a
  color/application decision needs it.
- **Text-bearing mockup or social graphic** - logo + palette + typography.

Once the slots the first request's deliverables actually need are filled,
continue that request immediately - never re-ask the user to choose scope
again.

## When feedback changes one slot

Revise only the element the feedback targets, then re-check just its real
dependents:

- **Palette change** -> recheck the mark (it was drawn against that
  palette's hex values, so it is now stale) AND recheck typography pairing
  for cohesion with the regenerated mark.
- **Logo change** -> recheck typography pairing only; the palette is
  unaffected.
- **Typography change** -> rebuild the wordmark/combination lockup only;
  the symbol mark itself never used typography and stays untouched.

Never restart an unrelated stage without one of these concrete dependency
reasons.

## Evidence and source precedence

When brand facts conflict (a DESIGN.md value vs. a canvas `.ds-logo`
element's actual on-page color vs. what the user just typed), resolve in
order: user's explicit correction > the `<linked_brand>` block (the brand
record is a declared source, not a measurement) > official source file/token >
DESIGN.md-declared rule > repeated value across multiple official assets >
deterministic measurement (read the actual `:root` value) > visual
observation > inference. Label every extracted rule with one evidence tag:
`source-declared`, `measured`, `visually-observed`, or `inferred`. Never
call an inferred color or font "exact". Full detail in
[references/brand-lock-shape.md](references/brand-lock-shape.md).

## Generating a new logo mark

When the brief calls for a genuinely new symbol (not applying an existing
one), Design Brain's three-candidate routine and the prompt compiler that
turns one candidate into one `generate_logo_asset` call - field ordering,
the distinctiveness floor, and the four constraint tails - are in
[references/logo-prompt-enhancer.md](references/logo-prompt-enhancer.md).
Always produce exactly three distinct symbol-only candidates, one enhanced
prompt per candidate, and let the user pick - never self-select a winner.

## Palette and typography contracts

The rules a generated palette or type system must satisfy before it can
become the lock's source of truth (contrast, role coverage, pair
distinctiveness, anatomy matching) are in
[references/palette-typography-contracts.md](references/palette-typography-contracts.md).

## Mockups and applications

The prompt-contract skeleton for compositing an approved logo/palette into a
realistic product or environment mockup via `generate_image_asset` - the
placement lock, physical-application clauses, and the logo-variant routing
that says which color/black/white variant a given material needs - is in
[references/mockup-contract.md](references/mockup-contract.md).

## Social and marketing graphics

Flattened social/marketing graphics (a branded poster-style post, or a
mockup-photography post) follow a lighter, different contract than a full
product/environment mockup: the required pre-generation questions, the
plain-poster prompt shape, and the mockup-photography variant that reuses
mockup-contract.md's blank-scene pass, are in
[references/social-graphics-contract.md](references/social-graphics-contract.md).
Platform canvases, safe zones and ad text-area limits are in
[presets/graphic-formats.json](presets/graphic-formats.json).

## QA and delivery

The consistency matrix every brand-governed asset must pass before it ships,
module-specific checks (including concrete logo clear-space and minimum-size
defaults), the repair strategy when one asset drifts, the delivery manifest
shape, the 3x3 brand identity board, and the corporate-identity application
checklist are in
[references/qa-and-delivery.md](references/qa-and-delivery.md).

## Never

- Never invent a hex, font, or logo detail this skill could instead read
  from `get_design_tokens` / `dsFontVars.ts` / DESIGN.md.
- Never regenerate an approved logo merely to change its background, size,
  or placement - composite/place it instead.
- Never claim a logo asset-URL/variant/clear-space field exists on the
  design system payload today; say "when a logo slot exists" and use the
  `.ds-logo` canvas convention meanwhile.
- Never let a palette or typography edit silently skip the dependency check
  above.
