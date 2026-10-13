# Mockup and application prompt contract

How an approved brand asset gets composited into a realistic product or
environment mockup via `generate_image_asset` (or `edit_image_asset` when
starting from an existing photo). A mockup is a rendered image, not an
editable layered document - if the user needs editable source artwork, that
is a different surface (a Designer page, not this contract).

## Plan the application from the lock, not from taste

Read the Brand Lock (palette + logo reference, typography only if readable
text appears) before choosing the mockup object, material, framing, or art
direction. Choose applications people in that category would credibly use.
Pull composition/material cues from user-supplied references, but never
recreate a reference's exact scene, layout, or branded object. Each mockup
needs one clear art-directed idea tied to THIS brand - "put the logo on a
generic object" is not a concept.

## Anti-slop for mockups

Reject the common synthetic/generic mockup look:

- arbitrary gradients or neon glows unrelated to the Brand Lock
- plastic sheen on every material
- floating products or physically meaningless props
- excessive bloom, haze, depth of field, or "cinematic" lighting as a
  default rather than a deliberate choice
- generic marble/pedestal "luxury" staging
- fake microcopy, pseudo-labels, invented claims, or decorative UI text
- impossible folds, embossing, reflections, print edges, or scale
- too many props competing with the branded surface
- a warped logo, or a different visual treatment of the mark in every
  mockup in the same set

Prefer believable materials, restrained lighting, purposeful negative
space, a specific named environment, and one focal branded application per
image.

## Ask for aspect ratio before generating

Confirm the target ratio (1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3, or whatever
the destination surface needs) before the first call unless the request
already states it. For a set of mockups, use one ratio across the set
unless the user assigns ratios per item.

## Logo variant routing

Route the color variant to the material, once a logo asset slot exists on
the design system payload (see SKILL.md - until then, this routing applies
to whatever logo reference/upload the user supplied by hand):

- **Full-color logo** - smooth surfaces and production methods that
  credibly support accurate multicolor rendering.
- **Black monochrome** - light/kraft paper, natural cardboard, pale fabric,
  stamps, dark-ink screen printing, engraving masks, light uncoated stock.
- **White/reverse monochrome** - dark paper, dark boxes, dark fabric,
  reverse marks, light-ink screen printing, dark signage.
- Embossing, debossing, foil, laser engraving, and one-color printing
  ALWAYS use a monochrome variant - never send the full-color mark as the
  reference for those processes.

A mark generated via `generate_logo_asset` draws with `currentColor`, so a
color/black/white variant is a CSS color change on its container in
Designer, not a new generation or a separate export step (see the logo-kind
instructions in `designerSystemPrompt.ts`). Render that variant to a raster
reference before passing it into `generate_image_asset`/`edit_image_asset` -
never ask the image generator itself to invent or recolor a variant, and
never derive one with manual path edits. If the needed variant cannot be
produced this way (for example, an existing user-supplied logo with no
`currentColor` construction), that is a gap to flag, not something to
improvise inside a mockup prompt.

## Prompt skeleton

Structure every mockup prompt in this order, reproducing the Brand Lock
header from SKILL.md first, then these sections:

```text
[BRAND LOCK - DO NOT DEVIATE]
<...as compiled in SKILL.md...>

[CREATE ONE FINISHED BRANDED MOCKUP]
<specific object/application, credible setting, camera, material, lighting,
composition, and one brand-specific art-direction idea>

[AUTHORITATIVE LOGO]
<reference> is the exact authoritative <full-color/black/white> logo.
Preserve its spelling, silhouette, geometry, proportions, internal negative
space, and exact color. Do not redraw, simplify, crop, stretch, outline, or
add effects.

[PLACEMENT LOCK]
Target surface: <exact object panel/face/material>.
Position: <exact alignment and location - e.g. horizontally centered, upper
third, optically centered on the panel>.
Scale: logo occupies <specific proportion> of the target surface, keeping
<specific clear-space margin>.
Orientation: align to <panel edge/seam/baseline>; follow surface perspective
without changing the logo's own proportions.
Color: use the specified variant exactly, and state why it contrasts
correctly with the material/background.

[PHYSICAL APPLICATION]
Render the logo using <credible print/emboss/foil/engraving/ink behavior>.
Respect folds, grain, perspective, occlusion, reflections, scale, and
real manufacturing limits.

No extra logos, pseudo-text, invented labels, warped marks, floating print,
unrelated props, arbitrary gradients, plastic sheen, or generic luxury
staging.
```

"Place the logo on the object" is insufficient - the prompt must contain
concrete placement, scale, alignment, clear-space, color-variant, and
material-application instructions, every time.

## Existing photograph route

When the user supplies the exact photograph to mock up, pass it as the base
reference to `edit_image_asset` alongside the logo reference, and preserve
every element of the original photo (subject, camera, lighting, materials,
folds, shadows, perspective, crop, background, ratio) except the target
branded surface.

## Text-bearing mockups

If the final mockup contains any readable text (wordmark, tagline,
packaging label, signage, interface copy), do not rely on a single
generation pass to render exact letterforms. Generate the scene first with
the target surface blank (no logo, no text, no invented graphics), then run
a second, controlled pass that adds the exact logo and exact literal text
against the approved typography and palette, changing nothing else in the
frame. State the literal copy, the exact font family/role, placement,
scale, and color in that second pass's prompt.

## Deterministic compositing over generation

Prefer deterministic placement over a generative pass when the target is
flat (a poster, screen, card, sign, or front-facing package), the source
logo already has transparency, and no physical deformation/folds/occlusion
are required. Reach for image generation only when the branding must
interact with fabric folds, curved packaging, embossing/debossing, foil,
print texture, reflections, surface wear, or realistic occlusion/
perspective. If a generation pass corrupts the logo, retry once with
stronger placement/geometry/color constraints using the same references; if
it fails again, fall back to deterministic compositing when the surface
allows it, or stop and report the limitation.

## Variant discipline across a set

For several mockups in one request: lock one base scene per mockup family,
vary only the requested application or colorway, and keep camera, lighting,
material, and composition fixed within that family for a real comparison
set - never regenerate a whole new scene for every colorway.
