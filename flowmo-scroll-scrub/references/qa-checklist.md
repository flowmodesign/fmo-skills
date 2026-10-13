# QA checklist

Part of the flowmo-scroll-scrub skill package - see the package's SKILL.md for
routing. Run through this before presenting a scroll-scrub page as finished.

## Poster and first-paint
- [ ] Every scrub element's poster (or manifest first frame, or Lottie first
      frame) is the EXACT first frame of the deployed encoded media - not the
      source render, not a different take, not a neighboring leg's frame.
- [ ] First paint never shows a black box, a spinner, or a mismatched still
      while media loads.

## Byte budget
- [ ] Measured desktop and mobile totals (per clip and aggregate across the
      page) fall inside the budget set in
      [encode-and-hosting.md](encode-and-hosting.md) before encoding started.
- [ ] Nothing regressed the budget after a "just one more take" re-encode.

## Mobile degradation
- [ ] If a mobile-encoded source is wired in, it is as its OWN marked
      element swapped by responsive CSS at the mobile breakpoint - the
      marker/runtime has no built-in desktop/mobile source-swap of its own
      (see [runtime-requirements.md](runtime-requirements.md)), so this only
      works if it was actually authored, not assumed.
- [ ] The subject stays center-safe under a portrait `object-fit: cover` crop
      - nothing critical sits at the far left/right edge.
- [ ] Chapter copy remains readable at mobile widths without fighting the
      media for space.

## Reduced motion
- [ ] If the brief calls for a `prefers-reduced-motion` fallback, it was
      actually authored as an explicit CSS rule - the runtime does not skip
      media fetch/decode or swap to a poster automatically. Verify the
      authored rule actually hides the scrub element and shows a static state
      with the page's copy remaining fully readable and navigable.

## Scrub range sanity
- [ ] `data-f0-scrub-start` / `data-f0-scrub-end` (or the trigger's
      `trigger_config.start/end` in the live editor) actually bound the
      intended scroll span - not accidentally the whole page or a zero-length
      range.
- [ ] `data-f0-scrub-trigger` points at the right element when the observed
      scroll region differs from the media element itself.
- [ ] Scrubbing forward and backward both read correctly, including under a
      fast flick - nothing is a forward-only illusion (see seam sanity below
      for multi-leg). f0 seeks 1:1 with scroll position (no smoothing on
      plain `scroll-scrub`), so a fast flick should track immediately once
      the media is loaded, not lag or catch up.
- [ ] The scroll down-and-back pass from the flowmo-authoring-contract
      package's browser-verify recipe ran on the f0 Preview URL: `currentTime`
      follows scroll in both directions and every tracked element matches at
      the same position going down and coming back up.

## Seam sanity (multi-leg only)
- [ ] Every seam's boundary frames match: the outgoing leg's actual last
      frame reads as continuous with the incoming leg's actual first frame,
      in both scroll directions.
- [ ] Camera/subject velocity does not visibly reverse or jump across a seam.
- [ ] Each leg's own poster matches ITS OWN first frame - never borrowed from
      an adjacent leg.

## General
- [ ] No on-screen text, logo, or watermark baked into the footage itself -
      all copy is real HTML.
- [ ] Every scrub-hook selector is a class, never an `id`.
- [ ] Source media is hosted CORS-accessible; nothing 404s or fails silently
      to its poster.
