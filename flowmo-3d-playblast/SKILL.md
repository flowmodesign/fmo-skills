---
name: flowmo-3d-playblast
version: 9
family: 3d
description: |
  Render and QC a fast, honest playback of a 3D scene's camera over its
  animation range - before spending on a final render or handing the scene
  to a video model. Covers when to playblast, the two output tools and their
  defaults, the vision QC checklist, and the hand-off into video generation.
  Use when: "check the animation", "preview this", "does this read",
  "playblast", "give me an mp4 of the scene", before feeding a scene into
  generate_video. NOT for: a final composition render (that is the
  Electron/Cloud render of a compositor document - a `videoCompose` node,
  natively, or the separate f0 editor-backed `videoComposition`), audio,
  motion blur, or path-traced output.
surfaces: [scene3d, flowgen-3d-node, flowgen-chat, mcp]
tools: [scene3d:render_scene_playblast, scene3d:extract_scene_frames, scene3d:apply_motion_preset, scene3d:keyframe_scene, scene3d:inspect_scene, flowgen-3d-node:render_scene_playblast, flowgen-3d-node:extract_scene_frames, flowgen-3d-node:apply_motion_preset, flowgen-3d-node:keyframe_scene, flowgen-3d-node:inspect_scene, flowgen-chat:run_node, flowgen-chat:list_node_editor_tools, flowgen-chat:invoke_node_editor_tool, flowgen-chat:screenshot_node_editor, mcp:run_node, mcp:list_node_editor_tools, mcp:invoke_node_editor_tool, mcp:screenshot_node_editor]
triggers: [playblast, blockout, previz, motion reference, preview the animation]
chain_with: [flowmo-3d, flowmo-3d-shot-language, flowmo-video-prompt-craft]
---

# flowmo 3D playblast

"Playblast" means what it means in Maya: a fast, honest render of the
scene's camera over its animation range, straight off the WebGL canvas, used
to judge motion before spending on a final render or a generative video
pass. Preserve geometry, materials, layers and particles, with every post-FX
pass and path tracing disabled. This clean preview has no audio or motion blur
and is not a substitute for the Electron/Cloud render of a composition.

On FlowGen/MCP, target the Scene3D node with `list_node_editor_tools` and
`invoke_node_editor_tool` (MCP prefix `flowgen_`); pass the discovered inner tool
name and serialized arguments. These deterministic tools are scoped to the node
without an f0 iframe. In the native scene agent, call the scene tools directly.
Discovery is an outer FlowGen/MCP tool, not an inner scene operation: never pass
`list_node_editor_tools` as the `tool_name` to `invoke_node_editor_tool`.

## Director and modeling specialist

The shared main agent may author geometry directly through the original owner's
currently registered scene tools. For a standalone scene with a supported
modeling-delegation port, it may instead use `run_node` with
`scene_modeling_task: {taskId, brief, reviewFindings?}` on the existing scene node.
Delegation is optional; do not require another agent or move an embedded website
scene into a standalone node to obtain it. Inspect the actual actor roots before
animating them, and make an early moving rough pass before environment polish.
The main agent retains film direction, route, speed, cameras and acceptance.

Use the original delegation allowance and progress policy when that port is
actually selected; this manual grants no retry, model, generation or spending
authority. Preserve the same taskId for an authorized repair and carry concrete
review findings. Connect references only through supported original sockets and
retain their motion-versus-appearance roles. Inspect saved geometry and actual
camera frames after an attempt; a child receipt is not visual approval. Repair
only located remaining defects through the current owner and its legal tools.
Do not delegate the entire film or evade a failed attempt by renaming the task.
Within the native Scene AI, use its own current declarations; outer FlowGen
calls are not inner scene operations. Source-only geometry remains source work
and does not acquire a moving-render requirement from this manual.

## Blocking direction and visible delivery

Author clean previz, not a final glamour render. Do not add bloom, DOF,
vignette, SSAO, SSR, lens flares or custom screen effects. Remove existing
post passes for a requested clean blockout; use balanced key/fill lighting,
matte materials and contact shadows. Dusk must remain legible. Capture omits
post-FX without modifying the saved document's final-look settings.

Follow the user's previz references for silhouettes and detail. Recognizable
cars need proportioned chassis, hood, cabin, windshield/side windows, four
separate wheels, arches, bumpers and light shapes, made from grouped editable
primitives. Roads need markings/curbs; warehouses need structural and
door/window divisions. Bare boxes cannot pass recognizable vehicle blocking.

Establish meter scale (a passenger car approximately 4–5 m long). Measure
route distance divided by shot seconds, then multiply by 3.6 for km/h. For a
high-speed chase, aim at purposeful 25–35 m/s straights, a slower credible
turn, and reacceleration. Keep approved timing and extend road/camera routes
as needed; do not speed up the whole film. Animate continuous actor travel
across cuts, steering and restrained body roll; calculate wheel rotation
from traveled distance / wheel radius, not an arbitrary constant spin.
Use linear interpolation for steady travel; do not ease each segment to a
stop. Stage foreground parallax and close passes so speed reads without FX.

Build a complete moving rough pass before detailing the location. Establish
scale, route, recognizable actor silhouettes and four wheels, actual movement,
and all requested camera cuts with only the environment needed to read geography.
Render that moving pass early. Then refine actor shapes, lighting and architecture.
Do not spend many model rounds on lane markings, poles or warehouse decoration
while no actor moves and no camera sequence exists. Remove default demo objects
when building a brand-new scene; preserve existing user work when editing.

Use complete related edit batches instead of one model call per property.
`edit_scene.operations` accepts inline addNode transforms/materials. Give a new
node/camera `resultRef:"leadCar"`, then use `nodeId:"@leadCar"` or
`parentId:"@leadCar"` in later operations of the same batch. Configure and parent
vehicle parts together; use the returned `references` actual IDs in future calls.
Batch references are not persistent scene IDs. Supply complete replicator patterns
and materials when replacing them; scalar spacing and numeric geometry are required.

Save visible phases: geography/route, recognizable actors, actor animation,
cameras/cuts, moving QA. Before a long tool call, briefly say what is happening;
after a saved phase, say what landed and what comes next. Use actual render
frame progress, not invented percentages or repeated status polls.

Watch a moving playblast at 1x. Judge requested pace, wheel/steering coherence,
clearances/collisions, continuity, framing and exposure. Stills alone cannot
approve a chase. A scene that merely moves slowly does not satisfy high speed.

## 1. When to playblast

Follow the current human's requested output and the existing shared stage
selector. A bounded saved source or keyframe edit does not require a new MP4,
playback or independent review. An animation-writing tool alone does not make
an export request. For requested moving QC or a scene motion reference, inspect
an early moving pass before final rendering or downstream video generation.
Use the original owner's available playback or capture method; only an actual
requested MP4/playblast export uses `render_scene_playblast({output:'mp4'})`.

When the exact FlowGen scene owner exposes `observe_scene_playback`, it passively
measures an already-playing native viewport after the original source ACK. It
never starts playback, pays for an MP4 or observes an embedded website host.
Applied-sample draw timing and FPS do not prove pixel motion, full-duration
coverage, audio or visual quality. Preserve those separate requested checks;
missing owner/session support is a concrete limitation, not a reason to borrow
another node or substitute an unrequested paid render.

On an authorized unattended moving-QC run, inspect one actual moving pass. After two identical failures, change the move,
parameters or supported method; do not repeat the same failed call. Continue
within the authorized scope and budget. Stop for cancellation, exhausted
authority/budget, or a concrete dependency that cannot be resolved in scope.

## 2. The two tools

- **`render_scene_playblast`** - `output: 'mp4'` for the user, `'frames'`
  only when a downstream socket needs stills (first/last frame hand-off),
  `'contact-sheet'` for your own QC judging pass.
- **`extract_scene_frames`** - defaults to the non-uniform fractions `0.0,
  0.23, 0.41, 0.68, 0.87` of the animation range, tiled into one contact
  sheet. Uniform steps alias with a cycle: every sampled frame looks
  identical and you'll wrongly conclude the animation is broken - or
  miss that it actually is. Off-beat fractions expose the real phases.
  For asset QC after `generate_3d_model` / `repair_model` /
  `merge_model_clips`, pass `frame: 'fit'` with a `nodeId` for an
  auto-framed three-quarter view - it computes the node's world bbox
  and frames it with a 10% margin without writing anything to the doc.

## 3. QC checklist, in this order

1. Do the sampled phases differ at all?
2. Is the motion LOGIC right - a dolly actually gets closer, a wing's
   visible area shrinks on the upstroke, an orbit keeps the subject
   centered?
3. Does the camera ever leave the subject, or clip through geometry?
4. Any tearing or pinching at joints?
5. For a loop: are the first and last sampled frames identical (no seam)?
6. Any hard start/stop that wants an ease instead?

Accepted defects - do not loop forever chasing these: slight pinching at a
procedural rig's limb roots (typical of auto-skinning), no per-toe detail.

**Repair moves**, each an existing tool:
- `apply_motion_preset` with a smaller `amount`, or a different preset.
- `keyframe_scene` with an `ease` - `power2.inOut` for a dolly/crane,
  `power3.out` for an arrival, LINEAR for steady actor travel, a constant-speed loop or a
  scroll-scrubbed channel. Never ease each chase segment to a stop.
- `edit_scene setCamera` for framing.
- `attachCameraToPath` when a hand-keyed path wobbles instead of tracking
  cleanly.

## 4. Frame rate and duration

24fps for judging motion; 30fps for delivery into a composition, matched to
the composition's `videoCanvas.fps` when the playblast is wired to one. A
loop preset renders for exactly one cycle (its `defaultDurationSec`) so the
seam is actually visible in the sample, not hidden by extra repeats.

## 5. Camera and lens are read back, never guessed

Call `inspect_scene section:'cameras'` before choosing a `cameraId` - the
playblast's burn-in shows the lens in mm, so a wrong guess (calling a 24mm
"wide" when the scene's active camera is actually 50mm) is visible to the
user immediately and should be caught before rendering, not after.

Legacy camera IDs in the scene's `cameras` collection are not mesh/node IDs and
cannot use `setParent`. For bumper-mounted and tracking shots, keyframe their
world position and aim with the actor's motion. Only parent an actual camera
node when inspection confirms it exists in `nodes`. Headless tool calls rehydrate
the scene and may mint new session timeline IDs; inspect persisted timeline names,
tracks and keyframes to verify motion instead of treating an ID change as lost work.

## 6. Blockout → appearance references → video

This is the 3D-previz workflow demonstrated by Higgsfield 3D Jutsu:
<https://higgsfield.ai/blog/higgsfield-3d-jutsu>. In Flowmo, keep an editable native
Scene3D node for blocking, generate/review character and location look references,
and render its actual camera timeline as a motion-reference clip. Distinguish
**approved movement** from **approved appearance**: primitives define framing,
subject action, camera path and timing; the linked Brand and reviewed images
provide identity, materials, lighting and finish. Never discard generated look
references or replace the blockout's direction with an unrelated generic prompt.

For each shot, retain its shot id, measured timing, reviewed clean plate, motion
reference and intended final appearance. Read `get_model_capabilities` and
`get_node_sockets` before creating the video node: use a model that accepts the
required reference-video role plus appearance images. Wire the Scene3D node's
`video_out` to that model's supported video input, and appearance references to
its supported image inputs. `scene_out` is an editable scene, not a clip.
A model that only edits a source video is not interchangeable with a model that
accepts a motion guide. If the route is unsupported, choose another compatible
model or a supported first/last-frame route; do not silently drop the playblast.
Keep final text and requested flat graphics as live compositor layers.

### Supported handoff variants

- `extract_scene_frames({fractions:[0,1], sheet:false})` -> two stills ->
  a video-gen call's first/last frame sockets (capability `firstFrame` /
  `lastFrame`, see `flowmo-video-prompt-craft`). Use only the LAST frame when
  the look is a reveal (the cover-animator rule - an end frame guarantees
  landing on the approved frame, a start frame drifts).
- The playblast mp4 itself -> the supported reference-video input discovered on the selected model, as a MOTION reference only. State plainly what a playblast can
  promise a video model - composition, camera path, timing - and what it
  cannot - materials, lighting (those still come from the prompt).
- `render_scene_playblast({output:'frames'})` subsampled to a handful of
  ordered frames feeds a model's ordered-keyframe input where one exists.
- A camera-prose sentence read off the active animation ("slow 360 orbit,
  12s, 50mm, subject centered, no cuts") belongs in the video prompt
  whenever a playblast is chained into `generate_video` - describe the move
  in words even when also attaching the mp4.

## 7. What a playblast is not

No audio. No motion blur. All post-FX and path tracing are off - the playblast always
shows the raster look, never the path-traced one. A standalone scene playblast
is distinct from the website runtime's own scene and interaction playback.
It does not establish that an embedded website animation played, create an
interaction trigger, or replace evidence from the website's original runtime.
Use only that owner's supported playback/capture path and report its limits.
