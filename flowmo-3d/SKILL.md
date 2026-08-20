---
name: flowmo-3d
description: Build and edit 3D scenes in flowmo (f0) and flowMotion — meshes, GLB models, PBR materials + the material layer stack, particles & replicators, effectors, cameras/cinema mode, post-FX, procedural textures, displacement, mirrors — and wire any of it to the animation timeline. Use for any "3D / scene / GLB / material / particles / shader / camera / post effect" request on a canvas. Driven by the edit_scene tool.
---

# flowmo 3D scenes

A 3D scene is a **Scene3D interactive element** on the canvas. You drive its scene graph with one tool: **`edit_scene`**, which applies a **batch of operations in order**. It targets the **currently selected** Scene3D element (you don't pass an id) — so select the scene first.

```
edit_scene({ operations: [ { op: "addNode", nodeType: "mesh", ... }, { op: "setMaterial", ... }, ... ] })
```

Custom GLSL is the one exception → use **`set_shader_material`** on a `shaderLayer` node, not `edit_scene`.
Available in BOTH the website editor (f0) and video mode (flowMotion). Verify visually with **`f0_screenshot`** after edits.

## Nodes (`addNode` / `removeNode`)
`nodeType` is one of:
- **`mesh`** — primitive geometry: box / sphere / plane / cylinder / cone / torus / torusKnot / icosahedron.
- **`model`** — glTF/GLB/OBJ from a `src` url (`setModelSource` to swap). Inner meshes are selectable sub-objects with per-mesh material overrides.
- **`light`** — `setLight` (intensity / color / angle).
- **`camera`** — real camera; first one auto-activates. `addCamera`, `setActiveCamera` (""=default free view), `setCamera`.
- **`instancer`** — particle system OR replicator (see below).
- **`group`** — hierarchy container / null object; parent nodes into it and animate as a turntable rig.
- **`html`** — HTML (CSS selector or inline markup) rendered onto a mesh as a high-fidelity texture (`setHtmlSource`). Point the selector at a **class**, never an `id`.
- **`shaderLayer`** — full-bleed 2D shader plane (background/overlay); author GLSL with `set_shader_material`.
- **`effector`** — interactive driver (see Effectors).

Transforms: `setTransform` (rotation in **degrees**, colors CSS hex), `scaleUniform`. Hierarchy: `groupNodes`, `ungroupNode`, `setParent` (world transform preserved).

## Materials
- **`setMaterial`** — physical PBR incl. transmission / ior / clearcoat / iridescence, OR a matcap preset/image URL. `metalness`/`roughness` are 0..1.
- **`applyPreset`** — matte | plastic | chrome | gold | copper | glass | ceramic | carpaint | emissive.
- **Material LAYER STACK** (Spline/Unicorn-style, stack many layers on one mesh): `addLayer` (`layerKind` physical | shader | matcap | html | color | gradient | depthGradient | fresnel | image | video | glass | rainbow | toon | outline | noise | pattern + vertex* deform kinds), then `removeLayer`, `reorderLayer` (toIndex), `moveLayer` (±1), `toggleLayer`, `setLayerOpacity`, `setLayerBlend`, `setLayerMask`, `setLayerSpec`.
- **Procedural maps**: `setProcMap` (nodeId, slot map|normalMap|roughnessMap|metalnessMap|emissiveMap|aoMap|displacementMap, proc|null) — bake noise/gradient/pattern/color/image/custom-GLSL into ANY PBR slot.
- **Displacement**: `setDisplace` — vertex or parallax relief on a mesh/model from an image or procedural texture.
- **Mirrors**: `setReflective` (turn a flat plane into a real-time planar mirror), `setMirror` (mask/tint where reflection shows), `setReflectBump`.

## Particles & replicators (instancer)
`addNode` `instancer` → `setInstancerMode` (`instancerSpecMode` particles | replicator) → `setInstancerSpec` with `values[]` of `{path, value}` **dot-paths** into the spec: e.g. `emitter.rate`, `emitter.speed`, `forces.gravity`, `pattern.spacing`, `pattern.count`, `source`, `render.*`. Particles = emitted/simulated; replicator = patterned copies.

## Effectors (the Spline-style interaction primitive)
`addNode` `effector` (defaults to a pointer-following attractor), then `setEffector`:
- `effectorType` attract | repel | vortex | turbulence | drag; `strength`/`radius`/`falloff`/`axis`; `follow` pointer|none, `followLag`; `particlesEnabled`.
- **`effectorTarget`** `{nodeId, channel:"position"|"rotation", axes, strength, min, max}` — move/turn another object.
- **`effectorPost`** `{passId, key, drive:"distance"|"proximity"|"x"|"y", from, to}` — drive a post-FX parameter.
- `setRaycastLock` (nodeId, locked) excludes a node from the effector pointer raycast.

## Cameras / cinema & post-FX
- Cameras: `addCamera` (fov/near/far/pose/lookAt/active), `setActiveCamera`, `setCamera`. Depth-of-field via a `dof` post pass.
- Environment & light: `setEnvironment` (HDRI url for IBL reflections + backgroundMode color|transparent|hdri), `setBackground`, `setExposure`, `setLight`.
- Post-FX: `addPostPass` (`postKind` bloom | ssao | vignette | dof | ssr | custom). `ssr` = screen-space reflections; `custom` takes a GLSL fragment over `tDiffuse + uTime + uResolution`. `removePostPass`.

## Wiring 3D to the animation timeline (the key bridge)
**`exposeProp` / `unexposeProp`** promote ANY value to an animatable f0 sidebar field — it becomes a `field:<id>` timeline channel you can keyframe, scroll-scrub, or drive on hover (see **flowmo-motion-design**). Exposable: node transforms, material/layer props, light, env intensity, camera fov, **GLB model clip playback** (as a 0..1 scrub — this is how GLB animations are driven), instancer/particle/replicator params, post-FX params, render exposure/pathtracing. So: build the scene → `exposeProp` the floats/colors the user might animate → keyframe them in the Interactions panel.

## Workflow
1. Ensure a Scene3D element is selected (it's an interactive element on the canvas; `edit_scene` targets the selection — if none is selected it fails cleanly).
2. Build incrementally with batched `operations`; verify with `f0_screenshot`.
3. Expose every float/color the user might want to animate.
4. For custom looks beyond presets/layers, add a `shaderLayer` and author GLSL via `set_shader_material`.
