# Rendition: designer-page

For a Designer page of kind `page`. The journey shape, footage contract and
runtime checklist in the main contract are unchanged; this names the one
tool that wires the result up here.

## add_scroll_scrub is the whole mechanism

Once the footage is placed as an ordinary `<video>` (sized and positioned
through `set_stylesheet`, never inline), call `add_scroll_scrub` on it rather
than hand-writing a scroll listener, a rAF loop or a `currentTime`
assignment -- the main contract already says why by hand is wrong, and this
tool is the f0-native version of the same runtime. It re-encodes the source
with a keyframe on every frame first, which is the entire reason the scrub
reads as smooth rather than stuttering between sparse keyframes; never call
it on a raw, un-re-encoded clip expecting it to drive playback itself.

It refuses when this browser has no WebCodecs. Say so plainly rather than
silently leaving the video static -- do not fall back to a hand-authored
scroll binding, which is exactly the failure mode this tool exists to
prevent.

This is a `page`-kind mechanism only: a fixed-stage kind (`deck`, `video`,
`motion`, `ad`) has no scroll to bind to, so `add_scroll_scrub` is not on
its tool table and this rendition never reaches those kinds.
