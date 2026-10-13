---
name: flowmo-3d-shot-language
version: 2
family: 3d
description: |
  Camera-move vocabulary for the 3D scene: the 16 shipped motion presets
  (when to reach for each), plus a further set of named moves not yet built
  as presets - with instructions to build each today with keyframe_scene and
  attachCameraToPath - and the ease doctrine by move phase. Use when: "move
  the camera", "animate the camera", "give me a [named move]", "the camera
  motion feels robotic/wrong", "what camera moves are available". NOT for:
  object/creature animation (use flowmo-3d-procedural-motion), or a full
  scene recipe (use flowmo-3d-scene-recipes).
surfaces: [scene3d, assistant-video, flowgen-chat, flowgen-3d-node, mcp]
tools: [scene3d:apply_motion_preset, scene3d:keyframe_scene, scene3d:edit_scene, scene3d:inspect_scene, scene3d:extract_scene_frames, scene3d:render_scene_playblast, flowgen-3d-node:apply_motion_preset, flowgen-3d-node:keyframe_scene, flowgen-3d-node:edit_scene, flowgen-3d-node:inspect_scene, flowgen-3d-node:extract_scene_frames, flowgen-3d-node:render_scene_playblast, flowgen-chat:list_node_editor_tools, flowgen-chat:invoke_node_editor_tool, flowgen-chat:screenshot_node_editor, mcp:list_node_editor_tools, mcp:invoke_node_editor_tool, mcp:screenshot_node_editor]
presets: presets/camera-moves.json
triggers: [playblast, blockout, previz, cinematic camera, camera motion, camera lens]
chain_with: [flowmo-3d, flowmo-3d-playblast, flowmo-video-prompt-craft]
---

# flowmo 3D shot language

Two tiers of camera vocabulary: 16 shipped presets you call by name, and a
further set of named moves that aren't presets yet - build them today with
`keyframe_scene` (and `attachCameraToPath` for anything that travels a
curve) using the exact numbers in `presets/camera-moves.json` as a starting
point, until each graduates into `apply_motion_preset`.

On FlowGen/MCP, target the Scene3D node with `list_node_editor_tools` and
`invoke_node_editor_tool` (MCP prefix `flowgen_`); pass the discovered inner tool
name and serialized arguments. These deterministic tools are scoped to the node
without an f0 iframe. In the native scene agent, call the scene tools directly.

## Direct each shot before moving the camera

For a film or motion-reference playblast, first write a compact shot table:
`shot / in-out seconds / dramatic purpose / subject action / framing / lens mm /
camera start-end path / aim target / focus cue / lighting / transition`.
Use the user's script and reference timing; preserve approved shot boundaries.
A camera move must reveal information or change the emotional distance. Do not
apply the same orbit to every shot, invent extra cuts, or extend the duration.

- Choose a wide, medium, close or detail frame deliberately. Leave lead room in
  the travel/gaze direction, headroom and clear silhouettes. Stage foreground,
  subject and background at different depths; check parallax and occlusion.
- Use `addCamera` / `setCamera` with **focalLength** in millimetres (or `fov`,
  not both). Combine lens and camera distance: a close 24–35mm camera feels
  spatial/energetic; a more distant 50–85mm camera can isolate expression or a
  product detail. Read the actual camera back rather than naming a fictional lens.
- Track moving subjects with `lookAtNodeId`. Use a fixed `lookAt` point for a
  deliberate reveal. Inspect parent transforms and aim constraints before keying
  rotations; a tracking constraint overrides free Euler rotation.
- Block subject motion and camera motion together, in seconds. Maintain screen
  direction and spatial continuity across cuts unless the brief calls for a
  disorienting reversal. Finish an action or hold long enough for its beat to read.
- Declare focus intent (which subject, near/far handoff and timing). Native DOF
  is a post pass with supported focus parameters; inspect its schema and units.
  It is not a physically simulated aperture, anamorphic lens or shutter. Keep
  motion-reference previews clean enough to preserve silhouettes and motion.
- Shape motivated key/fill/rim light, readable tonal separation and the reference's
  palette. A grey primitive preview may intentionally defer materials to the
  beauty pass; it must still communicate depth and action. Bloom cannot fix a
  white, cropped, flat or poorly staged shot.

## Visual acceptance is part of directing

Render `extract_scene_frames` at the start, middle, end and just before/after
cuts. LOOK at the returned images. Compare shot size, subject placement, lens,
camera height, silhouettes and intended action to the references. Then render
and watch the moving playblast: a contact sheet cannot prove a smooth camera,
a timed beat or a clean cut. Repair framing/keys in the same scene and repeat
review before connecting its `video_out`. A successful tool call is not approval.
Do not claim motion blur or depth of field exists because the prompt mentions it.
Native playblasts have no motion blur; put the final shutter/motion-blur direction
in the video-generation handoff if the chosen model supports the required route.

## The 16 shipped presets - reach for these first

`apply_motion_preset({preset, cameraId | nodeId, amount?, durationSec?,
startSec?})`. Values are RELATIVE to the current pose - no coordinates to
compute. `amount` scales the move (1 = as authored); that's the answer to
"a bit more" / "much subtler."

**Camera:**

| Preset | When to use |
|---|---|
| `dollyIn` | move closer along the lens axis - tension, focus, intimacy |
| `dollyOut` | move away - release, context, scale reveal |
| `orbit` | a full circle around the subject, subject stays centered |
| `turntable` | product-style 360, usually paired with a `group` rig instead of hand-circling the camera |
| `arcShot` | a partial arc - reveals a side without a full orbit |
| `craneUp` | rise vertically - establishing, grandeur |
| `craneDown` | descend vertically - grounding, arrival |
| `dollyZoom` | the vertigo shot - dolly + counter-zoom, unsettling/dramatic |
| `handheldDrift` | small continuous ambient sway - a living, unposed feel |
| `whipPan` | fast pan - a hard cut-like transition without a cut |
| `pullBackReveal` | a slow pull-out that reveals scale/context at the end |

**Object:** `riseAndSettle` (entrance, settles into place), `floatBob`
(idle, ambient bob), `objectSpin` (continuous rotation), `popIn` (a sharp
entrance), `spinReveal` (a spin that doubles as a reveal).

Aiming a camera preset at a node (or vice versa) is refused, not guessed -
match `cameraId`/`nodeId` to the preset's `subject`.

## Ease doctrine by phase (from `flowmo-3d`)

Keys are LINEAR by default in `keyframe_scene` - constant speed, hard start,
hard stop. Give it an ease or it reads like a robot:

- Arrival into a hold: `power3.out`.
- A dolly/crane/push/pull in motion: `power2.inOut`.
- A pop/snap accent: `back.out(1.4)`.
- **Stay LINEAR**: a constant-speed LOOP (orbit, turntable, a conveyor -
  easing stutters the seam) and any scroll-scrubbed channel, where the
  scroll itself supplies the timing, not the ease curve.

## New moves - build today, preset later

None of these exist as `apply_motion_preset` entries yet. Build each with
`keyframe_scene` tracks directly (position/rotation/fov channels, DEGREES
for rotation, relative to the current pose) plus `attachCameraToPath` for
anything that rides a curve. `presets/camera-moves.json` gives each one a
full entry in the shape a future `Scene3DMotionPreset` would take - treat it
as a spec to build against, not as something you can call by id today.

- **`truckLeft` / `truckRight`** - lateral movement, camera facing held
  constant (distinct from a pan, which rotates in place). Keyframe
  `position` on the lateral axis only.
- **`pushInSmall`** / **`pullOutLarge`** - `dollyIn`/`dollyOut`'s smaller and
  larger cousins for when "a bit more" via `amount` still isn't the right
  shape of move (a small push wants a shorter distance AND a gentler ease,
  not just a scaled-down large pull).
- **`arc30`** - a specific 30-degree partial arc, a fixed-amplitude sibling
  of `arcShot` for when the brief names an exact angle instead of "some."
- **`boomUp`** - a vertical rise that stays FRAMED on the subject the whole
  time (unlike `craneUp`, which is a freer ascent) - keyframe position.y
  and rotation together so framing holds.
- **`lateralDollyRackFocus`** - a lateral dolly with a depth-of-field pull:
  keyframe the camera's `position` track AND a second track on the `dof`
  post-pass's focus parameter (`{kind:'post', passId, key:'focus'}`) racking
  from one subject distance to another over the same window.
- **`orbitalTilt`** - an orbit that also tilts the camera's pitch across the
  arc, rather than staying level - two simultaneous tracks: an orbit-style
  position sweep plus a rotation.x track.
- **`probePass18` / `probePass29` / `probePass47`** - a close pass BY the
  subject at a fixed angle off the subject's forward axis (18/29/47
  degrees), camera travels past rather than orbiting around. Build with
  `attachCameraToPath` on a short guide path set at the named angle.
- **`fpvDive`** - a first-person dive toward and past the subject, riding a
  guide path. Build the rail: `addNode path` with `bevel: null` (a GUIDE
  path, never beveled - a beveled path renders a solid tube down the middle
  of the shot), then `attachCameraToPath({cameraId, pathId, role:'camera',
  mount:'onCurve'})`, then keyframe the returned offset target 0 -> 1.
- **`spiralCrane`** - an orbit that also rises, i.e. a spiral: combine an
  orbit-style position sweep with a `position.y` ramp over the same
  duration.
- **`crestAndTiltToPlumb`** - the camera crests over the subject then tilts
  down to a straight-down (plumb) view - a position arc over the top
  followed by a rotation.x sweep to -90 degrees.
- **`eyeLevelGlide`** - a slow, level, ambient lateral glide at subject eye
  height - a gentler, more deliberate sibling of `handheldDrift` (which is
  jittery/ambient; this is smooth and directional).
- **`motorizedDrift`** - a very slow, mechanical-feeling continuous drift,
  LINEAR eased (never `power*`) to read as motorized rather than organic.
- **`speedRampSlowMo`** - a time-warp on a clip's own playback speed. **Not
  buildable today** - f0 has no clip-level time-remap track yet. Tell the
  user this explicitly rather than faking it with a slower camera move,
  which is a different effect (camera speed, not footage speed).
- **`finalHold`** - not a move at all: a deliberate STILL beat at the end of
  a sequence - the last keyframe simply repeats with no further motion for
  the hold's duration. Useful as the closing track in a chained sequence
  feeding `flowmo-video-prompt-craft`'s continuity rules.
- **`levitation`** (object, not camera) - a slow vertical float with a
  gentle rotation drift, siblings with `floatBob` but larger amplitude and
  a slower period, for an object meant to read as weightless rather than
  merely idling.
- **`explodeAlongAxis`** - a GROUP operation, not a single-subject preset:
  even spacing of several components along one axis, keyed out and back in
  reverse order. This is a scene recipe, not a single camera/object move -
  see `flowmo-3d-scene-recipes`'s exploded-product recipe for the full op
  sequence.
- **`ignitionRise`** - a material/layer effect (an emissive sweep, a
  wireframe-to-PBR opacity crossfade along an axis), not a transform-based
  camera or object move - `Scene3DMotionPreset` tracks only cover position/
  rotation/scale/fov/lens, not material channels, so this cannot become a
  literal preset entry without a new channel kind. Build it directly with
  `keyframe_scene` targeting the material/layer `ExposedTarget` instead -
  see `flowmo-3d-scene-recipes`'s blueprint-to-building recipe.

## References

`presets/camera-moves.json` - every new move above, in the shape of a
`Scene3DMotionPreset` (`id, subject, category, intensity, defaultDurationSec,
loop, description, keywords, tracksSketch`), as a build spec for whoever
promotes it into `src/lib/scene3d/motion/presets.ts`.

## Multiple cameras and hard cuts

Use `edit_scene` operation `setCameraCuts` with `durationSeconds` and the complete
`cuts` list `{time,cameraId,name}`. Times are absolute seconds, start at zero and
strictly increase. Then `keyframe_scene` target `{kind:"progress"}` linearly from
0 at time 0 to 1 at the full runtime. This editable sequence drives preview and
playblast; animate each camera and every vehicle on that same continuous clock.
A fixed `cameraId` passed to capture intentionally bypasses the sequence for
per-camera QC. Inspect `cameras` to verify the saved cuts before rendering.
Never interpolate one camera between viewpoints when the brief calls for cuts.
