# Rendition: compositor

FlowGen discovers `get_open_compositor`, then `invoke_compositor_tool`. Read saved state and authoring contracts. Use actual dimensions/FPS and integer frames; honor ranges, IDs, revisions and preconditions. Numeric key easing: hold/linear/bezier, never GSAP names.

Discover effect schemas: animated blur is `setEffect.params.radius={value,keys}`; alpha glow is zero-offset light-tinted drop-shadow, not footage bloom. No invented glow, source.blur or setTextAnimator. Native import supports split text. See [execution](references/execution.md).

Prefer native. Read `get_compositor_html_contract`; use `import_compositor_html` for browser typography/CSS/SVG fidelity. Identified elements are layers; containers are precomps with native children. Literal paused fromTo only; one host clock. `includeVideoAudio:true` adds linked native sound. `revise_compositor_html` edits text/browser tracks; native batches edit transforms/effects/timing. Reject unsupported code without flattening. `import_compositor_motion` remains native conversion. Review pixels, numerical timing, continuous playback, audio and saved editability.
