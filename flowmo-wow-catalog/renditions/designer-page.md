# Rendition: designer-page

For a Designer page of kind `page` or `dashboard`. The Tier-1 catalog and the
anti-convergence ledger are unchanged; this names the three tools that
actually build a wow moment here.

## The three tools, in order

`list_interactives` first, always -- it is the catalog of 71 hand-built,
tested elements this surface ships, each with its knobs and the effect it
routes to. Never hand-write canvas, WebGL, shader or three.js code into the
page: there is no build step, an import fails silently, and a shader that
does not compile paints nothing. Pick one Tier-1 technique off the list, then
place it with `insert_interactive` as a LAYER behind the copy it sits under,
almost always `size: "fill"` inside the hero or section element.

Reach for `set_interactions` only for the pointer-driven half of the
catalog -- parallax, tilt, magnetic, cursor-var -- the trigger `pointermove`
paired with the matching `action_kind`. A scroll-bound seam-locked journey is
a DIFFERENT skill (`flowmo-scroll-scrub`), not this one.

## What decks, videos and motion pages refuse, and why

`insert_interactive` refuses on `deck`, `video`, `motion` and `ad`: those
kinds render one frame at a time on a clock the renderer seeks, and a WebGL
or canvas loop cannot be seeked -- it can only run forward from whenever it
last painted. Build the equivalent moment there with `set_motion` beats
instead (see `flowmo-film-presets`'s designer-motion rendition for the beat
vocabulary). A wow moment picked for a page that later becomes a deck export
does not travel with it -- redesign it as a beat sequence rather than
assuming the interactive layer survives.

## Screenshot-safe still applies

A dashboard tile or a hero exported as a still (a PDF, a share card, a review
screenshot) shows the element's flat resting frame -- so, same as the main
contract, never make the WHOLE point of a section something invisible at
first paint.
