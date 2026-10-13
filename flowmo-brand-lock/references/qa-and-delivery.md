# QA matrix and delivery manifest

Assume the first pass contains inconsistencies. Validate the set as a
system, and validate each asset as an individual deliverable, before
telling the user it is done.

## Preflight before generation

- `get_design_tokens` was called this turn - palette/type values are fresh,
  not carried over from an earlier turn.
- The Brand Lock's required-minimum fields for THIS output are filled (see
  brand-lock-shape.md).
- Every logo reference points at the one authoritative asset/element, not a
  re-described or regenerated copy.
- Requested output list, quantity, format, and dimensions are explicit.
- Exact user copy is captured verbatim - never invented positioning,
  claims, prices, or regulatory text.
- Palette and typography decisions are resolved (locked or explicitly
  `proposed`, never silently guessed).
- Editable vs. rendered deliverables are distinguished before generation
  starts, not after.

Do not generate speculative extras. Generation success, your own visual
read, or the user's silence are never approval.

## Evidence-based review

Review outputs visually yourself for semantic checks - does the logo look
distorted, does hierarchy match the intended concept, do the assets feel
like one system. Use a deterministic check for anything measurable instead:
exact dimensions, exact colors read from `get_design_tokens`/source tokens,
text contents, font references, element positions, SVG/DOM attributes. Never
accept a vision model's description as proof of an exact hex, font, spacing
value, or corner radius - only `get_design_tokens` output or direct element
inspection counts as exact.

## Set-level consistency matrix

Review every asset in the request together:

```text
Asset | Logo | Palette | Type | Grid/spacing | Shape/device | Format | Status
```

An asset passes only when it follows the same Brand Lock. A format-specific
difference must already be documented under `applications` in the lock -
an unexplained difference is drift, not intentional variation. Check:

- exact brand/product spelling
- exact logo geometry and the approved color variant
- palette role consistency (not just approximate hue match)
- the approved display/body pair, exact copy, and rendering fidelity
- grid, outer margin, gutters, alignment
- borders, corner radii, shadows, shapes, motif
- density, hierarchy, composition
- exact copy and any CTA
- dimensions/aspect ratio
- contrast and legibility

## Module-specific checks

### Logo

- Matches the authoritative source exactly (or, for a new mark, matches the
  selected candidate's own generation - see logo-prompt-enhancer.md).
- Exactly three candidates were generated for a new-mark request, with
  identical generation parameters (palette, background, aspect, quality)
  across all three.
- Candidate prompts contain no text except explicitly requested monogram
  initials or a `wordmark` candidate's own name.
- Selected mark and any wordmark lockup read as one optically balanced
  system - matched stroke weight, cap/x-height balance, deliberate gap.
- Geometry, proportions, clear space, and small-size legibility hold up.
- Clear space defaults, when the brand states none: keep empty space on
  every side at least equal to the mark's own height (for a combination
  lockup, the symbol's height), or state a different unit explicitly (for
  example "the cap height of the wordmark") and use it everywhere. Record
  the chosen unit under `composition.logo_placement` so every asset in the
  set measures the same way.
- Minimum size defaults, when the brand states none: the full horizontal
  lockup no narrower than about 120px on screen, the symbol/app-icon alone
  no smaller than about 24px. Below those, switch to the simpler variant
  (symbol only, or a monochrome version) rather than shrinking detail into
  mush. Check the smallest real placement (favicon, footer, avatar), not
  only the hero.

### Typography

- The one approved pair, its exact family/weight, and any required license
  or install note are confirmed.
- The rendered sample used the real fonts and the approved palette - never
  a generated image as a stand-in for an exact letterform.
- Required language/glyph coverage checked.

### Designer-authored (on-canvas) assets

- Text, logo, shape, and image placeholders remain separate editable
  elements - never a single flattened raster standing in for an editable
  layout.
- No placeholder/lorem copy ships in a delivered asset.
- Re-render/re-screenshot after any fix; never declare success from an
  unrendered or first-pass-only check.

### Mockups

- Compare the result against every scene/product/logo reference used.
- Confirm the user-approved aspect ratio was used.
- For text-bearing mockups, confirm only the controlled branding/text pass
  changed - everything else in the base scene is untouched.
- Verify placement, scale, alignment, clear space, color variant, and
  material application match the prompt exactly.
- When an existing photograph was the base, verify only the requested
  branded surface changed.
- Reject any corrupted or approximate logo rendering, any generic
  marble/pedestal staging, arbitrary gradients, plastic sheen, excessive
  bloom, floating objects, meaningless props, or fake copy.
- Confirm one specific art-directed idea tied to the brand and category.

### Social/marketing graphics

- Exact copy, spelling, punctuation, and requested line breaks.
- Correct platform/aspect ratio and requested output count.
- Logo geometry/color match the approved variant.
- Typography character matches the approved specimen and font roles.
- No pseudo-text, invented copy/CTA, extra logos, or palette drift.

## Repair strategy

When an asset fails a check:

1. Name the specific Brand Lock rule it broke.
2. Decide whether the fix is generative (regenerate) or deterministic
   (re-typeset copy, re-place the logo, correct a color token, resize/
   re-align, replace one background layer).
3. Prefer the deterministic fix when one is available - it is cheaper and
   it cannot introduce a new inconsistency the generative pass would.
4. Keep the Brand Lock and every passing asset unchanged.
5. Regenerate or recompose only the failing asset, then re-run its module
   check and the set-level matrix.

If the user asks to change a core rule (not a format override), update the
Brand Lock first, list every downstream asset that depends on the changed
slot (see SKILL.md's "The dependency rule" and "When feedback changes one
slot" sections - a palette change invalidates the logo and its typography
pairing, a logo change only invalidates typography pairing, a typography
change only invalidates the wordmark/combination lockup), and revise only
those assets after confirmation. Never silently keep an asset tied to a
stale revision of the lock.

## Stop conditions

Stop and disclose the limitation instead of shipping a flattened
approximation when:

- A generated logo cannot be reproduced faithfully as clean vector output.
- A generation pass repeatedly corrupts the authoritative logo (after one
  retry with stronger constraints).
- A required custom font is unavailable or cannot be embedded on the
  target surface.
- Source brand material is too flattened/ambiguous to recover an exact
  rule, and the user has not resolved the ambiguity.
- A logo asset-URL/variant is needed but no logo slot exists yet on the
  design system payload (see SKILL.md) and no manual reference was
  supplied.

## Brand identity board

When the user asks for the identity as a whole ("show me the brand",
"brand sheet", "identity overview") rather than one asset, deliver a 3x3
board: nine panels that together prove the Brand Lock works as a system.
Build it as an editable Designer page or canvas section (real text, the real
logo element, real tokens), with generated imagery only inside the panels
that need a photograph or a physical scene.

| # | Panel | Shows |
|---|---|---|
| 1 | Logo hero | the approved mark at large scale on its best background |
| 2 | Construction and clear space | the mark with its clear-space unit and minimum sizes drawn in |
| 3 | Color system | every palette role as a swatch with exact hex and its role name |
| 4 | Typography | the display/body pair set in real text, with sizes and weights |
| 5 | Digital application | one real screen: a page hero, an app screen, or a social post |
| 6 | Physical application | one credible object from the checklist below, per mockup-contract.md |
| 7 | Image direction | two or three photographs or renders in the brand's image style |
| 8 | Essence and voice | the primary message and the voice traits from voice-and-messaging.md |
| 9 | System detail | the graphic device, pattern, or shape language in use |

Rhythm rule: the panels are not equally loud. Exactly one is the hero -
usually the logo hero, or the digital application when the brand lives on
screen - and it gets the most color, scale, or image weight. Alternate the
rest between dense panels (swatches, type specimen) and quiet ones (a lot of
empty ground around one element). A board where all nine shout reads as a
template; a board where all nine whisper hides the brand. Every panel uses
the same Brand Lock: same palette roles, same type pair, same corner radius
and spacing logic.

## Corporate-identity application checklist

Use this when the request is a set of real-world applications (an identity
rollout, a CIP). Each row is a family; pick the ones the brief needs, never
all of them by default. Physical items follow mockup-contract.md, including
its logo variant routing.

| Family | Typical items | Logo placement | Color usage | Avoid |
|---|---|---|---|---|
| Stationery | business card, letterhead, envelope, folder | top-left or centered on cards; top margin on letterhead, never in the body text area | mostly paper ground, one accent band or edge at most | full-bleed brand color behind dense text; the mark below its minimum size on small cards |
| Signage | wayfinding, door plates, exterior sign | high, centered or aligned to the architecture's axis, readable from the approach distance | high-contrast pair only; the reverse variant on dark materials | thin strokes and small type that vanish at distance; full-color marks on processes that need monochrome |
| Apparel | tee, cap, uniform, tote | left chest or centered back; small and confident beats large and loud | garment color from the palette or a neutral; one-color print | gradients and fine detail that will not survive screen print or embroidery |
| Vehicle | van, car door, delivery bike | doors and rear, following the body's flat panels | one dominant brand color or a neutral wrap with one accent | logos crossing door seams, handles or wheel arches; text too small to read in motion |
| Digital | site header, app icon, social avatar, email signature | header left; icon and avatar use the symbol alone, centered in the safe circle | palette roles exactly as tokens; the white or reverse variant on dark UI | the full lockup squeezed into a 24px slot; rasterized logos where SVG is possible |
| Events | booth backdrop, banner, badge, slide template | high on backdrops (above head height), repeated only on step-and-repeat walls | bold brand color carries the space; text on the calmest ground | the logo at floor level or hidden behind people and furniture; every surface in a different treatment |

## Delivery manifest

Return, every time:

```text
Brand Lock version / revision basis:
Concept summary:
Editable assets (design-system elements, on-canvas):
Rendered/final assets (generated images):
Required fonts / install notes:
Known limitations:
Variant names:
```

Use stable, descriptive asset names so a later "revise mockup 3" or
"redo the poster in the dark variant" can target exactly one asset without
rerunning the unrelated ones - e.g. `brand-mockup-tote-primary-v1`,
`brand-poster-launch-v1`, `logo-candidate-2-abstract`.
