---
name: flowmo-no-ai-slop-content
title: Remove AI slop from content
version: 3
family: other
derived_from: https://github.com/petergyang/no-ai-slop/blob/000650b156983f5159695b441477f4e63b25dc85/skills/no-ai-slop/SKILL.md
task_family: quality
description: Review and repair generic or unclear copy while preserving facts, citations, brand voice and approved wording. Use when reviewing native text, web copy, slide/carousel copy, scripts, captions or motion titles after generation. NOT for AI authorship detection or rewriting protected copy without authority.
surfaces: [assistant-web, assistant-app, assistant-video, designer, flowgen-chat, flowgen-web-node, flowgen-image-node, flowgen-video-node, section, mcp]
default_on: [assistant-web:execute, assistant-web:review, assistant-web:repair, assistant-video:execute, assistant-video:review, assistant-video:repair, designer:execute, designer:review, designer:repair, flowgen-chat:execute, flowgen-chat:review, flowgen-chat:repair]
reference_on:
  detection: [execute, review, repair]
triggers: [no AI slop, remove AI slop, content review, sounds generic, sharpen the copy]
---

# Content quality review and repair

For website work, use the shared `evaluate_website_quality` gate (`f0_evaluate_website_quality` over MCP): automatically repair only a located, current major/critical defect with confidence at least 0.85 and a concrete missed requirement. Report minor polish without automatic edits; preserve approved wording. Missing evidence is unverified. Carry the gate's `repairKeys` into the next review so an unchanged finding cannot trigger another repair merely because unrelated source changed. Re-read the changed saved revision before passing. This threshold grants no write or spending authority.

**Scope before review:** JEV stage/context selection and independent reviewers apply this method to the current requested domain. New generated work receives a quality pass. For a scoped edit, inspect only the changed region and affected states; preserve unrelated work. Exact wording, specifically requested styling, approved brand treatments and faithful reference recreation are protected aspects, not automatic slop findings. A copy-only edit cannot authorize redesign; a visual-only edit cannot authorize copy changes. Explicit anti-slop requests authorize the corresponding scoped repair. These exceptions do not waive factuality, functional correctness, editability or verification of requested output.

Review actual saved visible text and scripts after creation/editing, separately from design. Establish audience, purpose, brand voice, factual sources and approved wording from existing context. Classify located findings as clarity, specificity, repetition, unsupported claim, voice drift, rhetorical filler or format/timing mismatch. Quote the exact text and its page/layer/element ID and revision, explain the missed goal, propose the minimum effective edit, then re-read the saved revision after an authorized repair.

Flag interchangeable promotional claims, empty superlatives, long setup before the point, canned contrasts, fake insights, redundant conclusions, synonym cycling and vague attribution when they weaken this particular piece. Replace filler only with grounded mechanisms, examples or facts already supported by the brief/brand. Never invent numbers, customers, capabilities, citations or testimonials to make writing sound specific. Missing facts require retrieval, omission or a clearly marked question.

Preserve meaning, citations, quotations, legal language, localization, distinctive humor, poetic phrasing, uncertainty and deliberate rhythm. Do not apply a word blacklist or make every sentence sound uniformly polished. Approved slogans and user copy remain verbatim unless changing them is authorized; report an issue without overwriting protected text. The design review must not silently rewrite copy.

For video/motion, inspect title/caption duration, legibility, voiceover timing and narrative continuity; for slides/carousels check reading order, density and repeated headings; for web/campaigns verify that promises and CTAs describe actual supported outcomes. Route text repairs to native editable text/script layers in the owning editor. When all text is intentionally absent, record not applicable; do not add words just to exercise this skill.

For new work, complete supported repairs and re-check within existing authority and budget without asking for another generic continuation. For review-only requests, return located findings without writes. Continue authorized repairs while changed inputs or findings justify the next action. Honor explicit human retry and budget limits, Stop, source currentness and the real cost gate; this method supplies no attempt allowance. Do not repeat an unchanged failure or claim a failed or unverified result passed: report that blocker and the needed change. A clean review requires current evidence; stylistic patterns cannot identify who wrote something.

Read [references/detection.md](references/detection.md) for scoped findings and intentional exceptions. Source matches are leads, never automatic repair authority. Pinned upstream attribution, adaptation changes and license evidence are in [references/provenance.md](references/provenance.md); the upstream license is retained in `LICENSE.upstream`. These checks evaluate quality against the brief, not AI authorship.
