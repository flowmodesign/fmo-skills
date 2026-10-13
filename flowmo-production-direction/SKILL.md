---
name: flowmo-production-direction
version: 1
family: gen-video
description: |
  Task-specific image and film direction, capability-led model selection and verifiable delivery.
  Use when creating or reviewing task-specific branded assets and reference-led films.
  NOT for granting generation approval or overriding live tool capability contracts.
surfaces: [flowgen-chat, flowgen-image-node, flowgen-video-node, assistant-video, assistant-web, designer, mcp]
---

# Production direction

Classify each asset separately: graphics/typography, people/identity, physical product, environment, illustration/editing; for video add cinematic, complex action, dialogue, continuity and editable graphics. Draft/final is a separate axis. A reference film can require several categories and models.

Read the actual brand logo, token palette, type, video master, reference images and footage. Assign each reference a role: identity, look, motion analysis, start frame or end frame. Analysis footage is not automatically a video-edit input. A physical reference or motion-control input must use the model's declared mode.

Plan a complete editorial timing map: every cut, its purpose, framing, camera, action, light, palette, generated footage versus native layers, exact duration and transition. Cover the whole runtime without stretching four generic clips to fill it. Choose editability per element: exact text, real logo assets, flat UI/diagrams and requested editable motion stay native; complex scenes, dimensional objects and materials may be generated plates with clean space for those overlays. Do not require an entirely native scene when only its text and flat graphics need editability.

Choose models by legal inputs, resolution, duration, audio/lipsync, continuity, cost and task-specific evaluation. Product preferences are provisional; price, release date and vendor adjectives are not quality evidence. Use task-specific skills: cinematic/action/dialogue direction for footage; image subject craft for raster assets; existing video prompt craft for reference roles; native compositor motion direction for editable graphics.

A reusable evaluation must record exact model/provider/version/settings, task category, inputs and reference roles, prompts, seeds where supported, output, date, actual cost/latency, failures/retries, and blind reviewer scores. Judge prompt adherence, subject fidelity, temporal motion/causality, brand, typography, and delivery constraints separately. Compare quality per successful delivered asset, including retry cost. No scored examples means unvalidated preference, not evaluated default.

Validate actual generated duration and inputs, native layer editability, dense motion frames, audio coverage and full playback. A successful tool receipt is not visual approval. Repair the same document before declaring delivery.

## Visual proof before final production

For reference-led work in every format, inspect the actual source and brand visuals before creating a final artifact. Extract representative frames per measured source shot with frameExtract (mode:time, pickedTimeSeconds); extract useful brand-video frames too. Feed source composition and brand identity as explicitly assigned image references into a generated/edited shot target. Footage plates must exclude baked type/logos/flat overlays whenever these must remain editable. Create a separate layout proof with copy for native graphics when needed. Reuse an adequate existing/native-rendered proof rather than forcing paid raster generation for small edits.

Use inspect_visual_target to compare actual pixels, then review_visual_target to record specific evidence for framing/action, palette/material/light, brand fidelity, depth/contrast and editability. A failed target needs editing or regeneration and reinspection within the approved budget. Routine internal review and retry must not become a new human chat turn. Attach visualTargetNodeIds to downstream consumers and connect approved plates to compatible video frame/image inputs. Preserve shot ordering and pass each target, its exact director brief and native copy/choreography to the compositor. Review dense motion, full playback and audio before declaring delivery. A storyboard skeleton or successful graph/tool receipt is not visual approval.
