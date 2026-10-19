# Interactive-code handoff

## Contents

- Choosing native interaction vs code
- Keeping visible content editable
- text/f0-tsx blocks and fields
- Runtime libraries and isolation

# 7. Scripted and interactive code

Reach for code only when the visual cannot be a styled DOM element animated by
GSAP. Anything expressible as a reveal, fade, slide, parallax, scroll-scrub,
stagger, text reveal, hover tween, marquee, counter or SVG draw belongs in
section 5 - it stays editable there and becomes an opaque box here.

## What a dropped file can carry

Two routes, and they behave differently:

- **An inline `<script>`** that is not convertible GSAP is kept as page code for
  full-page preview/export. It cannot safely manipulate the editable editor DOM
  from its isolated canvas host. For bespoke canvas / WebGL / generative
  behaviour that must play while editing, use the `text/f0-tsx` element route;
  for a faithful imported page, choose **Run as live sandbox**.
- **A `<script type="text/f0-tsx">` block** becomes a real interactive ELEMENT
  with sidebar controls (below). Use this when the user should be able to tweak
  it without touching code.

Keep it well-behaved, because it runs on the user's real page:

- Mount into your own element and size it to its container. Do not measure or
  write to `document.body`, and do not style anything outside yourself.
- Always clean up: `cancelAnimationFrame`, `removeEventListener`, dispose WebGL
  contexts and renderers, clear intervals.
- Do not attach global listeners without removing them.
- Scope scroll and resize handling to your own element.

## Keep the words editable

Keep ordinary page copy and media in real HTML elements so they remain
individually selectable and CMS-bindable. A bespoke coded widget may render
JSX and expose its copy/settings through `f0Fields`. Those controls edit the
component; they do not turn JSX or canvas text into native editable layers.
Preserve native content as `{children}` when adding behavior to an existing
element.

## Sidebar-controlled props

Inside flowmo, a code element can expose named controls that appear in the sidebar
and arrive as props, declared in the code itself:

```js
export const f0Fields = [
  { name: 'title',  type: 'text',   default: 'Hello' },
  { name: 'count',  type: 'number', default: 3, min: 0, max: 10 },
  { name: 'accent', type: 'color',  default: '#22d3ee' },
];
export default function Widget({ title, count, accent, children, isActive }) { /* ... */ }
```

Types: `text`, `textarea`, `number`, `color`, `boolean`, `select`, `image`,
`video`, `file`, `url`, `range`, `repeater`. That is the import list
(`fields-convention.ts`). The MCP `create_interactive_element` /
`update_interactive_element` schemas accept only `text`, `textarea`, `number`,
`color`, `boolean`, `select`, `image`, `url`, `range`, `repeater`: if the field may
later be edited through the MCP, declare a video as `url`. `select` takes `options`;
`number`/`range` take `min`/`max`/`step`; `repeater` takes `itemFields` (no nested
repeaters). At runtime `number`/`range` arrive as JS numbers and `boolean` as a JS
boolean; everything else is a string. Declare a field for every prop you read - an
undeclared prop is `undefined`. **Field ids derive from `name`**, so keeping a name
stable keeps the user's value and renaming it orphans that value.

`number`, `range` and `color` fields are **animatable**: the editor drives them
from the timeline, scroll or hover by mutating `props.fields.<name>` in place,
every frame, **without re-rendering**. So read them live through a ref inside the
loop and keep setup in an empty-deps effect:

```jsx
const live = React.useRef(props); live.current = props;
React.useEffect(() => {
  let raf;
  const tick = () => {
    const speed = live.current.fields?.speed ?? live.current.speed ?? 1;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, []);   // EMPTY deps - never list an animatable field here
```

A value destructured at render time is captured by the closure and stays the first
frame's value forever; listing an animatable field in a deps array re-runs setup
every frame and rebuilds the whole experience.

**Ship a component in a handoff file** by putting its source in an inert TSX
block. It arrives as a real interactive element - selectable, code-editable, with
its `f0Fields` already exposed as sidebar controls:

```html
<script type="text/f0-tsx" data-f0-code-name="Hero">
  export const f0Fields = [
    { name: 'accent', type: 'color', default: '#22d3ee' },
  ];
  export default function Hero({ accent, children }) {
    return <div style={{ color: accent }}>{children}</div>;
  }
</script>
```

- `type="text/f0-tsx"` is not a JavaScript MIME type, so a browser never runs it
  and it is never mistaken for a page script (TSX would throw on line 1).
- `data-f0-code-name` is the component's KEY. Keep it stable and PascalCase - it
  is what the element is bound to across a round trip, so renaming it detaches
  whatever was using it. Without the attribute the component still imports, under
  a positional name.
- The fields are read from the source on import, so the controls are there
  immediately. Source that does not compile still imports - you get the element
  and the error in the code editor rather than a silent no-show.
- In a ZIP, the same block can use `src="components/visual.tsx"` to include
  its component file. The importer reads it as editable source. Bundle any
  local module graph first, or map imports to hosted browser ESM modules.
- f0's sidebar and FlowGen's selected-element **Edit code and controls**
  popover expose the same controls. Source edits preserve values by field name;
  field and source changes use the owning document's undo history.
- FlowGen Code Component output uses this same native payload. Keep the
  component's import statements, `f0Imports`, `f0Cdns` and literal `f0Fields`
  intact through placement and source updates; stripping imports breaks the
  dependencies that editor, preview and export need.

## Placing and sizing a code element on the page

An imported code element is not where its TSX block was. Plan for it:

- **f0 appends every code element at the END of the page.** The user drags it
  into place after import, so the handoff must say where each one goes (a
  comment at the top of the file and in the export README), and a placeholder
  section ("drag X here, then delete this") marks the slot.
- **It renders at 100% of its f0 box, and the box has no height of its own.**
  In the editor the component sits inside `[data-f0-kind="interactive"] > div
  (100% x 100%) > div (absolute, inset 0)`; in Preview / published pages it is
  rendered straight into the `[data-f0-id]` node
  (`interactive/runtime-bundle-entry.ts`, `createRoot(node)`). A tall widget (a
  900vh scroll builder) therefore overflows on top of the sections after it,
  and the page ends where its box does. The component must size its own box:

  ```jsx
  React.useEffect(() => {
    const box = host.current.closest('[data-f0-kind="interactive"]') || host.current.parentElement;
    const prev = box.style.minHeight;
    box.style.minHeight = '900vh';           // the widget's real height
    return () => { box.style.minHeight = prev; };
  }, []);
  ```

  Do the same for an overlay widget (pills over a hero): give its box a class
  with `position: absolute` and the placement, `!important` on width/height
  because f0 writes a per-element size rule on the box. After a live import,
  also write the size on the element (`.f0-id-X[data-f0-id="X"] { height: 900vh }`)
  so the editor canvas, which shows a frozen render, lays out the same.
- **Anchors on the slot are lost.** If the slot section carried `id="build"` for
  an in-page link and the user replaces the slot with the element, the link goes
  nowhere. Have the component set the id on its box when no element has it.
- **No `position: fixed` inside a widget.** Use `position: sticky` within the
  widget instead (a bottom bar: last child, `sticky; bottom: 0`, with the
  preceding content carrying a negative `margin-bottom` of the bar's height, not
  the bar a negative `margin-top`, or the bar can peek above the widget). A sticky
  bar shows only while the widget is on screen, which is usually what was meant.
- **Its CSS may use token fallbacks.** CSS a component injects at runtime is
  outside the design-system pipeline, and a project whose DESIGN.md was never
  applied leaves every `var(--color-*)` empty. Inside the component write
  `var(--color-background, #efece8)`; in page CSS the rule above still holds.

## Media and page elements from inside a component

- **Media paths inside TSX are never uploaded or rewritten.** A `"video/clip.mp4"`
  string in the component points nowhere after import. Put the file in the page
  as a real element (a hidden `<img>` / `<video preload="none">` in an
  `aria-hidden` wrapper clipped to 1px) and read its `currentSrc` at mount, or
  expose an `image` / `url` field. f0 uploads and rewrites the element.
- **A component can drive native elements.** When the content is media the user
  should keep editing (a stack of hero videos), leave it as native elements and
  let the component find them by class and control them (opacity, play/pause,
  `currentTime`), restoring their inline styles on cleanup. The component then
  only owns behaviour and its own small UI (pills).
- **Components can talk through window events** (`dispatchEvent(new
  CustomEvent('x:start', { detail }))`), registered and removed with the rest of
  the component's listeners. Each still works alone.

## Libraries

These globals are available to code running inside flowmo, and load automatically
when referenced: `THREE`, `gsap`, `d3`, `p5`, `Tone`, `Matter`, `PIXI`, `Konva`,
`Lenis`, `CANNON`, `Howl`, `Chart`, `mapboxgl`, `L`, `Zdog`, `anime`, `Rive`,
`lottie`, `marked`, `DOMPurify`, `QRCode`, `Swiper`, `SplitType`, `Splitting`.
Reference the GLOBAL (`new THREE.Scene()`) for these classic libraries. Other
browser-compatible packages can use npm or HTTPS ESM imports:

```tsx
import { color } from 'd3-color@3.1.0';
import { Widget } from 'visual-kit';
export const f0Imports = {
  'visual-kit': 'https://esm.sh/visual-kit@1?external=react,react-dom',
};
export const f0Fields = [{name:'accent', type:'color', default:'#e57b32'}];
export default function Visual({accent}) { return <Widget color={color(accent).formatHex()}/>; }
```

The `text/f0-tsx` source, literal controls, saved values and dependency mappings
travel together through MCP/import, editor, preview and export. Controls appear
in the same native sidebar as an element made inside f0. Keep field names stable
to preserve edited values. Literal `f0Fields` metadata is read before loading
packages; computed metadata with external imports must be changed to literals.
Npm imports use esm.sh unless `f0Imports` pins another HTTPS ESM URL. React-based
CDN packages must externalize React peers (as above); f0 supplies its own React
instance. Use browser packages, not Node-only libraries or raw JSX source.
Relative/local module graphs from a ZIP must be bundled first or mapped to
hosted HTTPS modules. CSS and native media in the ZIP keep their existing import
path. For additional classic globals declare `export const f0Cdns =
['https://example.com/library.umd.js']` or pass the live tool's `cdns` array.
Never put an ESM module URL in the classic CDN list.

For delayed startup, **flowmo-website-performance** documents `f0LazyImports`:
a literal HTTPS URL map used with native `import(url)` at the chosen state.
Preserve that export alongside the controls and imports. Its declared global
names/URLs override inferred eager loading; explicit classic CDNs and static
imports still load before mount. MCP `codeElements` reports lazy URLs separately
as `lazyImports`. Verify the actual exported request timing, shared module load
and disposal/failure behavior; declaring a lazy URL does not implement those
lifecycle decisions.

`THREE` is f0's bundled build (0.170). Code written against r128 renders washed
out and dark there: read `THREE` at mount, and from r152 set `texture.colorSpace =
THREE.SRGBColorSpace` and pass colors without `convertSRGBToLinear()`; from r155
multiply light intensities by `Math.PI`. To test locally, load three 0.170 from a
CDN as an ES module and assign `window.THREE = { ...THREE }`.
