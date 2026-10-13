# Rendition: designer-media

For a Designer page of kind `media`. A media page is a generation workspace,
not a canvas: there is no document, no `set_stylesheet`, and nothing to place
anything into. Everything below adapts the 11-block contract to that.

## What you are actually making here

Every thumbnail this skill produces on a media page is a PICTURE, saved into
the project's media library, not a page. The "live CSS overlay" headline mode
in the main contract needs `set_stylesheet` and a document to write it onto --
it does not exist here, so skip straight to baking the headline INTO the image
prompt (the contract's other text-rendering path). If the user later wants the
text editable as real markup, that happens on an `ad` page, not here.

## Sizes and aspect

Pass `aspect_ratio` from what the user asked for: "16:9" for a YouTube
thumbnail, "9:16" for a Shorts or Reel cover, "1:1" only if they said square.
Do not default to the page's own aspect -- a media page has none of its own,
unlike an `ad` master.

## Generate, then edit_image_asset for surgical fixes

`generate_image_asset` for the first pass, `edit_image_asset` for the
narrowly scoped tweak the main contract already names (crop, recompose a
region, fix one artefact) -- never a second full generation because the first
was "close."

## Not a canvas op

Never call `set_stylesheet`, `insert_element`, or anything that writes
markup: they do not exist on this page's tool table and the model that
reaches for one burns a turn discovering it cannot follow through. An
exact-copy overlay locked to a template belongs on a separate `ad` page,
built with `flowmo-product-photoshoot`'s marketplace flow or a fresh ad
master -- point the user there rather than trying to fake it in a still.
