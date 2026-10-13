---
name: flowmo-raster-graphics
version: 1
family: image
description: |
  Design raster graphics, typography and illustration with brand-aware hierarchy and delivery checks.
  Use when an image needs layout, readable copy, icons, poster design or a consistent graphic series.
  NOT for flattening requested editable text, logos, UI or layout into a generated image.
surfaces: [flowgen-chat, flowgen-image-node, assistant-video, assistant-web, designer, mcp]
---

# Raster graphics

First establish the deliverable: a raster image, an editable design, or a native layout containing generated visual assets. Editable text, logos and UI belong in native elements. Use image generation for the parts that benefit from raster synthesis.

Distinguish typography/layout, illustration, icons and a style-consistent series. Define output dimensions, crop/safe area, exact copy, hierarchy, alignment grid, type roles, palette roles and the reference role. Draft is a separate quality/cost intent, not an illustration category.

Typography/layout: specify a clear focal point and reading order. Keep the copy list exact and bounded. Judge every letter, spacing, contrast, alignment and visual balance at the intended display size. A large impressive image with incorrect copy fails the job.

Illustration: define silhouette, shape language, line weight, texture, perspective and detail density. Ground the visual metaphor in the brief; avoid generic gradients, floating glass and glowing decoration when they do not serve it. Check consistency across a series, not only one attractive result.

Icons: establish shared optical size, stroke/fill rules, corner treatment and legibility at the actual small size. Prefer the established vector/icon system when appropriate. A generated raster icon must still read without relying on tiny labels.

Editing: name the preserved regions and requested change separately. Check unintended movement, replacement, identity loss and background contamination. A model that accepts references is not automatically qualified for precise editing.

Pass these concrete requirements to routing. Assess precise-copy, illustration consistency and editing fidelity separately in model evaluations; one general image preference score cannot certify all three.
