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

Any user-visible copy that could reasonably be edited belongs in real HTML
elements, not generated from inside a script. Text painted into a canvas or built
by JS is invisible to the editor, to search and to the CMS. The script should be
the BEHAVIOUR; the content stays the user's, as real elements they can select and
retype.

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
`video`, `file`, `url`, `range`, `repeater`. `select` takes `options`;
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

## Libraries

These globals are available to code running inside flowmo, and load automatically
when referenced: `THREE`, `gsap`, `d3`, `p5`, `Tone`, `Matter`, `PIXI`, `Konva`,
`Lenis`, `CANNON`, `Howl`, `Chart`, `mapboxgl`, `L`, `Zdog`, `anime`, `Rive`,
`lottie`, `marked`, `DOMPurify`, `QRCode`, `Swiper`, `SplitType`, `Splitting`.
Reference the GLOBAL (`new THREE.Scene()`) - do not import it. If what you need is
not on that list, say so: a hand-written CDN tag will not load.
