
# Native motion execution

Translate the approved cut map into bounded scene batches. For each scene record its time range, asset bindings, native text/shapes/UI, hierarchy and entry/action/hold/exit. Read the owning editor's exact schema before writing; its rendition defines timing units, target handles and motion engine. Never copy fields, easing names or commands from another editor. A skill grants no tool, generation budget or execution authority.

Inspect the saved document, revision and existing layers first. Reuse successful work. Read a failed batch's error and repair its actual arguments; do not create duplicates or silently discard a required scene. Use stable IDs, operation IDs and revision/precondition guards where the tools require them.

Typography needs actual native text and motion: masks, split animators, tracking, position/scale or other supported choreography. UI demonstration needs a readable state change, cursor/action timing and a visible consequence. Wires need supported path animation. A title held over footage is not a complete replacement for a motion-led reference.

For editable perspective tunnels or exploded planes, use the owning editor's supported 3D tools only when available. Populate designed cards with varied actual assets, not repeated copies of one thumbnail. Check camera framing, depth separation, occlusion and near/far visibility. Do not call a flat scale animation "true 3D". When only text and flat graphics need editability, complex dimensional visuals may be generated plates with independent native overlays; choose per element from the user's requirement.

Bind actual brand tokens, type, logo and reference assets. Maintain readable contrast and safe areas through movement. Follow the supplied references' material, edge-light, radius, border and icon treatment; avoid generic glow, fake interfaces and unsupported feature claims. Style and action must serve the product story.

Verify saved keyframes and motion over the complete composition, sample every scene and transition, and play the full cut with audio. Check footage/audio coverage, gaps, overlaps, readable holds, music mix and a deliberate ending. Review is diagnostic: a tool-success receipt does not certify visual quality. Repair failed scenes in the same document, then export/render and verify duration, resolution and editability alongside the playable deliverable.

## Compositor effect routes

Discover `get_compositor_authoring_contract` with `topic: "effect"` and the actual effect enum before sending `setEffect`. Each parameter is an Animated value, such as `{value: 0, keys: [{frame: 0, value: 14}, {frame: 18, value: 0}]}`. Use the actual composition frame range and supported native easing rather than copying these illustrative frame numbers. Serialize the complete supported effect into `effectJson`, reuse its stable ID when repairing, and protect the touched effects collection with the live batch contract's preconditions.

For animated spatial blur, choose the `blur` effect and put the Animated value in `params.radius`. Static CSS blur/filter chains can import, but animated GSAP/CSS `filter` is rejected atomically. `source.blur`, `filter` in `setKeyframes`, and a raw `params.radius: 14` are not native contracts. This blur is spatial smoothing, not temporal motion blur. `assemble_compositor_film` enables the supported composition motion blur while assembling an approved cut; the general batch command list has no arbitrary composition motion-blur setter.

For a text/shape glow, use the supported `drop-shadow` effect with zero `offsetX`/`offsetY`, a light-tinted `color`, and reference-led `radius`/`opacity`, all in Animated wrappers. Its radius is a texel tap step; the nine-tap kernel spans plus/minus four times the radius, and static CSS blur B imports as radius B/8. This creates an alpha halo around transparent text/shapes. It is not a luminance-threshold bloom for opaque footage. Neither `glow` nor `bloom` is a two-dimensional `setEffect` enum.

True bloom, depth of field and shared camera depth belong to a native SceneDoc/shared World. Read `read_compositor_scene`, preserve its existing scene, and use the exact discovered `sceneControl.*` IDs with `set_compositor_scene_control` for supported numeric controls. Inspect current enabled post passes; do not invent a pass or control on opaque video. Camera/scene edits go through the actual scene tool contract. Shared post/camera controls belong to the World, not its spatial members. Standalone path tracing bypasses raster post processing. Automatic controls do not advertise SSAO's incompatible SAO binding path, custom shader uniforms, or structural quality/boolean settings as ordinary scalar post controls.

## Compositor text choreography

`apply_compositor_batch` supports native text creation/update and numeric tracking, size, counter and text-path keys. Its closed command vocabulary has no `setTextAnimator`. `import_compositor_motion` can translate supported SplitText `from`/`fromTo` reveals into an actual native text animator. Read diagnostics: native import supports numeric x/y/scale/opacity reveals, nonnegative numeric stagger and identity destinations; wrapped line splitting, overlapping split tweens and masked `splitMask: true` reveals are unsupported. Staggered per-unit easing can be approximated as linear with an explicit warning. Designer's `clip:true` or the web recipe's `splitMask:"lines"` must not be copied into compositor import unchanged.

`assemble_compositor_film` is a separate approved-cut route: it supplies native editable titles animated with layer position/scale/opacity keys, plus composition motion blur. It does not create split animators or certify motion-led reference fidelity. Use its real lift/slide/scale vocabulary and available source footage/audio; refine missing choreography through supported native tools and review playback. A motion-led reference can require more than the assembly's title treatment.
