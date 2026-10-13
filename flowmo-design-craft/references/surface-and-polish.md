# Surface mode and polish details

Part of flowmo-design-craft; kept here so the embedded skill stays small.

## Surface mode
Decide the surface's job first; it comes from the surface, not the product (a dev tool's landing page persuades, a fashion label's help center is read).
- **Persuade** (landing, campaign, pricing): win attention, then an action. Commit to a visual world.
- **Operate** (app, dashboard, editor, settings): speed, scanability and consistency outrank expression. Usually one type family on a fixed rem scale (ratio about 1.125-1.2); accent marks actions, selection and state, never decoration. Avoid strangeness without purpose: invented controls, display type on labels, motion that makes people wait.
- **Read** (docs, articles, changelogs): hold the measure and a steady vertical rhythm; headings easy to scan.
- **Experience** (portfolio, gallery, showcase): the work leads; chrome stays quiet.

## Polish details
- Declare elevation once: a border or a shadow, not a hairline under a wide soft shadow.
- Nested rounded shapes: inner radius = outer radius minus the padding between them.
- Theme the browser surfaces from the palette tokens: `::selection`, `caret-color`, scrollbars, the focus ring, `text-underline-offset`; tabular numerals where numbers align or count.
- Light text on dark needs a little more line-height and tracking, and thin weights one step up. Display tracking stops around -0.04em; -0.02em to -0.03em usually reads better.
- More space above a heading than below it, so it belongs to what it introduces.
- No thick colored side stripes or hard zero-blur offset shadows unless the visual world uses them everywhere on purpose.

Reference provenance: informed by [pbakaus/impeccable](https://github.com/pbakaus/impeccable), in original f0-specific wording.
