# After import: check and repair

A handoff that validates can still arrive broken. Check the imported project
before calling it done, and repair it through the MCP when needed. Every item
here was found on a real import.

## Contents

- The post-import check
- Repairing through the MCP: what the tools can and cannot do
- Checking the published page
- CMS handoff and going live

## The post-import check

For substantial imports and performance-affecting repairs, also follow
**flowmo-website-performance**: inspect saved native source, download and hash a
fresh ZIP, and test that unchanged artifact at desktop/phone and normal/reduced
motion. Keep postprocessed candidates separate. Use the MCP performance audit
for supplied-evidence triage; a successful import remains performance-unverified
until the relevant browser checks exist. Preserve required compatibility helpers
when investigating duplicate or obsolete scripts.

Run these against the imported project (`f0_invoke` on the editor, or
`surface: "document"` for a Flowgen document):

1. **Design system coverage.** `get_design_tokens`: `status: "none"` /
   `setCount: 0` means the DESIGN.md never applied and every `var()` on the page
   is empty. Write the DESIGN.md tokens with `write_css` on `:root` and
   `edit_design_system: true`. f0 loads a Google font it finds in
   `--font-body` / `--font-heading`. `ds-*` component classes need their rules
   too; elements that already carry them are held back by
   `complete_design_system`.
2. **Interactions.** `read_animations`:
   - every interaction can arrive TWICE (`int-gsap_*` from the GSAP importer and
     an `interaction_*` copy); both run;
   - read each `gsap` entry: a `fromTo` from 0 to 0, or a target that is the
     shared class instead of the one you wrote, means the converter collapsed the
     motion (motion-handoff.md, "A load timeline triggers on its first tween's
     target");
   - `read_animations` does not show `animationTarget`; a simple interaction
     whose trigger is the section animates the section itself unless one is set.
3. **Code elements.** Each one is at the end of the page until dragged into its
   slot. Check its box has a height (`get_design_html` then measure, or the
   layout of the sections after it) and that in-page anchors it took over
   still resolve (interactive-code.md, "Placing and sizing").
   For MCP imports, inspect returned `codeElements` IDs, field schemas and
   resolved dependencies. Open the native controls (f0 sidebar or FlowGen's
   **Edit code and controls**), change a declared field and check the rendered
   result. Keep field names stable on source updates and verify edited values
   survive. For package-backed elements, verify actual loading and behavior in
   the editor and preview; successful import or compilation alone is not proof
   that the CDN module or its React hooks work.
4. **`validate_canvas`.** It flags broken `var()` references. It also flags f0's
   own `fmod` class on the page root as an error; that one is the importer's,
   not yours.

## Repairing through the MCP

What the live tools do, beyond their descriptions:

- **`write_css` accepts only width breakpoints** (`@media (max-width:
  767/1023/1279px)`). A `@media (prefers-reduced-motion: ...)` block and its
  `@keyframes` are dropped silently, and rules in the same call may be "wiped"
  without being applied. Persistent `opacity: 0` rules can be dropped too.
  Read back with `get_design_html` after every write.
- **`write_css` stores rules even when it reports failure.** A selector that
  matches nothing on the ACTIVE page (another page's class, or any
  `::before` / `::after` selector, which never "matches") returns
  `success: false` with "applied N rule(s) ... no-op", yet the rules are
  saved and publish. A pseudo-element icon added this way doubled an icon
  that already existed. Open the page that carries the class before writing,
  treat a "no-op" result as applied, and undo it explicitly (restate the
  selector, e.g. `content: none`).
- **Colour literals can be swapped for tokens.** A hex value written with
  `allow_hardcoded` came back as the nearest token (`#1c1c1c` stored as
  `var(--color-primary)`); `rgb()` was kept. Read the rule back.
- **CMS bindings replace the bound element's children.** A text field bound
  to a parent (`<summary>`, a stat `<p>`) prints over its icon/number/caret
  spans on WordPress. Rebind to the inner span with `cms_manage_binding`
  (detach first: two text fields cannot own one element).
- **`write_css` replaces a selector's rule wholesale.** Restate every
  declaration, and the `@media` variant, of a selector you touch.
- **No tool sets a timeline's loop.** `author_animation`, `update_animation`
  and `add_timeline_interaction` have no repeat option; a looping timeline must
  come from an import with `repeat: -1` or from the interaction popover.
  `add_interaction` with `carousel` does loop (`loop`, `autoPlay`).
- **Timeline targets resolve inside the trigger element.** `author_animation`
  with `element_id` of a container and class targets under it works; a
  `[data-f0-id=...]` target is refused.
- **Timeline selectors only see the first 64 elements under their root.**
  `author_animation` / `update_animation` resolve each layer's selector by
  walking the element tree from the root (the active page, or `element_id`)
  and stop after 64 nodes BEFORE filtering, so a target deep in a big page is
  reported in `selectorsUnresolved` and its layer is dropped silently from the
  updated timeline (the import path is not affected). Read `selectorsUnresolved`
  after every write. Workaround: author on a small container's `element_id`
  (one per container if needed), and give a single-entry timeline a hold
  tween on the container so it stays a timeline (one entry becomes a simple
  animation that moves the trigger element itself). `fromTo` entries take
  `from` / `to`, as `read_animations` prints them.
- **`enabled: false` does nothing at runtime.** `update_animation` stores the
  flag and the published page carries it, but no runtime code reads it: a
  "disabled" interaction still runs. There is no delete tool. To remove an
  interaction bound by id (`[data-f0-id="X"]`), recreate the element
  (`remove_element`, then `add_element` with the same class and content) so it
  binds to nothing; for class-bound ones, delete it in the editor UI.
- **To set a simple interaction's animated element**, pass
  `scope: {"mode":"broadcast","animationTarget":".item"}` to `update_animation`.
- **`add_media_asset` may not persist** from an MCP session
  (`persisted: false`, and `f0_screenshot` / `capture_element_screenshot`
  fail with "storage access denied"). Reference an already-hosted URL, or have
  the user add the file through the Asset Browser.
- **`f0_screenshot` cannot capture a Flowgen document.** `get_design_html`
  returns `document`, a static self-contained render (no runtime, code
  elements frozen) that you can open in a browser to check layout.
- **Multi-kilobyte args** (a full TSX source) are easier sent by POSTing
  `{projectId, surface, tool, args}` to the MCP's `/invoke` with the bearer
  token from `~/Library/Application Support/f0/automation-token.txt`.

## Checking the published page

The editor canvas, the static `document` render and Preview all differ from a
published page. When the user publishes to staging, open it (Claude in Chrome)
and check:

- `getComputedStyle(document.querySelector('main')).direction` and
  `document.documentElement.lang` / `dir` - the page wrapper and `<html>` dir
  are not published (editable-html.md, "RTL");
- `window.__F0_INTERACTIONS__.interactions` - what actually ships, including
  the "disabled" ones that will still run;
- links: request every internal `href` and expect 200 (pages publish flat and
  the homepage is `index.html`; editable-html.md, "Pages publish flat");
- layout: diff it against the local build per element (match by tag +
  authored classes + occurrence; compare `display`, `position`, offset size,
  font weight, and the `offsetParent` of absolutely positioned elements) at a
  phone and a desktop width. Ignore `position: static -> relative`, which is
  f0's global `[data-f0-id]` rule; the real breaks show up as `display: none`,
  0-size boxes, weight 700 -> 400 and changed containing blocks;
- smooth scroll: the project's "Lenis smooth scrolling" setting only runs in
  the editor; the published runtime never starts Lenis. Ship it as an external
  script that loads Lenis from a CDN (imported as an "Imported script" on each
  page); Lenis on `window` needs no ScrollTrigger wiring, since f0's
  ScrollTrigger listens to window scroll;
- media: `video.readyState`, `paused`, and computed `opacity` of stacked media
  (two writers on one element show up as values neither set). f0's video runtime
  strips `autoplay` and plays videos from an IntersectionObserver; a background
  tab may not load media at all, so check in the foreground before blaming it.

## CMS handoff and going live

Staging (`sites.fmo.app`) is not production. A site published through the
WordPress flowmo theme runs a different pipeline, and its content is then
edited in the CMS. Everything below was missed on a real launch because only
staging had been checked.

- **Pick one handoff moment and one source of truth.** Before it, fix the
  source and re-import. After it, all changes go through the CMS (or MCP edits
  to the publishing project); stop re-importing, because a re-import or a
  timeline patch can miss the live content or overwrite CMS work.
- **Know which f0 project publishes the live site.** Compare element ids in the
  published HTML (`data-f0-id`) with `get_design_html` of the open project
  before any MCP repair; a re-created page or a copy has different ids.
- **The WordPress side has its own launch list**, owned by nobody unless you
  name it:
  - the 404 template (the flowmo theme's default 404 is its own setup guide,
    including dashboard login steps);
  - `<title>` and meta description on every page (the theme printed none);
  - favicon;
  - plugin widgets (an accessibility toolbar pinned over the content on phones);
  - long-form and legal pages in rich-text fields: WordPress's `wpautop`
    turned the newlines between tags into `<br>`s (text broken a word per
    line, empty list items); see editable-html.md, "Write for the CMS that
    follows";
  - header and footer bindings: shared page parts must bind to the global
    Options Page fields. Bound to one page's fields, they print empty on
    every other page.
- **Sweep production after every CMS editing session**, at 1440x900 and
  390x844, per page:
  - screenshots;
  - console errors and 4xx;
  - broken images;
  - links and buttons with no text or an empty `href`;
  - empty headings and text;
  - horizontal overflow.

  Also test the behaviour: count-ups change value, the carousel advances,
  accordions open, video plays. One editing session blanked a page's session
  titles, finale heading, CTA and footer between two checks.
  `scripts/verify-in-browser.mjs <url>` covers the generic checks.

