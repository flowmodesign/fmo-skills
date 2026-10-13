---
name: flowmo-shot-direction
version: 1
family: gen-video
description: |
  Direct cinematic, physical action, product and dialogue shots with observable camera and performance details.
  Use when creating or reviewing task-specific branded assets and reference-led films.
  NOT for granting generation approval or overriding live tool capability contracts.
surfaces: [flowgen-chat, flowgen-image-node, flowgen-video-node, assistant-video, assistant-web, designer, mcp]
---

# Shot direction

For each shot specify its story purpose, subject/identity anchors, setting/scale, lens and framing, initial state, ordered action, camera path, motivated key/fill/rim light, palette/material texture, end state and cut. Bind the actual brand choices instead of writing only "on-brand cinematic". Keep one achievable action per short clip.

Cinematic/environment: choose lens perspective, camera height, depth layers, light source, exposure/contrast and motivated movement. Name visible environmental/material details and how composition changes. Avoid generic glowing particles as a substitute for a designed scene.

Action/fighting/sport: define participants, screen positions, direction of travel, contact/action/reaction and recovery. Track anatomy, gravity, momentum, occlusion and continuity. Frame wide enough to read the contact; reserve close-ups for readable details. Complexity and identities require compatible anchors; a claim of "strong motion" is not evidence the model handles the action.

Product: preserve the reference silhouette, proportions, labels, materials and mechanism. Specify camera movement separately from product movement and how the highlight reveals form. An invented product with a brand headline is not a faithful commercial.

Dialogue: specify exact dialogue, language, speaker count, acting beats, pauses, eye line and shot/reverse-shot boundaries. Require supported audio/lipsync or a separate lipsync workflow; generic native audio does not prove accurate speech. Check identity, phoneme timing, expression and audible wording. Do not bake subtitles when the deliverable requires editable text.

Continuity: establish an anchor, lens/framing geometry, identity, lighting roles and start/end state. Day/night may change light but must retain architecture. Do not send a style image as a literal first frame unless that opening is intended. Use separate models per shot only while preserving the shared continuity contract.

Review the actual clip for these criteria, including intermediate frames and the endpoint, before assembly. Describe any source departure plainly.
