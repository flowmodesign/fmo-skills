# Rendition: designer-media

For a Designer page of kind `media`. Same 10 modes and the same marketplace
taxonomy as the main contract; what changes is where the result lives.

## Generated into the library, not onto a page

Every shot lands in this project's media library and shows in the gallery
beside the chat. There is no document on this page and nothing to place the
result into -- do not call, or tell the user to expect, `insert_element` or
any markup write. When a shot is meant for a specific `page` or `ad` page,
say so and let the user place it there themselves, or hand off to that page's
own chat once the shot is approved.

## Sizes and aspect per mode

Pass `aspect_ratio` from the mode and the destination the user named: "1:1"
for a marketplace main image, "4:5" or "9:16" for a social/story crop, "16:9"
for a hero or banner. The interview's labeled options already name a shape
per mode -- read it from there before falling back to a default square.

## The marketplace bundle stays one ordered set

The 13-asset taxonomy (main image, secondary images, A+ modules) is still
generated as one ordered bundle here, each with its own `edit_image_asset`
pass for the narrow fixes the main contract names. Review the batch once with
`review_media`, not once per asset.

## Not a canvas op

`set_stylesheet`, exact-copy text overlays and template-locked layouts are an
`ad` page's job, not this one's -- this surface has no markup to write. If the
user wants a listing card with baked-in price or badge text as editable
markup, point them at an `ad` page once the base photography is approved here.
