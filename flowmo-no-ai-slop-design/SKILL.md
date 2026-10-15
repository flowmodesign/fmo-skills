---
name: flowmo-no-ai-slop-design
title: Remove AI slop from design
version: 3
family: other
derived_from: https://github.com/yetone/kill-ai-slop/blob/f6e2ae32b30443ec7bd0da4da971ee18d8f8ffcb/skill/SKILL.md
task_family: quality
description: Review and repair generic design against the actual brief, linked brand and visual references. Use when a generated deliverable or existing design needs a quality pass. Preserve intentional styling and editable layers. NOT for AI authorship detection or removing deliberate brand treatments.
surfaces: [assistant-web, assistant-app, assistant-video, designer, flowgen-chat, flowgen-web-node, flowgen-image-node, flowgen-video-node, section, mcp]
default_on: [assistant-web:execute, assistant-web:review, assistant-web:repair, assistant-video:execute, assistant-video:review, assistant-video:repair, designer:execute, designer:review, designer:repair, flowgen-chat:execute, flowgen-chat:review, flowgen-chat:repair]
reference_on:
  detection: [execute, review, repair]
triggers: [no AI slop, remove AI slop, design review, looks generic, polish the design]
---

# Design quality review and repair

For website work, use the shared `evaluate_website_quality` gate (`f0_evaluate_website_quality` over MCP): automatically repair only a located, current major/critical defect with confidence at least 0.85 and a concrete missed requirement. Report minor taste/polish without automatic edits; preserve intentional brand treatments and approved copy. Missing pixels or stale evidence is unverified. Carry the gate's `repairKeys` into the next review so an unchanged finding cannot trigger another repair merely because unrelated source changed. Re-render the changed saved revision before passing. This threshold grants no write or spending authority.

**Scope before review:** JEV stage/context selection and independent reviewers apply this method to the current requested domain. New generated work receives a quality pass. For a scoped edit, inspect only the changed region and affected states; preserve unrelated work. Exact wording, specifically requested styling, approved brand treatments and faithful reference recreation are protected aspects, not automatic slop findings. A copy-only edit cannot authorize redesign; a visual-only edit cannot authorize copy changes. Explicit anti-slop requests authorize the corresponding scoped repair. These exceptions do not waive factuality, functional correctness, editability or verification of requested output.

After creating or editing a deliverable, inspect its CURRENT rendered revision before calling it finished. Compare it with the human brief, linked brand logo/design system and user/brand/generated visual targets. A generated proof intended for production must reach a compatible producer input and final destination; a beautiful disconnected proof is not delivery.

Classify each located finding as hierarchy, typography, spacing, contrast, brand/reference drift, decoration, interaction, motion or editability. Record the page/layer/element ID, revision, frame/time or viewport, visible evidence, missed requirement, smallest repair and verification method. Route the located repair to the actual owning editor and its supported tools, not to a replacement project. Source scanning is a lead; rendered evidence decides visual findings.

Look for interchangeable stock layouts, monotonous card/spacing grids, weak type hierarchy, accidental radii/shadows, unreadable contrast, arbitrary icon/badge clutter, references reduced to placeholder rectangles, and decorative effects disconnected from the intended visual language. A pattern alone is not a defect: preserve requested gradients, glow, glass, maximalism, centered layouts and brand fonts. Never flatten a distinctive brand into a universal minimalist template.

For motion, review multiple frames and playback, including intro, transitions and outro. Check actual movement, pacing, easing, depth, masks/strokes, compositing, intentional blur and effects against references; a static screenshot or presence of keyframes does not prove motion quality. Keep required titles/flat graphics native and editable. Use generated backgrounds or 3D when requested rather than approximating approved visuals with an offline skeleton.

Repair confirmed misses under existing edit authority and budget, then re-render and re-review the changed revision. Do not wait for another generic "continue" for authorized repairs. Keep approved text and logos intact during visual-only edits. Inspection-only requests stay read-only. Respect exclusions, explicit approvals and spending/cancellation limits. Continue authorized repairs while changed inputs or findings justify the next action. Honor explicit human retry and budget limits, Stop, source currentness and the real cost gate; this method supplies no attempt allowance. Do not repeat an unchanged failure or claim a failed or unverified result passed: report that blocker and the needed change.

Read [references/detection.md](references/detection.md) for scoped findings and intentional exceptions. Source matches are leads, never automatic repair authority. Pinned upstream attribution, adaptation changes and license evidence are in [references/provenance.md](references/provenance.md); the upstream license is retained in `LICENSE.upstream`. These checks evaluate quality against the brief, not AI authorship.
