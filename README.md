# flowmo skills

Skills that teach Claude how to build for [flowmo](https://flowmo.ai) (f0) - the
live visual web/video editor. Each directory is one package: a `SKILL.md` with
YAML frontmatter, plus any references/renditions/presets/flows/scripts it
explicitly links. See **Format** below for the full contract.

## Packages

| Package | What it covers | Surfaces | `mcp` |
| --- | --- | --- | --- |
| `flowmo-3d` | Meshes, GLB, PBR materials, particles, cameras, post-FX, keyframes/motion presets, and wiring 3D to the timeline. | scene3d, flowgen-3d-node, mcp | yes |
| `flowmo-3d-asset-hygiene` | Verify/repair rigged GLB models, preflight an image before image-to-3D, polycount budgets, the 3D style contract. | scene3d, flowgen-3d-node | no |
| `flowmo-3d-playblast` | Render and QC a fast camera playback of a 3D scene before a final render or handing off to video. | scene3d, flowgen-3d-node | no |
| `flowmo-3d-procedural-motion` | Sine-wave keyframe tracks over a bbox-derived group hierarchy for a non-humanoid creature/object (f0 has no bones). | scene3d | no |
| `flowmo-3d-scene-recipes` | Three named 3D scene looks as ordered `edit_scene` op sequences (glass-UI reveal, exploded assembly, blueprint-to-building). | scene3d | no |
| `flowmo-3d-shot-language` | Camera-move vocabulary: the 16 shipped motion presets plus named moves to build with `keyframe_scene`, and the ease doctrine by phase. | scene3d, assistant-video | no |
| `flowmo-ad-formats` | Brief schema and mode catalog for AI-generated marketing/UGC video ads: entity model, nine ad modes, finished-ad checklist. | assistant-video, flowgen-chat | no |
| `flowmo-authoring-contract` | **Start here for a file handoff into f0.** What f0 keeps/converts/discards on import: tokens, DESIGN.md, GSAP subset, media-scrub, native interactions, component contract. | assistant-web, flowgen-web-node, mcp | yes |
| `flowmo-brand-lock` | Compiles one Brand Lock block (spelling, logo, palette, typography, forbidden treatments) into every generating surface's prompts/edits. | assistant-web, assistant-video, designer, flowgen-chat, flowgen-image-node, flowgen-video-node, mcp | yes |
| `flowmo-cover-animator` | Turn a finished cover/hero still into a short reveal video whose last frame lands pixel-exact on the approved still. | assistant-video, flowgen-chat, designer | no |
| `flowmo-design-craft` | Tool-agnostic craft: visual hierarchy, type, color, spacing, layout, polish, animation choreography, interaction affordances. | assistant-web, assistant-video, designer, flowgen-web-node, mcp | yes |
| `flowmo-no-ai-slop-design` | Review current rendered design against the brief, brand and references; locate and repair misses while preserving deliberate effects and editable layers. | assistant-web/app/video, designer, flowgen-chat/web/image/video-node, section, mcp | yes |
| `flowmo-no-ai-slop-content` | Review saved copy/scripts for clarity, specificity, factual support and voice; preserve approved wording and verify scoped repairs. | assistant-web/app/video, designer, flowgen-chat/web/image/video-node, section, mcp | yes |
| `flowmo-design-recipe` | Mechanical craft rules: type-scale floor, one-accent-color, banned palettes, copy bans (em-dash/filler/fake-stats), motion restraint. | assistant-web, flowgen-web-node, section, designer, mcp | yes |
| `flowmo-explainer-blocks` | Narrated explainer/story video as N ~10s blocks, one style-key image, two-turn intake, assembled on the video timeline. | assistant-video, designer, flowgen-chat | no |
| `flowmo-film-presets` | Ten complete motion-film looks, one fixed phase timeline each, one rule set per target (video/HTML shot/Designer motion/3D). | assistant-video, flowgen-chat, flowgen-video-node, flowgen-shot-node, designer, scene3d | no |
| `flowmo-frontend-design` | Building pages/sections on the design-system foundation - which CSS tool writes what. | assistant-web, flowgen-web-node, section, mcp | yes |
| `flowmo-game-design` | Ports a game-creation system into f0 vocabulary: STYLE FORMULA, manifest-driven assets, game-design process, audio, UX craft. | assistant-app, assistant-web, designer, mcp | yes |
| `flowmo-interactive-design` | Interactive code elements (React/WebGL/canvas/Three.js/particles), scope/isolation rules, safe f0-tsx handoffs. | assistant-web, flowgen-web-node, section, mcp | yes |
| `flowmo-motion-design` | Web motion: reveals, scroll-scrub, parallax, pinned scroll stories, carousels/tabs/accordions, plus the importable-handoff route. | assistant-web, flowgen-web-node, flowgen-shot-node:motion, mcp | yes |
| `flowmo-overview` | How to operate f0 through the live editor and route file handoffs to the authoring contract. The map, not the mechanics. | assistant-web, flowgen-web-node, section, mcp | yes |
| `flowmo-product-photoshoot` | Brand-quality product images and marketplace listing assets: 10 photoshoot modes, 13-asset listing taxonomy. | designer, flowgen-image-node, mcp | yes |
| `flowmo-reference-boards` | Per-section mood-board images that function as the design brief before any HTML is written. | assistant-web, flowgen-chat, mcp | yes |
| `flowmo-scroll-scrub` | Direct and prepare scroll-scrubbed hero footage; verify markup satisfies f0's native scroll-scrub runtime. | assistant-web, flowgen-web-node, mcp | yes |
| `flowmo-seamless-texture` | Reference/generated image to an engine-ready seamless texture: crop, edit, trim, histogram match, seam-find, PBR derivation. | flowgen-image-node, flowgen-3d-node, scene3d, mcp | yes |
| `flowmo-style-formula` | One STYLE FORMULA per asset family, reused byte-identical across every prompt in that family so generated assets read as one set. | flowgen-image-node, flowgen-3d-node, designer, mcp | yes |
| `flowmo-thumbnail` | High-click-through thumbnails/covers: truthful info-gap concepts, identity lock across generations, optional 3D logo render. | designer, flowgen-image-node, assistant-video, mcp | yes |
| `flowmo-video-prompt-craft` | Prompt craft for AI video: anatomy, image-to-video phrasing, reference roles, negative phrasing, continuity, capability-gated fallbacks. | assistant-video, flowgen-chat, flowgen-video-node | no |
| `flowmo-wow-catalog` | Picks and builds a page's one signature "wow" moment: Tier-1 technique catalog, banned-as-Tier-1 list, anti-convergence ledger. | assistant-web, flowgen-web-node, designer, mcp | yes |

`mcp` = the package is served over the MCP server (`tools/f0-mcp/server.mjs`'s
`f0_guide`) and mirrored to the public repo below. A package without it is
private: still bundled into the app and usable by every OTHER surface it
lists, just not reachable from Claude Desktop/Code over MCP and never synced
by `scripts/publish-skills.mjs`.

## Installing

**Automatically.** The flowmo desktop app installs these for you: open
*Connect to Claude* and it writes them into `~/.claude/skills/` along with the
MCP server registration. Once connected they refresh on their own whenever you
update the app.

If you connected with an older build, that automatic refresh did not exist yet -
click *Connect to Claude* once more (or use the manual route below) to catch up.

**Manually.** Clone into your Claude skills directory:

```bash
git clone https://github.com/flowmodesign/fmo-skills.git /tmp/fmo-skills
cp -R /tmp/fmo-skills/flowmo-* ~/.claude/skills/
```

Claude Code and Claude Desktop both read `~/.claude/skills/`. For a single
project instead, copy them into `.claude/skills/` in that repo. Only packages
with `mcp` in `surfaces` are in this public clone (see Attribution and
Publishing below) - the rest ship inside the app only.

**Without installing anything.** Paste a `SKILL.md` into the conversation, or
point Claude at this repo - `flowmo-authoring-contract` needs no live f0
connection; the others describe driving a running project.

## Format

The full package contract (frontmatter fields, surfaces, renditions, preset
JSON conventions, validation rules) lives in
[`PACKAGE_FORMAT.md`](./PACKAGE_FORMAT.md) - read that before authoring or
editing a package.

## Attribution

Ten packages adapt structure and technique catalogs from
**[higgsfield-ai/skills](https://github.com/higgsfield-ai/skills)** (MIT
license): `flowmo-brand-lock`, `flowmo-design-recipe`, `flowmo-game-design`,
`flowmo-product-photoshoot`, `flowmo-reference-boards`, `flowmo-scroll-scrub`,
`flowmo-seamless-texture`, `flowmo-style-formula`, `flowmo-thumbnail`,
`flowmo-wow-catalog`. What was adapted is the underlying CRAFT - mode
catalogs, review rubrics, identity-lock and style-formula technique,
preset shapes - re-derived and rewritten for f0's own tools and `ds-*`
vocabulary; per `PACKAGE_FORMAT.md`, no package ever copies source text
verbatim regardless of the source license. Each adapting package's
`SKILL.md` frontmatter names the source with `derived_from:`.

`flowmo-film-presets` is **house-written** from technique study of a
Higgsfield marketing write-up (its `derived_from:` links the article, not
the MIT skills repo) and is **private pending a license review** - it
deliberately has no `mcp` surface, so `scripts/publish-skills.mjs` never
mirrors it to the public repo until that review closes.

Every other package (`flowmo-3d*`, `flowmo-authoring-contract`,
`flowmo-design-craft`, `flowmo-frontend-design`, `flowmo-interactive-design`,
`flowmo-motion-design`, `flowmo-overview`, `flowmo-ad-formats`,
`flowmo-cover-animator`, `flowmo-explainer-blocks`,
`flowmo-video-prompt-craft`) is original, read directly off f0's own source
(see `docs/SKILLS_SOURCE_MAP.md`, internal-only).

## Contributing

These ship inside the flowmo app, so they are generated from flowmo's own source
of truth and synced here (only the `mcp`-surfaced packages above - see
Publishing). Corrections and clarifications are very welcome as issues or PRs;
a merged change will appear here on the next sync.

If something in a skill does not match what the app actually does, that is a bug
worth reporting - the whole point of these files is that every rule in them is
read off the real pipeline.
