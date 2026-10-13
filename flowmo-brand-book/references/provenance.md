# Source and adaptation evidence

House-written Flowmo recipe informed by the user-supplied `skills-main/higgsfield-brandkit` package, version `0.12.0`, and its `references/brandbook.md`. The supplied tree includes the MIT license, Copyright (c) 2026 Higgsfield AI, retained byte-for-byte as this package's `LICENSE.upstream`.

The public [Higgsfield skills repository](https://github.com/higgsfield-ai/skills) identifies origin. A public Git commit was not supplied for this folder; the hashes below pin the reviewed supplied bytes without claiming they equal the current public branch.

| Supplied relative path | SHA-256 |
| --- | --- |
| `higgsfield-brandkit/SKILL.md` | `614a3abe1a0ea52f16d04d191959ab1823a8bf4712f67e2ea77ad53a750d4c4b` |
| `higgsfield-brandkit/references/brandbook.md` | `7ffc004e83a26aec51c15a76270b22a3ba1bb7e5993d8f5d7e38f68148fcac06` |
| `LICENSE` | `9da656d6226936542be59478dbf775057dfdeade2629d35e0832108c2b7aecc0` |

Retained techniques: approved-foundation dependency, official-logo preservation, grounded copy, conditional logo/application sections, exact palette labels, real typography, per-slide review and explicit editable/flattened delivery labels.

Changed for Flowmo: build and revise a native Designer deck through existing tools; use the native editable PPTX/raster PDF agent adapter or real Designer UI export rather than the source's local CLI builder. Version 2 adds page/revision-bound agent export with actual byte/object evidence and explicit persistent/temporary delivery receipts. No upstream scripts, deterministic state file, provider jobs, Google Slides template, PPTX masters or LibreOffice conversion are copied or registered. This is a supported native alternative when the request permits it, not the upstream canonical seven-slide template.

Implementation evidence in the Flowmo repository: `src/components/designer/agent/designerTools.ts` (markup/style edits), `src/components/designer/pages/pageToolSchema.ts` (page creation and slides QA), `src/components/designer/agent/motionToolSchema.ts` (beats/stops), `src/components/designer/deck/slideIsolation.ts` (slide-root binding), `src/components/designer/publish/designerExport.ts` and `exportPptxRun.ts` (actual UI export dispatch), and `src/components/designer/deck/exportPptxEditable.ts` (editable object output). These paths are maintainer evidence, not tools for the end user to invoke.
