# Social and marketing graphics contract

Create a branded social/marketing graphic once the slots it actually uses
are approved. This is a lighter, flattened sibling of mockup-contract.md -
read that one first when the request is a product/environment mockup rather
than a poster-style post.

## Required slots

Approved logo and palette are required for a branded no-text graphic. Add
approved typography only when readable text appears. Read those slots
separately from the Brand Lock - never force typography for a no-text post.

## Ask once, before generating

- Platform, aspect ratio, and number of outputs.
- The exact text that must appear - "no text" is a valid answer.
- Visual mode: a plain branded background/poster, or mockup
  photography/application with the branding composited in.
- Any supplied photography or product assets.

Preserve copy verbatim. Never invent sale language, a CTA, claims, prices,
contact details, or placeholder copy.

## Output contract

Social-media deliverables from this module are flattened raster graphics
(PNG/JPG), not editable templates - never promise or create a layered
document (SVG/PSD/Figma/Canva-equivalent) out of this module. When the user
needs exact, editable typography and layout instead of a rendered graphic,
build it as a page/section on the canvas (**flowmo-frontend-design**) so the
approved fonts render as real text, not this module's flattened image.

Supported modules:

- square post
- 4:5 feed post
- 9:16 story
- carousel cover/body/CTA cards
- channel banner/cover

## Canvas sizes and safe zones

The exact canvas for each platform (feed square and portrait, 9:16 story/
reel, 1.91:1 link and Open Graph images, the common display-ad sizes, and
YouTube/LinkedIn/X headers with their safe areas) lives in
`presets/graphic-formats.json`, alongside three rules every module here
follows:

- Critical content (logo, headline, CTA) stays inside the central 70-80% of
  the canvas unless that canvas states its own safe area.
- Paid ads keep text small relative to the image - one short headline and
  the CTA, detail moves to the post copy.
- The generated image layer is text-free; copy and the logo are added
  afterwards, either as live text and the real logo on a canvas element
  (preferred whenever the copy may change) or in the controlled second pass
  below, so a resize or a translation never needs a full regeneration.

For a set across several sizes, recompose per ratio instead of cropping one
master through the logo or copy.

## Plain branded poster

Use `generate_image_asset` (Designer) / `generate_image` (assistant web and
video surfaces) for the finished graphic.

Pass as image references, each labeled by role (see brand-lock-shape.md's
Reference discipline):

- The exact approved logo variant.
- The approved typography specimen, when the graphic carries text.
- Any official product/photo reference.

The prompt must state:

- Exact literal copy.
- Display/body font family names, and which text uses each.
- Logo placement, scale, clear space, and color variant.
- Text placement, hierarchy, alignment, line breaks, and contrast.
- Exact palette roles.
- The requested aspect ratio.

Omit the typography reference entirely for a no-text graphic. Confirm the
model's supported aspect ratios before generating; if the exact platform
ratio is not directly supported, generate the nearest supported ratio and
crop deterministically to the exact target ratio afterward, verifying the
final pixel ratio is exact and that no locked logo or copy crosses the crop
boundary.

## Mockup photography/application

1. Create or reuse the mockup photograph first, with its target surface
   left blank - follow mockup-contract.md for the base scene.
2. Reuse that exact base-scene result as the reference for a second,
   controlled pass (mockup-contract.md's "Text-bearing mockups" section)
   that adds the approved logo, the approved typography, and the exact
   copy to the blank surface.
3. Preserve the base scene's camera, crop, people, pose, lighting,
   materials, folds, shadows, perspective, environment, and background
   exactly - change only the controlled social artwork/application.

## Typography fidelity

The approved typography specimen is mandatory whenever text appears in the
output. Name the exact display/body families in the prompt - never infer
typography from the logo or palette alone.

After generation, check the output against the specimen. Retry once when
the letterform character is visibly substituted. If the model still cannot
reproduce the approved typography, report the limitation instead of
presenting the output as exact - or route the text to a real canvas
element instead of a generated image.

## Consistency and QA

- Exact copy and spelling.
- Correct platform ratio.
- Approved logo geometry and color variant.
- Approved display/body typography character.
- Readable hierarchy and text contrast.
- Approved palette only.
- No pseudo-text, extra logos, invented CTA, or unsupported claims.
- Every output in one set shares the same Brand Lock.

## Approval

Show every final graphic in chat and wait for ordinary user feedback before
calling the set finished. There is no separate approval-state store for
this skill (see SKILL.md's "Reading the lock from f0") - the conversation
itself, plus what is actually live on the design system/canvas, is the
record. Never infer approval from generation success, a vision-model
description, or the user's silence.
