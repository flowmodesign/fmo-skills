---
name: flowmo-authoring-contract
version: 1
family: web
description: Author self-contained HTML, CSS, GSAP, native f0 interactions, interactive TSX, and DESIGN.md files that a user will drag, drop, or import into flowmo (f0) without turning the page into one opaque script. Use whenever generating or repairing a file for Import page, HTML drop, or an editable f0 handoff. Use when the deliverable is a file, not a live-editor edit. NOT for driving the running canvas through f0 tools (see flowmo-overview) and NOT for a deliberate, explicitly-requested faithful opaque embed.
surfaces: [assistant-web, flowgen-web-node, mcp]
triggers:
  - import page
  - drag and drop
  - editable handoff
  - drop file
  - handoff validator
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
- After the user imports, or when repairing an imported project through the
  MCP, read [references/after-import.md](references/after-import.md).

## Choose the import representation first

| Intended result | Representation in the handoff |
| --- | --- |
| Editable content and layout | Ordinary semantic HTML plus inline CSS |
| Simple load/reveal/scrub tween | One atomic, converter-safe GSAP block with literal CSS CLASS selectors and a meaningful `id` |
| Static literal timeline choreography | One converter-safe `gsap.timeline({ id: 'Meaningful name', ... })` block |
| Dynamic timeline, responsive branches, DOM measurements/refs, callbacks, computed ranges, carousel, tabs, accordion, hover/click, or advanced triggers | Inert `<script type="application/json" data-f0-interactions>` native payload |
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
file converts the static literal GSAP subset described in the motion reference,
including compatible timelines; dynamic motion belongs in the native JSON
payload.

Every hook in the handoff is a CLASS. CSS rules, GSAP targets, triggers, scrub
markers, timeline roots and scope selectors all address elements by class, never
by `id`. An id matches one element ever, so an id hook breaks the moment the user
duplicates the section, and two copies of it are invalid HTML. Write an `id` only
where something must be addressed programmatically and precisely - an in-page
anchor target, form wiring (`for` / `aria-labelledby` / `aria-controls`), and SVG
internal references (gradients, `clipPath`, `mask`, `filter`, `<use>`) which have
no class equivalent. Those ids never carry styles or animation.

Import routing is atomic per classic `<script>` block. One DOM query, helper,
callback, conditional, or unsupported statement can route the entire block to
opaque page code. A supported static timeline is the exception: its literal
options and chained calls are reconstructed as one native f0 timeline. Splitting
arbitrary imperative code into more blocks does not make it editable; translate
dynamic choreography to native payload data.

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

It also WARNS on import fidelity: shapes that route fine but import wrong,
traced to the importer and runtime on a real handoff (`scripts/handoff-lint.mjs`,
which reads linked local stylesheets too). They are:
- a selector group later overridden for one member;
- top-level `@starting-style` / `@supports`;
- `-webkit-mask-composite`;
- CSS animations the converter mangles (`%` translates, view timelines,
  pseudo-elements, custom-property keyframes, multi-animation shorthands,
  `steps()`);
- reduced-motion overrides that lose the cascade;
- two scroll timelines driving one element and property;
- `immediateRender: false`;
- scrubbed tweens on one trigger with different lengths;
- local scripts (inlined, Preview/Export only, every page, can't reach GSAP
  tweens).

Each message says the fix. Treat them as defects: the page imports, but that
part will not look or move like the source. `build-f0-export.mjs` adds the
cross-page cases: a timeline present on two exported pages, or one class
animated by different tweens on different pages, because imported
interactions are project-wide.

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

## Verify in a real browser (advisory)

The validator reads source; it cannot see a font that fell back, a section
wider than a phone, a hero painted at opacity 0, or motion that is right
scrolling down and wrong scrolling back up. After the gate passes, run
[references/browser-verify.md](references/browser-verify.md): fonts, console
and failed requests, 390px overflow, first paint, a scroll down-and-back pass
comparing samples at the same positions, text overlap, a reduced-motion rest
check and media scrub, at 1440x900 and 390x844. With a shell,
`scripts/verify-in-browser.mjs <file-or-url>` runs all of it and writes a JSON
report plus screenshots; without one, the reference gives each check as an
in-page snippet for a browser tool. The raw file runs plain GSAP (native
payloads and scrub markers are inert), so motion is only authoritative on the
f0 Preview URL after import. Advisory only: it never replaces the validator.

## Package the export folder (after every page validates)

`HtmlDropModal.tsx` ("Recreate from HTML") accepts the WHOLE export folder
(or a `.zip` of it) dropped/picked in one motion — f0 groups it back into
one page per subfolder automatically
(`src/utils/importWebsite/bundleIntake.ts`), resolving each page's media by
filename the same way a single-page drop already did. A single page
folder still drops on its own the same way. Once every page in the handoff
passes the validator above, run the bundled packager so the client (or you)
can deliver the whole thing as one folder, with zero manual Asset Browser
uploads:

```bash
node /absolute/path/to/flowmo-authoring-contract/scripts/build-f0-export.mjs \
  /absolute/path/to/project [--pages a.html,b.html] [--assets dir1,dir2]
```

This scans each final page for every local `src`/`href`/`srcset`/`url(...)`
reference — including `url(...)` inside `style="..."`/`<style>` and,
transitively, inside any bundled `.css` file's own content (e.g. a
`design-system.css` with `@font-face src url(...)`) — resolves each against
the project's media folders by filename (the same basename-only,
case-insensitive rule f0's own importer uses — see
`src/utils/importWebsite/droppedAssets.ts` in the main repo, not vendored
here), and emits `f0-export/<page-name>/` folders each containing the page's
HTML plus only the assets it actually uses (images, fonts, and video),
correctly named so the import resolves them without a follow-up "missing"
prompt. `DESIGN.md`, if present, is copied once to the top of `f0-export/`,
not duplicated per page. The script fails (non-zero exit) if any page
references a local file it could not find — treat that the same as a
validator failure, not a warning to ship past.

Deliver `f0-export/` itself (its generated `README.md` states the handoff:
import `DESIGN.md` once, then drop the whole folder — or one page folder at
a time — onto f0's drop zone). Do not hand over the raw project tree and
expect the recipient to find the right images themselves.

## Final handoff checklist

- The page content is ordinary selectable HTML, not generated by a classic
  script and not hidden inside an iframe.
- There are no unsupported classic scripts and no accidental page-code layers.
- Direct GSAP blocks contain only supported calls, literal selectors, plain
  literal vars, and a meaningful `id` per tween or timeline.
- Repeated elements use one class selector and one stagger object; no tween is
  duplicated once per matching element.
- Each effect is represented once: converter-safe GSAP and a native payload do
  not both encode the same motion.
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
- Every local asset sits in a real attribute (`src`, `poster`, `srcset`, CSS
  `url()`), never only inside a `data-*` value or a script string: the
  export and f0's importer both skip those (editable-html.md, step 5).
- Reduced-motion behavior is declarative and does not wrap converter-safe GSAP
  in `matchMedia`, conditionals, or helper code.
- CSS animations that must stay CSS (marquees, view timelines, pseudo-element
  or custom-property motion) sit inside `@media (prefers-reduced-motion:
  no-preference)`. Overrides in the `reduce` block are `!important`.
- No element and property is driven by two scroll timelines (wrappers per
  timeline), and scrubbed tweens sharing a trigger have equal lengths.
- One selector group is never followed by a rule for one of its members.
- Only one variant of a page goes into a project, because interactions are
  project-wide.
- The validator exits successfully on the exact file being delivered.
- The browser recipe (`references/browser-verify.md`) ran on the raw file and,
  after import, on the f0 Preview URL; its warnings are fixed or consciously
  accepted.
- Nothing is elided in a delivered file: no `// ...`, no "rest is similar", no
  skeleton placeholders standing in for real markup or copy.
- Count the pages and sections that were asked for and check the deliverable
  against that count before handing off.
- Planning notes (direction statements, design reads) never ship inside the
  exported HTML: not as comments, not as `data-*` attributes, not as hidden DOM.
- `build-f0-export.mjs` ran clean (no missing local assets) and `f0-export/`
  is the artifact actually delivered — not the raw project tree.
- Page-level direction, background and font sit on your own top-level wrapper,
  not only on `<html>`, `<body>` or the page root (none of those publish).
- Each code element says where it goes after import, sizes its own f0 box, and
  reads media from page elements, never from paths inside the TSX.
- No load timeline sequences sibling elements (its first target becomes the
  trigger), and no fade carousel cross-dissolves media that overlap in place.
- Every page sits at the project root, the homepage is `index.html`, and
  page links are `./<page>.html` (pages publish flat).
- Nothing relies on UA defaults f0 removes (heading bold, list margins,
  `position: static` between an absolute child and its intended anchor), on
  "no whitespace between tags", or on a `min-width` media block.
- Nothing a CMS will edit holds child elements: count-up numbers, suffixes,
  icons and carets are sibling elements or pseudo-elements, repeated items
  are one uniform template, rich-text fields hold no newlines between tags
  (WordPress `wpautop` turns them into `<br>`), and nothing depends on an
  imported script (editable-html.md, "Write for the CMS that follows").
- After import, `references/after-import.md` ran: token coverage, duplicate or
  collapsed interactions, code-element placement, and the published page.
  Diff the published page against the local build at phone and desktop widths.
- Before launch on WordPress, the CMS handoff list in after-import.md ran on
  the production host: every page's header and footer, 404, titles, plugin
  widgets, and a desktop + phone sweep after each CMS editing session.
