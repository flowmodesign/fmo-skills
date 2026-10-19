---
name: flowmo-website-performance
version: 1
family: web
task_family: web
description: Diagnose and repair website startup, hidden media, layout shifts, dependency timing and animation cost while preserving editable content and requested effects. Use when importing or reviewing a substantial website, building expensive interactive sections, or fixing slow loading, scrolling or mobile interaction. NOT for claiming performance from import success, replacing a design to meet a score, or deploying a website.
surfaces: [assistant-web, flowgen-chat, flowgen-web-node, section, mcp]
triggers:
  - website performance
  - slow website
  - import website
  - lighthouse
  - layout shift
  - lazy loading
  - hidden media
---

# Website performance without losing the website

Import/editability validation, visual quality review and performance verification
answer different questions. Preserve the brief, linked brand, native elements,
CMS, required scripts and requested motion. Optimize when work begins and how
long it runs before reducing fidelity. A bounded text edit does not require a
whole-site benchmark; apply this method to affected startup/media/runtime work.

## Establish the cause and the artifact

Read current native HTML, CSS, TSX, interactions and project head settings. Match
scripts to actual owners and dependencies. A missing old selector is a lead,
not permission to remove a global plugin or compatibility helper. Review a
bounded list of confirmed obsolete controllers and check dependent interactions
before removing them. Avoid two controllers driving the same video or gesture.

Inspect first paint, the actual LCP candidate per viewport, layout shifts,
long tasks, dependency requests, hidden media and competing rendering loops.
Source hints do not prove network or GPU behavior. Read
[references/verification.md](references/verification.md) for browser sampling,
the exact native-ZIP workflow and the MCP evidence contract.

## Schedule expensive work deliberately

Choose per component, rather than applying one delay to the whole page:

| Policy | Appropriate work |
| --- | --- |
| Critical | Content/layout required for first paint and the actual LCP image |
| After initial paint | Visible decoration that should start without scrolling |
| On approach | Below-fold gallery, shader setup or secondary interactive section |
| On interaction | Optional desktop smooth scroll or a deliberately opened tool |
| On active state | Images, video and expensive content in inactive tabs/panels |

Fonts readiness, paint frames and idle scheduling can coordinate decoration;
an idle timeout is a scheduling bound, not a mandatory fixed delay. Reserve
layout space before pinning or async initialization. Keep complete
layout-critical CSS active before first paint. Preserve stylesheet-relative
asset URL bases when moving/bundling CSS. Do not reintroduce deferred full-sheet
activation or a project head workaround when the exporter already keeps it
blocking.

Share pinned dependency requests and texture loads; guard duplicate startup and
late initialization after disposal. Catch loading/rendering failures and retain
a usable static state. Use the dependency promise as readiness, not an inline
module script's load event. Shared caching does not cancel a module already
fetching: disposal must prevent subsequent mount work.

### Lazy ESM in scoped TSX

Static npm imports are resolved before the host mounts. For an intentionally
lazy browser module, declare its URL and use native dynamic import:

```tsx
export const f0LazyImports = {
  THREE: 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js',
};
export const f0Fields = [{ name: 'speed', type: 'range', default: 1 }];
const getEngine = () => import(f0LazyImports.THREE);
export default function Visual(props) { /* call getEngine only at the chosen startup state */ }
```

`f0LazyImports` is a literal HTTPS map. Its keys suppress automatic known-global
inference and its URLs are excluded from inferred classic CDN loading. It does
not fetch anything, implement a startup observer, or rewrite dynamic npm aliases.
`import(url)` stays a native promise through the shared compiler. Use absolute
browser-ready URLs; transitive imports still need browser-resolvable URLs or an
existing peer map. Do not load another React instance. Explicit `f0Cdns`/tool
`cdns` and static imports remain eager dependencies: do not also declare the
same library there and expect deferral. Check the compiled exported requests.

## Hidden content, rendering and input

- `loading="lazy"` and intersection alone cannot establish visual visibility
  inside pinned stories, transparent stacks or inactive panels. Check geometry,
  ancestor display/visibility/opacity, active state and document visibility.
  Pause hidden video and offscreen loops, prevent overlapping `play()` attempts,
  and remove listeners/timers and GPU resources on disposal.
- `content-visibility` can save rendering work; it is not a universal network
  deferral guarantee. Verify actual requests. Native media must retain a real
  asset reference: arbitrary `data-src`/TSX strings are not an import upload
  contract. Use supported asset fields/state behavior and check the export.
- Prioritize the measured LCP image, with dimensions. Do not make every hero
  image high priority. A late placeholder/fallback fade can become the new LCP;
  use failure/reduced-motion fallbacks without adding an unnecessary startup
  transition. Embed only suitably small assets when justified.
- Budget pixel ratio, geometry and texture work for the device. Reuse cached
  textures, spread expensive uploads and pause covered background scenes.
  Preserve reduced-motion and WebGL-failure content. Measure frame pacing
  separately: a naive fixed 33 ms gate can miss display frames.
- Optional smooth scrolling should preserve native touch scrolling and reduced
  motion. Scope gesture capture to the visible component and a touch that began
  there, permit vertical exit, clear stale gesture state, account for safe areas
  and dynamic viewport height, and keep a usable Skip/Continue path.

## Repair and verify

Repair located causes within existing edit authority, then re-read the saved
revision and test a fresh native export. Preserve essential effects rather than
silently replacing them with screenshots or disabling them for a score. Carry
content/design anti-slop review alongside performance; neither substitutes for
the other. Report unresolved budgets and unknowns without repeated blind edits.

On MCP, read `f0_guide({topic:"performance"})` and call
`f0_audit_website_performance` with actual browser reports. It inventories supplied
HTML risks and triages evidence; it does not run a browser or attest to a ZIP.
An import response starts with performance **unverified**. Distinguish saved,
exported, tested and deployed; testing never deploys.
