# Rendition: designer-page

For a Designer page of kind `page`, `deck`, `document`, `email`, `dashboard`
or `wireframe`. Same type-scale floor, one-accent-color rule, banned
palettes, hero/layout discipline and copy bans as the main contract, put in
Designer's own vocabulary.

## Styling goes through set_stylesheet, never Tailwind

There is no Tailwind and no utility-class build step on this surface. Every
rule the main contract asks for -- the type scale, the one accent, spacing --
is written as real CSS through `set_stylesheet`, by class and element
selector, never as an inline `style` attribute and never as a class name the
stylesheet does not define. Default mode "patch" upserts by selector and
keeps every other rule; reach for "replace" only when you mean to discard the
whole sheet.

## Tokens first, literals last

`ds-target-*` custom properties are the design system's own scale -- read
them off the design-system digest before inventing a size, a spacing value or
a color. A page, document or dashboard authored against fluid layout uses the
tokens as-is; a fixed-stage kind (`deck`) uses literal stage pixels only where
the composition genuinely needs an exact number, and still pulls color and
type FAMILY from the tokens.

## The banned palettes and copy bans apply everywhere text and color exist

A dashboard's stat tiles, a document's pull quotes, an email's CTA button and
a deck's slide type are all still subject to the main contract's banned
default palettes, the em-dash/filler-verb/fake-stat copy bans, and the
one-accent-color rule -- this is craft judgement, not page-kind-specific
advice, and it travels to every kind this rendition is mapped to.

## Motion restraint still applies where there is a timeline

`page`, `dashboard` and `wireframe` reveal on scroll or on load; `deck` and
`document` (when it carries beats) reveal on the beat clock. Either way, the
main contract's motion-restraint rule -- entrances, not decoration, nothing
competing for the same three seconds -- is what `set_motion` should write,
never hand-authored GSAP.
