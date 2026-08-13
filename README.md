# flowmo skills

Skills that teach Claude how to build for [flowmo](https://flowmo.ai) (f0) - the
live visual web/video editor.

Each directory is one skill: a single `SKILL.md` with YAML frontmatter, the
format Claude Code and Claude Desktop read.

| Skill | What it covers |
| --- | --- |
| `flowmo-authoring-contract` | **Start here if you are generating a file to drop into flowmo.** The mechanics of what f0 keeps, converts, or silently discards: design tokens and the `ds-*` vocabulary, the DESIGN.md format, the linted breakpoint ladder, the exact GSAP subset that converts to native interactions, media-scrub markers, the native interactions payload, and the component contract. |
| `flowmo-overview` | Operating f0 through the MCP server: the tool map, working style, what to call before writing HTML/CSS. |
| `flowmo-frontend-design` | Building pages and sections on the design-system foundation - which CSS tool writes what. |
| `flowmo-motion-design` | Authoring motion: reveals, scroll-scrub, parallax, pinned scroll stories, carousels/tabs/accordions. |
| `flowmo-interactive-design` | Interactive code elements - React/WebGL/canvas - and the scope rules that keep content editable. |
| `flowmo-3d` | The 3D scene system: meshes, GLB, materials, particles, cameras, post-FX, and wiring 3D to the timeline. |
| `flowmo-design-craft` | Tool-agnostic craft principles for visual and motion quality. |

## Installing

**Automatically.** The flowmo desktop app installs these for you: open
*Connect to Claude* and it writes them into `~/.claude/skills/` along with the
MCP server registration. Reconnect after an app update to refresh them.

**Manually.** Clone into your Claude skills directory:

```bash
git clone https://github.com/flowmodesign/fmo-skills.git /tmp/fmo-skills
cp -R /tmp/fmo-skills/flowmo-* ~/.claude/skills/
```

Claude Code and Claude Desktop both read `~/.claude/skills/`. For a single
project instead, copy them into `.claude/skills/` in that repo.

**Without installing anything.** Paste a `SKILL.md` into the conversation, or
point Claude at this repo. The authoring contract is written to be useful even
when flowmo is not running - you can generate a file anywhere and drop it in
later.

## Do you need flowmo open?

No. `flowmo-authoring-contract` is about producing a self-contained `.html` (or
a `DESIGN.md`) that survives being dropped into the editor - it needs no live
connection. The other skills describe driving a running project through the
MCP server, which does.

## Contributing

These ship inside the flowmo app, so they are generated from flowmo's own source
of truth and synced here. Corrections and clarifications are very welcome as
issues or PRs; a merged change will appear here on the next sync.

If something in a skill does not match what the app actually does, that is a bug
worth reporting - the whole point of these files is that every rule in them is
read off the real pipeline.
