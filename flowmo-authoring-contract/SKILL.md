---
name: flowmo-authoring-contract
description: Author self-contained HTML, CSS, GSAP, native f0 interactions, interactive TSX, and DESIGN.md files that a user will drag, drop, or import into flowmo (f0) without turning the page into one opaque script. Use whenever generating or repairing a file for Import page, HTML drop, or an editable f0 handoff.
---

# flowmo authoring contract

This skill governs a **file handoff into f0**. It is different from operating the
live editor through f0 tools and different from deliberately importing a whole
site as a sandbox.

The non-negotiable result is:

> A handoff requested as editable must import as normal selectable DOM, native
> f0 interactions/timelines, and explicitly declared interactive elements. It
> must create zero accidental opaque page-code layers.

Do not solve an editable-import request by wrapping the page in Electron, an
iframe, a sandbox, or one large script. Those routes can preserve playback, but
they defeat element-level editing and are only valid when the user explicitly
chooses a faithful opaque embed.

## Read the required references

Read these files completely before authoring the corresponding part of a
handoff:

- Always read [references/editable-html.md](references/editable-html.md) for the
  HTML/CSS structure, design-system vocabulary, DESIGN.md, and responsive CSS.
- For any animation, interaction, scroll behavior, timeline, carousel, tabs,
  accordion, or media scrub, also read
  [references/motion-handoff.md](references/motion-handoff.md).
- For React/TSX, canvas, WebGL, particles, or other code-driven visuals, also
  read [references/interactive-code.md](references/interactive-code.md).

## Choose the import representation first

| Intended result | Representation in the handoff |
| --- | --- |
| Editable content and layout | Ordinary semantic HTML plus inline CSS |
| Simple load/reveal/scrub/hover/click tween | One atomic, converter-safe GSAP block with literal CSS CLASS selectors |
| Timeline, pinning, responsive branches, DOM measurements/refs, callbacks, computed ranges, carousel, tabs, accordion, or advanced triggers | Inert `<script type="application/json" data-f0-interactions>` native payload |
| Scroll-driven mp4, image sequence, or Lottie | Declarative `data-f0-*-scrub` attributes on the media element - NO script and no payload entry |
| Canvas, WebGL, particles, or a genuinely code-driven element | Inert `<script type="text/f0-tsx">` interactive element; keep editable copy in HTML |
| Faithful execution of an arbitrary existing site | Live sandbox, but only when the user explicitly accepts one opaque embed |

A scroll-scrubbed video or image sequence is the cinematic-scroll primitive and
it is DECLARATIVE. Reaching for a canvas, a TSX element, a hand-written
`ScrollTrigger`, or a timeline that writes `currentTime` is the wrong route: it
converts to nothing, ships as opaque code, and throws away an effect the runtime
already implements. Mark the element instead - see the motion reference.

Do not confuse the live-editor `author_animation` syntax with the HTML importer
grammar. The live tool accepts full native authoring operations. A dropped HTML
file only converts the narrow atomic GSAP subset described in the motion
reference; complex motion belongs in the native JSON payload.

Every hook in the handoff is a CLASS. CSS rules, GSAP targets, triggers, scrub
markers, timeline roots and scope selectors all address elements by class, never
by `id`. An id matches one element ever, so an id hook breaks the moment the user
duplicates the section, and two copies of it are invalid HTML. Write an `id` only
where something must be addressed programmatically and precisely - an in-page
anchor target, form wiring (`for` / `aria-labelledby` / `aria-controls`), and SVG
internal references (gradients, `clipPath`, `mask`, `filter`, `<use>`) which have
no class equivalent. Those ids never carry styles or animation.

Import routing is atomic per classic `<script>` block. One DOM query, helper,
timeline, callback, conditional, or unsupported statement can route the entire
block to opaque page code. Splitting arbitrary imperative code into more blocks
does not make it editable; translate the choreography to native payload data.

## Mandatory release gate

Before handing over the actual final HTML file, resolve this skill directory and
run its bundled validator against the absolute file path:

```bash
node /absolute/path/to/flowmo-authoring-contract/scripts/validate-handoff.mjs \
  /absolute/path/to/page.html
```

A failing result means the editable handoff is not ready. Fix the artifact and
rerun the validator. Never dismiss a failure by switching to the live-sandbox
route when the user asked for an editable page.

The validator also WARNS (without failing) on any id used as a styling or
animation hook - a `#id` CSS rule, a `#id` GSAP target, a `#id` in the native
payload. The import accepts those, which is why they are not a gate failure, but
a warning means the handoff is not written the way f0 is edited: clear them
before delivery.

The validator does not describe f0's import rules - it RUNS them. It carries a
generated bundle of the importer's own routing, so "the validator says this
converts" and "f0 converts this" are the same statement. A pass means these
scripts really do arrive as editable interactions.

Remember that routing is ATOMIC per script block: one unsupported construct
sinks every other tween in the same block with it. A near-miss does not cost you
one animation, it costs you all of them, which is why a failure here is a hard
stop rather than a hint.

It validates the editable-motion boundary only; also inspect layout, assets,
copy, and responsive behavior visually.

## Final handoff checklist

- The page content is ordinary selectable HTML, not generated by a classic
  script and not hidden inside an iframe.
- There are no unsupported classic scripts and no accidental page-code layers.
- Direct GSAP blocks contain only supported calls, literal selectors, and plain
  literal vars.
- Every CSS rule and every animation selector targets a class. The only ids in
  the file are anchor targets, form wiring, and SVG internal references.
- Complex behavior is encoded in `data-f0-interactions`; every timeline
  interaction references a timeline included in that payload.
- Scripted visuals use `text/f0-tsx`, remain scoped to their own host, and do not
  own copy that should remain editable.
- Scroll-driven mp4 / image-sequence / Lottie use the `data-f0-*-scrub` markers,
  never a script that writes `currentTime` or swaps frames.
- Every selector and asset path resolves in the final handoff location; keep
  relative assets beside the HTML instead of silently changing paths.
- Reduced-motion behavior is declarative and does not wrap converter-safe GSAP
  in `matchMedia`, conditionals, or helper code.
- The validator exits successfully on the exact file being delivered.
