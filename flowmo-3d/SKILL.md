---
name: flowmo-3d
version: 1
family: 3d
description: Build and edit 3D scenes in flowmo (f0) and flowMotion — meshes, GLB models, PBR materials + the material layer stack, particles & replicators, effectors, cameras/lenses/camera rails, post-FX, procedural textures, displacement, mirrors — plus cinematic keyframes, the motion-preset library, and wiring any of it to the animation timeline. Use for any "3D / scene / GLB / material / particles / shader / camera / animate the camera / post effect" request on a canvas. Driven by the scoped 3D tool family (inspect_scene, edit_scene, keyframe_scene, apply_motion_preset and friends). Use when the canvas has (or needs) a Scene3D element. NOT for web page layout, CSS, or ordinary DOM/GSAP motion — see flowmo-frontend-design / flowmo-motion-design for those.
surfaces: [scene3d, flowgen-3d-node, mcp]
tools: [inspect_scene, edit_scene, set_shader_material, generate_3d_model, keyframe_scene, apply_motion_preset, animate_scene_field, render_scene_playblast, extract_scene_frames, inspect_model, repair_model, merge_model_clips, f0_screenshot]
triggers:
  - 3d scene
  - glb
  - particles
  - camera rail
  - shader material
  - post effect
---

# flowmo 3D scenes

A 3D scene is a **Scene3D interactive element** on the canvas. Every tool here targets the **currently selected** Scene3D element (you never pass an element id) — so select the scene first. Available in BOTH the website editor (f0) and video mode (flowMotion). Verify visually with **`f0_screenshot`** after edits.

## The seven tools
- **`inspect_scene`** — READ the open scene, never changes it. Args combine: `nodeId` (a camera id works too), `+layerId` / `+modifierId` / `+meshKey`, or `passId`, `fieldId`, or `section` (`index|render|environment|post|exposed|cameras|animation`), `depth` `summary|full`. Call it when correctness depends on real values ("a bit less rough"); don't call it for what the CURRENT SCENE summary already lists.
- **`edit_scene`** — everything structural, as a **batch of operations applied in order**.
- **`set_shader_material`** — custom GLSL on a mesh, a `shaderLayer`, a whole model, or one model sub-mesh (`meshKey`). **Both `vertex` and `fragment` are required.**
- **`generate_3d_model`** — text-to-3D (`prompt`) or image-to-3D (`imageUrl`), adds a NEW model node. Never call it to re-skin an object already in the scene.
- **`keyframe_scene`** — cinematic timeline keyframes, saved WITH the scene.
- **`apply_motion_preset`** — a named camera/object move from the shot library.
- **`animate_scene_field`** — drive an EXPOSED field from scroll / mouse / hover / load.

```
edit_scene({ operations: [ { op: "addNode", nodeType: "mesh", ... }, { op: "setMaterial", ... }, ... ] })
```

## Nodes (`addNode` / `removeNode`)
`nodeType` is one of:
- **`mesh`** — primitive geometry: box / sphere / plane / cylinder / cone / capsule / torus / torusKnot / icosahedron.
- **`model`** — glTF/GLB/OBJ from a `src` url (`setModelSource` to swap). Inner meshes are selectable sub-objects with per-mesh material overrides.
- **`light`** — `setLight` (intensity / color / angle).
- **`camera`** — real camera; first one auto-activates. `addCamera`, `setActiveCamera` (""=default free view), `setCamera`.
- **`instancer`** — particle system OR replicator (see below).
- **`group`** — hierarchy container / null object; parent nodes into it and animate as a turntable rig.
- **`html`** — HTML (CSS selector or inline markup) rendered onto a mesh as a high-fidelity texture (`setHtmlSource`). Point the selector at a **class**, never an `id`.
- **`shaderLayer`** — full-bleed 2D shader plane (background/overlay); author GLSL with `set_shader_material`.
- **`effector`** — interactive driver (see Effectors).
- **`path`** — 3D bezier spline, optionally swept into a beveled solid; `setPath` (points, `closed`, `curve`, `bevel`, `fill`, `trimStart`/`trimEnd`/`trimOffset`, `showLine`). `bevel: null` = a **guide curve** with no solid.

Transforms: `setTransform` (rotation in **degrees**, colors CSS hex), `scaleUniform`. Hierarchy: `groupNodes`, `ungroupNode`, `setParent` (world transform preserved). Deforms + constraints live in one **modifier stack** per node: `addModifier` / `setModifier` / `removeModifier` / `reorderModifier` (`modifierKind` twist, bend, wave, bevel, extrude, followPath, lookAt, and more); every numeric param is exposable as `{kind:"modifier", nodeId, modifierId, path}`.

## Materials
- **`setMaterial`** — physical PBR incl. transmission / ior / clearcoat / iridescence, OR a matcap preset/image URL. `metalness`/`roughness` are 0..1.
- **`applyPreset`** — matte | plastic | chrome | gold | copper | glass | ceramic | carpaint | emissive.
- **`setShading`** — shade `smooth` (optional crease `angle`) or `flat`. It rewrites NORMALS, so it works under a custom shader — this, not a new shader or a new mesh, is the answer to "it looks faceted".
- **Material LAYER STACK** (Spline/Unicorn-style, stack many layers on one mesh): `addLayer` (`layerKind` physical | shader | matcap | html | color | gradient | depthGradient | fresnel | image | video | glass | rainbow | toon | outline | noise | pattern + vertex* deform kinds), then `removeLayer`, `reorderLayer` (toIndex), `moveLayer` (+/-1), `toggleLayer`, `setLayerOpacity`, `setLayerBlend`, `setLayerMask`, `setLayerSpec`.
- **Procedural maps**: `setProcMap` (nodeId, `procSlot` map|normalMap|roughnessMap|metalnessMap|emissiveMap|aoMap|displacementMap, proc|null) — bake noise/gradient/pattern/color/image/custom-GLSL into ANY PBR slot.
- **Displacement**: `setDisplace` — vertex or parallax relief on a mesh/model from an image or procedural texture.
- **Mirrors**: `setReflective` (turn a flat plane into a real-time planar mirror), `setMirror` (mask/tint where reflection shows), `setReflectBump`.
- Every material op works on a **model** node too. Omit `meshKey` to re-skin the whole GLB (the only form addressable before the scene has been opened).

## Particles & replicators (instancer)
`addNode` `instancer` → `setInstancerMode` (`instancerSpecMode` particles | replicator) → `setInstancerSpec` with `values[]` of `{path, value}` **dot-paths** into the spec: e.g. `emitter.rate`, `emitter.speed`, `forces.gravity`, `pattern.spacing`, `pattern.count`, `source`, `render.*`. Particles = emitted/simulated; replicator = patterned copies.

## Effectors (the Spline-style interaction primitive)
`addNode` `effector` (defaults to a pointer-following attractor), then `setEffector`:
- `effectorType` attract | repel | vortex | turbulence | drag; `strength`/`radius`/`falloff`/`axis`; `follow` pointer|none, `followLag`; `particlesEnabled`.
- **`effectorTarget`** `{nodeId, channel:"position"|"rotation", axes, strength, min, max}` — move/turn another object.
- **`effectorPost`** `{passId, key, drive:"distance"|"proximity"|"x"|"y", from, to}` — drive a post-FX parameter.
- `setRaycastLock` (nodeId, locked) excludes a node from the effector pointer raycast.

## Cameras, lenses & rails
- **Cameras**: `addCamera` (`focalLength` or `fov`, near/far/position/rotation/lookAt/lookAtNodeId/active), `setActiveCamera`, `setCamera`. Depth-of-field via a `dof` post pass.
- **CHOOSE A LENS, NOT AN ANGLE.** `focalLength` is millimetres, full-frame: **14** ultra-wide/distorted, **24** wide and environmental, **35** reportage, **50** normal (closest to the eye), **85** portrait with the background falling away, **135** long and flattened. The lens is a **LOOK**, not a setting — a 24mm up close exaggerates depth and bends the edges, an 85mm flattens and lifts the subject off its background. `fov` still exists and wins if you send both; prefer `focalLength` unless the brief names an angle.
- **CAMERA / AIM RAILS**: `attachCameraToPath {cameraId, pathId, role:"camera"|"aim", mount:"onCurve"|"keepOffset", takeOver}` flies a camera down a `path` node — with `role:"aim"` it flies what the camera LOOKS AT instead, so the shot can track a subject on its own route. Attach both, on two paths, for a fully choreographed move. `detachCameraFromPath` unwires it.
  - **WHY a rig**: a camera node carries no modifier stack, so it *cannot* hold a `followPath` itself. The op builds an invisible group with the followPath on it and parents the camera (or points `lookAtNodeId`) at it, then returns the **offset target** — keyframe that 0→1 to travel the curve.
  - `mount:"onCurve"` (default) sits the camera on the curve facing along it; `"keepOffset"` keeps its current framing and carries it at a rigid offset, like a crane arm. The op **refuses** if the camera is already parented / already aiming elsewhere — pass `takeOver: true` to re-wire.
  - **A RAIL MUST BE A GUIDE PATH**: create it with `bevel: null`. A beveled path is a solid swept tube, so as a rail it renders a pipe through the middle of the shot and the camera flies down the inside of it. Same for an aim path. Bevel a path only when the tube itself is the artwork.
- **Environment & light**: `setEnvironment` (HDRI url for IBL reflections + backgroundMode color|transparent|hdri), `setBackground`, `setExposure`, `setLight`.
- **Post-FX**: `addPostPass` (`postKind` bloom | ssao | vignette | dof | ssr | custom). `ssr` = screen-space reflections; `custom` takes a GLSL fragment over `tDiffuse + uTime + uResolution` (fragment ONLY). `removePostPass`.
- **Reference backdrop**: `setEditBackdrop {src, opacity, fit:"contain"|"cover"|"stretch", visible}` pins an image BEHIND the viewport to model against (a concept frame, a photo to match). It is **EDIT-ONLY** — it never reaches the published render, the export, or cinematic mode, so it is NOT a way to set a scene background (that is `setBackground` / `setEnvironment`).

## Animating: named moves first
**`apply_motion_preset({preset, cameraId | nodeId, amount?, durationSec?, startSec?, mode?})`** is the opinionated path for "animate the camera". Presets are authored: eased, sampled finely enough not to cut an orbit's corners, and loop-closed. Values are **RELATIVE to the current pose**, so you compute no coordinates.
- **Camera** (`cameraId`): `dollyIn`, `dollyOut`, `orbit`, `turntable`, `arcShot`, `craneUp`, `craneDown`, `dollyZoom` (the vertigo shot), `handheldDrift`, `whipPan`, `pullBackReveal`.
- **Object** (`nodeId`): `riseAndSettle`, `floatBob`, `objectSpin`, `popIn`, `spinReveal`.
- `amount` scales the move (1 = as authored) — that is the answer to "a bit more" / "much subtler". `startSec` stages several moves in sequence. Aiming a camera preset at a node (or vice versa) is refused, not guessed.

## Keyframes (`keyframe_scene`)
Timeline motion saved with the scene, so it plays on the scene card and travels with the node. A **track** = one `target` (same shape as `exposeProp`) + `keyframes[] {time, value, ease?}`. Targets are auto-exposed — no `exposeProp` first. Rotation in DEGREES and unwrapped (a turntable is Y 0→360); positions world units; colors CSS hex.
- **`ease` per key, or it reads like a robot.** Keys are **LINEAR by default** — constant speed, hard starts, hard stops. Give a dolly/crane `"power2.inOut"`, something that arrives `"power3.out"`, a pop `"back.out(1.4)"`. **Two things must stay linear**: a constant-speed LOOP (turntable/orbit/conveyor — easing stutters the seam) and a scroll-scrubbed channel, where the scroll IS the timing.
- **`mode`**: `replace` is the DEFAULT — each named track's existing keys are cleared first, so "make the spin slower" produces one motion instead of two fighting on the same property. `merge` only when deliberately adding beats to an existing tween.
- Before re-animating a channel CURRENT SCENE lists as already keyframed, call `inspect_scene section:"animation"` — the summary gives key TIMES but not their VALUES.
- **Orbit rig**: parent the subject under a `group` and animate the GROUP's rotation Y; far steadier than hand-circling a camera.

## Playblast (checking the motion)
A **playblast** renders the scene's camera over its animation range straight off the live WebGL viewport — full fidelity for materials, the layer stack, particles and post-FX. Two tools, and they are how you SEE your own motion rather than assuming it:
- **`render_scene_playblast({output, fps?, cameraId?, startMs?, endMs?, burnIn?})`** — `mp4` is the artifact for the user; 24fps to judge motion, 30 to deliver into a composition. Burn-in (frame, timecode, camera, lens) is on by default. Read the camera back with `inspect_scene section:"cameras"` before naming a `cameraId`; never guess it.
- **`extract_scene_frames({fractions?, times_ms?, sheet?, frame?, nodeId?})`** — stills tiled into ONE labelled contact sheet, and the round to run after ANY animation write. Its default fractions `0 / 0.23 / 0.41 / 0.68 / 0.87` are **non-uniform on purpose**: uniform steps alias with a cyclic move, so every frame looks identical and the motion reads as dead. `frame:"fit"` + `nodeId` gives the asset-QC shot (a temporary 50mm three-quarter camera, never written to the scene); `fractions:[0,1]` gives the first/last pair a video-generation node's frame sockets take.
- **Check, in order**: do the phases differ at all; is the motion logic right (a dolly gets closer, an orbit stays centered); does the camera leave the subject or clip geometry; pinching at joints; a loop's seam; hard starts that want an ease. Repair with a smaller `amount`, a different preset, an `ease`, or `setCamera` — and after **two identical failures change the approach**, do not render a third time.
- **What a playblast is NOT**: audio, motion blur, path tracing (forced off — this is the raster look), or Electron-render parity. Capped at 60s @ 30fps @ 1920x1080 in-tab; past that it refuses and points at the composition's render target. Note the website-editor runtime ignores the cinematic timeline, so a playblast plays the animation and a published page does not.

## Model hygiene (verify + repair a GLB)
Before trusting an imported or generated model — and whenever one "looks broken" — run **`inspect_model({nodeId})`**: mesh/skin/image/material counts, per-material alphaMode/doubleSided, the clip list, and per-clip root-joint scale drift, read-only, never changes anything. **`repair_model({nodeId, forceOpaque?, doubleSided?, fixRootScale?, stripClipPrefixes?})`** fixes what it flags — an inside-out look is almost always `alphaMode: BLEND` where it should be OPAQUE, not inverted normals; a character that grows/shrinks mid-clip is a drifted root-joint scale — and uploads the fix under a NEW, version-suffixed filename (rename to beat the CDN cache) through the same undoable `setModelSource` swap every scene edit uses. **`merge_model_clips({baseNodeId, clipModelUrls[]})`** folds extra single-clip donor GLBs (the common image-to-3D animation output shape) into one base model by matching node NAME. Full doctrine — the BLEND-vs-inverted-normals telltale, T-pose-only exports, polycount budgets, the image-to-3D preflight checklist — lives in **flowmo-3d-asset-hygiene**.

## Wiring 3D to the animation timeline
**`exposeProp` / `unexposeProp`** promote ANY value to an animatable f0 sidebar field — it becomes a `field:<id>` timeline channel you can keyframe, scroll-scrub, or drive on hover (see **flowmo-motion-design**). Exposable `target.kind`: `nodeTransform`, `material`, `uniform`, `light`, `render`, `env`, `camera`, `animation` (**GLB model clip playback** as a 0..1 scrub — this is how GLB animations are driven), `instancer`, `post`, `path` (incl. `trimEnd` 0→1 to draw a path on), `modifier`, `progress`.

**`animate_scene_field({field_id, trigger, from, to, duration_ms?, ease?, scroll_start?, scroll_end?})`** wires an ALREADY-EXPOSED field to `scroll-scrub` | `mouse-position` | `hover` | `load`. Use it ONLY for page-driven motion; `keyframe_scene` is the default for "animate".

## Workflow
1. Ensure a Scene3D element is selected (the tools target the selection — if none is selected they fail cleanly).
2. `inspect_scene` only when an edit depends on values the CURRENT SCENE summary doesn't carry.
3. Build incrementally with batched `operations`; verify with `f0_screenshot`.
4. Animate with `apply_motion_preset` first, `keyframe_scene` (with eases) for anything the library doesn't cover.
5. After any animation write, `extract_scene_frames` and actually look at the sheet; `render_scene_playblast({output:"mp4"})` when the user wants the clip.
6. Expose every float/color the user might want to animate on the page.
7. For custom looks beyond presets/layers, add a `shaderLayer` and author GLSL via `set_shader_material`.
