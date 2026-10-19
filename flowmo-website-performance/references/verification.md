# Verify the saved project and the exact export

For a performance repair or substantial imported page, use the actual delivery
path. Save native changes, read back the current TSX/CSS/settings/assets and
record the saved revision. Download a fresh ZIP from that source. Record byte
size and SHA-256, extract unchanged and serve with the intended compression.
Check the exact files, not a hand-optimized copy or an edited serialized payload
that the native compiler may replace. Keep a postprocessed candidate separate,
with its own hash and results; port any successful repair back into native
source and repeat the real download before claiming native-export improvement.

Use fresh browser contexts for desktop and phone, normal and reduced motion.
Record browser/Lighthouse versions, viewport, CPU/network throttling, actual
server compression and whether it is lab or physical-device testing. A local
gzip lab score is not a production score or a device guarantee. Compare before
and after under the same conditions; repeat noisy measurements as needed rather
than reporting the best run. Record the LCP node at each viewport, not just its
duration.

Useful initial diagnostic budgets are LCP <=2500 ms and CLS <=0.1. These align
with [Web Vitals](https://web.dev/articles/vitals) targets, whose field assessment
uses the 75th percentile of real users. A lab run is not that assessment. The
MCP audit also defaults to a configurable 200 ms lab TBT budget; TBT is distinct
from INP and animation FPS. Use [Lighthouse's TBT definition](https://developer.chrome.com/docs/lighthouse/performance/lighthouse-total-blocking-time)
for measurement. Do not promise a universal 90+ mobile score.

## Observe startup and behavior

The bundled `scripts/browser-probe.mjs` exports `installPerformanceProbe` for
`page.addInitScript(installPerformanceProbe)` before navigation. Read
`window.__f0PerformanceProbe.snapshot()` after initial paint and again after
scrolling/opening relevant states; call `.stop()` on teardown. It observes LCP
candidates, layout-shift session windows, long tasks, resource timing, frame
intervals, canvas dimensions and currently hidden-playing videos. It does not
calculate Lighthouse TBT/INP, count actual WebGL contexts, establish historical
media visibility or test touch gestures for you. Unsupported observers remain
explicitly unavailable. MCP readers can use their browser tooling or install
the skill to get this helper; reading a guide does not execute it.

Locate findings against the current native IDs and record viewport/state/time:

| Check | Evidence to capture |
| --- | --- |
| startup | Text/critical layout paint before optional dependency requests; decoration starts without scroll when requested; later sections initialize on approach |
| dependencies | URL/timing/owner report, shared module requests, no duplicate native/legacy controller, no eager inference defeating a declared lazy module |
| hiddenMedia | Network requests for inactive images and actual paused/playing state of hidden videos, including transparent ancestors and hidden document |
| fallbacks | Usable reduced-motion and forced module/WebGL-failure states, without a late unnecessary LCP placeholder |
| cleanup | Disposed hosts do not initialize after pending work; listeners/loops/resources stop and reload remains usable |
| animation | Frame traces during visible scrolling/animation, nonzero canvas dimensions, offscreen/covered scene pause and resume |
| touch | Gestures start in the visible component, preserve vertical exit and other page regions, work with mobile toolbars/safe areas and navigation |

Also recheck existing content, links, forms and native interactions: removing a
legacy script can break a required compatibility helper. Record page/element
counts when a broad repair could lose content. Test actual form submission
ownership; an unrelated email handler is a functional defect, separate from
the performance score. Mark a check `not_applicable` with a concrete reason
when the page does not use the feature; absence of evidence is `unverified`.

## MCP report

`f0_audit_website_performance` accepts:

- `revision`: the current saved source revision.
- `artifact`: `{kind:"native_zip",revision,sha256,bytes}` for the unchanged
  downloaded ZIP. Preview and postprocessed candidates remain separate.
- Optional exported `html` for a bounded script inventory and candidate risks.
  Script ownership that is not encoded remains unclassified; do not infer that
  it is safe to delete. Linked stylesheet bodies require separate inspection.
- `runs`: desktop/mobile x normal/reduce. Each identifies `revision`,
  `artifactSha256`, `viewport`, `motion`, `url`, `freshContext`, `environment`,
  raw `report` path/URL and `lcpElement`. Normal-motion runs include `lcpMs`,
  `cls` and Lighthouse `tbtMs`. `checks` maps the seven names in the table to
  `{status:"passed"|"failed"|"not_applicable"|"unverified",evidence:"located observation or reason"}`.
- Optional `budgets`: `{lcpMs,cls,tbtMs}`, chosen for the brief/environment.

Missing/stale/mismatched evidence stays unverified. Current measured failures
return `needs_attention`; complete caller-supplied evidence within budgets
returns `within_supplied_budget`. Neither is an independent attestation of a
save, ZIP hash, browser run or deployed site. Report remaining mobile blocking
time and other weaknesses explicitly.
