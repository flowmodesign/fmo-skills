---
name: flowmo-native-motion-execution
version: 1
family: animation
description: |
  Execute reference-led motion as real editable layers and verify timing, camera motion and delivery.
  Use when titles, UI, diagrams, logos or motion graphics must remain editable in their native editor.
  NOT for replacing native choreography with generated footage or declaring an opened editor finished.
surfaces: [flowgen-chat, assistant-video, assistant-web, flowgen-web-node, designer:page, designer:deck, designer:motion, designer:ad, designer:video, mcp]
tools: [assistant-web:author_animation, flowgen-web-node:author_animation, designer:set_motion]
triggers: [editable motion, editable titles, native motion, motion graphics, kinetic typography]
renditions:
  compositor: [assistant-video:tool:read_compositor, flowgen-chat:tool:invoke_compositor_tool]
  designer-motion: [designer]
  web: [assistant-web, flowgen-web-node]
---
# Native motion execution

Keep requested text, graphics and controls as independently editable native elements; generate complex plates only inside the agreed per-element editability boundary. A skill grants no tools, budget or approval. Discover the owning editor's schema and use its engine, timing units and supported values; never borrow commands/eases from another editor.

Read the saved target/revision, successful assets and existing motion first. Reuse stable IDs and edit in place. Respect operation IDs, preconditions and range contracts; inspect failed arguments and repair without duplicates. Plan entry/action/hold/exit and readable transitions. Real UI motion shows an action and consequence, not uniform fades. Use supported depth/cameras only; flat scale is not true 3D.

Bind actual brand type, tokens, logo and visual assets. Match reference material, radius, edge and icon treatment; keep contrast/safe areas through movement. Verify saved motion, every scene/transition and continuous playback with audio. Still frames and numerical samples cannot certify smoothness. Repair the changed revision, then verify the actual playable output and native editability before claiming delivery.

More execution craft: [execution reference](references/execution.md).
