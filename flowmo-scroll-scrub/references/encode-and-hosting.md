# Encode contract

Part of the flowmo-scroll-scrub skill package - see the package's SKILL.md for
routing. Someone has to prepare and host the scrub media before f0's runtime
can play it - this is authoring guidance for that step, independent of who
does the encoding (the author, a teammate, or a generation pipeline that
outputs a raw clip needing this pass).

## Video (`data-f0-video-scrub`)

- **Desktop:** preserve native resolution, H.264/yuv420p, CRF around 20, GOP
  (keyframe interval) around 8 frames, scene-cut keyframe insertion disabled,
  audio removed, `faststart` enabled (moov atom up front so the browser can
  start seeking before the whole file downloads).
- **Mobile:** cap height at 720px, CRF around 23, GOP around 4, audio removed,
  `faststart` enabled. A tighter GOP means less decoder work per seek, which
  matters more on mobile hardware during rapid scroll-driven seeking.
- **Poster = the exact first frame of the FINAL encoded clip.** Extract it
  after encoding, from the exact file being deployed - never from the source
  render, a different candidate take, or a neighboring leg. A poster that
  doesn't match the clip's true first frame causes a visible pop the instant
  playback starts.
- Deterministic ffmpeg shapes (adapt paths/inputs to the real project):
  - Desktop encode: `ffmpeg -i in.mp4 -an -vf "unsharp=5:5:0.8:5:5:0.0" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart out.mp4`
  - Mobile encode: `ffmpeg -i in.mp4 -an -vf "scale=-2:'min(720,ih)',unsharp=5:5:0.6:5:5:0.0" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart out-mobile.mp4`
  - Poster: `ffmpeg -ss 0 -i out.mp4 -frames:v 1 -q:v 2 poster.png` (run against
    the FINAL encoded file, not the source).
  - First/last boundary frame extraction (for a multi-leg seam handoff - see
    [journey-and-footage.md](journey-and-footage.md)): first frame is
    `ffmpeg -ss 0 -i in.mp4 -frames:v 1 -q:v 2 first.png`; the ACTUAL last
    decoded frame is extracted by reversing the short source clip rather than
    seeking near its end timestamp -
    `ffmpeg -i in.mp4 -vf reverse -frames:v 1 -q:v 2 last.png` - because a
    timestamp-based seek near the end approximates, while frame 1 of the
    reversed clip IS the true final decoded frame.
  - The `unsharp` pass compensates for the softening a CRF/GOP-tight
    scrub encode otherwise introduces; keep it on both desktop and mobile
    passes rather than dropping it to save an encode step.

## Image sequence (`data-f0-image-sequence-scrub`)

- Export frames as WebP or AVIF (smaller than PNG/JPEG at comparable quality).
- Frame count and cadence should match the intended scroll distance - more
  frames read smoother but cost more bytes; test the byte budget before
  locking frame count.
- Build the manifest the marker consumes: either
  `{"baseUrl": "...", "files": ["0001.webp", "0002.webp", ...]}` or a bare
  array of full URLs. `baseUrl` is prefixed onto non-absolute file names.
- The first frame in the manifest doubles as the resting/poster state - it is
  what paints before the user starts scrolling, so it must match the
  single-shot/leg footage contract's "first frame = establishing shot" rule.

## Lottie (`data-f0-lottie-scrub`)

- Host the `.json` (or `.lottie`) file at a stable, CORS-accessible URL.
- Keep the animation's own first frame as the resting/poster state for the
  same reason as above.
- Pick `data-f0-renderer` (`svg` | `canvas` | `html`) for quality/perf and
  `data-f0-lottie-fit` / `data-f0-lottie-align` for how it sits in its box -
  see the marker reference for the full attribute list.

## Byte budgets per breakpoint

Record an explicit AGGREGATE byte budget in the brief before encoding, and
measure the deployed files against it rather than assuming the settings above
are automatically small enough:

- Start at <=32 MiB for ALL desktop clips combined and <=16 MiB for ALL
  mobile clips combined (the whole page's scrub media, not per clip) - shorten
  or re-encode before relaxing it. For a single-shot journey this is
  effectively the one clip's budget; for a multi-leg chain it is the sum
  across every leg and connector loading on that page.
- If the aggregate is over budget, shorten the take, raise CRF slightly, or
  drop to a tighter GOP before reaching for a lower resolution - resolution
  loss is the most visible quality hit for a full-viewport scrub.

## Hosting

- Every scrub source (video, image-sequence frames, Lottie JSON) must be
  hosted at a stable, CORS-accessible URL. f0's runtime seeks the element's
  own `src` directly - it does not fetch media into a Blob first (see
  [runtime-requirements.md](runtime-requirements.md)) - but CORS still
  matters: an image-sequence frame fetched without CORS taints the runtime's
  canvas and the readback throws, and a video that fails to load simply never
  reaches a seekable `readyState`.
- Keep raw/unencoded source renders and rejected takes out of the final public
  asset path - only the exact deployed, encoded file and its matching poster
  belong there.
