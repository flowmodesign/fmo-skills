# Scoped design detection

Use the actual deliverable, linked brand and visual targets as scope. If source inspection is available, limit it to the deliverable's owned frontend/text/style files; exclude dependencies, generated bundles/catalogs, build output, lockfiles, vendored code and unrelated application chrome. Source matches identify candidates. Confirm visual findings in the current rendered revision; confirm motion findings in playback.

Every candidate needs a location, revision, viewport/frame/time and missed requirement. Triage it as confirmed, intentional, protected or unverified. The package does not itself bundle or expose an executable scanner; use one only when a supported tool or local helper is actually present. Never claim that reference guidance executed a scan.

| Candidate group | Useful source/render lead | What makes it a confirmed finding | Intentional exceptions |
| --- | --- | --- | --- |
| Atmosphere and surface effects | Repeated gradients, glow, blur or heavy shadows | Effects obscure content, flatten hierarchy or visibly diverge from the target. | Flowmo glow/gradient treatments, approved glass, physical lighting, branded colors and generated imagery. |
| Typography | Gradient text, emphasis font swaps, very similar sizes or oversized pitch text | Text cannot be read/scanned or the hierarchy contradicts the brief. | Brand fonts, wordmarks, editorial type and deliberate hero treatments; a font name alone proves nothing. |
| Labels and icons | Repeated badges, kickers, emoji or tinted icon tiles | They duplicate labels, imply false state or make the intended action harder to find. | Real status/category labels, accessible cues, meaningful iconography and approved mascots/logos. |
| Palette and state | Saturated status boxes or many semantic hues | State is ambiguous, contrast fails or palette use conflicts with linked tokens. | Familiar error/success conventions, intentional multicolor systems and product-specific signal colors. |
| Surfaces and corners | Nested cards, repeated maximum radii, clipped borders | Grouping shrinks usable content, obscures relations or breaks visible geometry. | Separate embedded objects, approved pill shapes and designed nested surfaces; repair geometry without restyling the brand. |
| Layout and spacing | Equal-weight grids, one gap value or ornamental ordinals | Priority and relationships are lost; numbering asserts an order that does not exist. | Calendars, photo walls, ordered steps and consistent grids serving the actual content. |
| Evidence-bearing content | Large metrics or unsupported status decoration | The visual implies measured proof or live state absent from the evidence. | Verified metrics with retained sources; route copy/fact repair to the content method. |
| Interaction and movement | Broad transitions, scaling hover or rotating loaders | State feedback distracts or obscures function; playback shows wobble, clipping, timing or continuity errors. | Purposeful spring physics, spatial movement, energetic brand motion and cinematic effects. |
| Template drift | Generic dark terminal, cream editorial dashboard or stock component combinations | The chosen visual language conflicts with the intended job, brand or reference. | Any of these styles deliberately selected for this deliverable; replacing one fashionable template with another does not repair drift. |

Flowmo's own glow, logos, imagery and linked brand tokens are affirmative intent evidence. Do not remove them merely because an upstream tell matches their code. Check how the effect performs in the deliverable. If it causes a verified readability or layout failure, make the smallest functional repair that preserves the treatment and cite the evidence.

Do not replace artwork with a letter, primitive SVG, placeholder panel or generic icon to satisfy a scanner. Preserve approved asset identity and native editability. A clean scan does not prove design quality; a hit count does not measure it. Re-render the saved repaired revision and replay affected motion before recording a pass.
