# Brand Lock: canonical shape, evidence, precedence, overrides

The Brand Lock is the single source of truth for every brand-governed
generation or edit. It is not a new brand-strategy document - it records
supplied context, values read live from f0's design system, and the minimum
proposed decisions a given job actually needs.

## Lock states

Mark every field one of:

- `fixed` - supplied or approved; never change without explicit permission.
- `proposed` - fills a missing visual rule; may be revised.
- `not_applicable` - intentionally absent for this brand/output.
- `unknown` - unresolved and unsafe to invent.

Attach one evidence label from the next section to every field that carries
one, alongside its state.

## Evidence labels

- **source-declared** - explicit in an uploaded official asset, a `:root`
  token, DESIGN.md front matter, or an uploaded font file's own metadata.
- **measured** - read directly from `get_design_tokens` output, a design
  system's own CSS, or deterministic geometry (canvas element size/position).
- **visually-observed** - clear on inspection but not available as source
  data (e.g. a supplied reference image's apparent mood).
- **inferred** - a plausible interpretation or recommendation with no direct
  source.

Keep exact values and inferred ones separate. Never call an inferred font,
radius, or color role "exact" in a prompt or to the user.

## Source precedence

Resolve conflicting brand facts in this order:

1. User's explicit correction in the current conversation.
2. An official editable source (uploaded font file, uploaded logo SVG).
3. A written brand-guideline rule (DESIGN.md prose, uploaded brandbook).
4. A value repeated across multiple official assets.
5. A deterministic measurement (the live `:root` value from
   `get_design_tokens`).
6. A visual observation.
7. An inference.

Record a real conflict instead of averaging it away - a campaign asset may
intentionally diverge from the core identity, and that is a documented
`applications` override (below), not drift.

## Canonical shape

Keep this compact enough to copy relevant blocks verbatim into a generation
prompt. `presets/brand-lock-template.json` carries the same shape as an
empty, structured template.

```json
{
  "version": 1,
  "brand_context": {
    "name": "",
    "offering": "",
    "industry": "",
    "positioning": "",
    "audience": "",
    "tone": []
  },
  "concept": {
    "visual_premise": "",
    "central_mechanism": "",
    "reference_signals": [],
    "avoid": []
  },
  "visual_axes": {
    "restrained_expressive": 50,
    "geometric_organic": 50,
    "familiar_experimental": 50
  },
  "authoritative_assets": {
    "logo": {
      "origin": "user_supplied | generated | no_logo_slot_yet",
      "source": "",
      "canvas_convention": ".ds-logo",
      "variants": { "color": "", "black": "", "white": "" },
      "status": "fixed"
    },
    "fonts": [],
    "references": []
  },
  "palette": {
    "origin": "design_tokens",
    "colors": [{ "hex": "", "name": "", "role": "" }],
    "forbidden": []
  },
  "typography": {
    "origin": "ds_font_vars | design_md",
    "display": { "family": "", "weight": "", "var": "--font-heading" },
    "body": { "family": "", "weight": "", "var": "--font-body" },
    "mono": { "family": "", "var": "--font-mono" }
  },
  "layout": {
    "grid": "",
    "spacing_scale": [],
    "alignment": ""
  },
  "shape_language": {
    "corner_radii": [],
    "borders": [],
    "shadows": []
  },
  "graphic_devices": {
    "motifs": [],
    "patterns": [],
    "rules": []
  },
  "composition": {
    "hierarchy": "",
    "logo_placement": [],
    "text_behavior": ""
  },
  "applications": {},
  "unknowns": []
}
```

`authoritative_assets.logo.origin: "no_logo_slot_yet"` is the expected value
today - `DesignSystemPayload` has no logo asset field (see SKILL.md). Once a
`logo?: { assetUrl, variants, clearSpaceRatio }` field exists on the
payload, this origin value becomes `user_supplied | generated` like the
others and `canvas_convention` stops being the only pointer.

Palette values are never hand-typed here - they are always read fresh from
`get_design_tokens` (`DesignSystemPayload.colors`) at the top of the turn
this skill is active, because the live tokens are the only value that can't
silently drift out of date.

## Required minimum before generation

Before a paid/billed generation call, the lock must contain the fields the
requested output actually uses:

- Exact brand/product spelling.
- Logo source when the output uses a logo, or an explicit `not_applicable`.
- Palette behavior when the output uses color (exact hex from
  `get_design_tokens` when supplied).
- An approved display/body pair only when readable text appears.
- Composition/shape rules relevant to the requested asset.
- At least two concrete `avoid` rules.

If a missing value would materially affect a paid generation, ask once. If
it only affects a reversible layout detail, make a `proposed` decision and
say so.

## Prompt lock block

Reproduce this header verbatim in every image/logo generation prompt this
skill governs - see SKILL.md for the full block with its slots filled.
Repeat it verbatim across every related asset in one request; change only
the asset-specific content, dimensions, and composition section beneath it.

## Reference discipline

- Keep one authoritative locator per asset (local path, upload ID, or job
  ID) and reuse it everywhere rather than re-describing the asset each time.
- Label references by role in prompts: "Image 1: authoritative logo",
  "Image 2: approved base scene".
- State what each reference controls and what it must not control.
- For an existing logo, require exact preservation of spelling, geometry,
  proportions, and colors - prefer deterministic placement/compositing over
  asking a generator to redraw it.

## Per-format overrides

Store format differences under `applications`, never by silently changing a
core token. Examples: a social carousel may use tighter spacing than a
deck; a poster may use the display font at extreme scale; a dark mockup uses
the approved white/reverse logo variant when one exists. An override must
name its format and must not contradict a `fixed` core rule.
