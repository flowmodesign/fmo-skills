# color strategy: how much color, and light or dark

SKILL.md's color rules (one accent, a single-temperature neutral ramp, the
banned palette families) describe the default. This file names the four
color strategies a page can take, how to pick light or dark, and how the
non-default strategies stay compatible with the one-accent rule.

## Pick light or dark from the use scene

Before choosing any hex, write one sentence describing where and how the
page is actually used: who is looking, on what device, in what light, for
how long. Then let that sentence decide the ground.

- "A clinic manager checking appointments between patients on a desk
  monitor under office light" -> light ground, calm neutrals.
- "A DJ scrolling a lineup on a phone in a dark club" -> dark ground.
- "A buyer reading a long spec sheet before a purchase meeting" -> light
  ground, high text contrast, restrained color.
- "A gamer browsing a launch page at night after work" -> dark is
  plausible, but say why.

Dark is not a shortcut to "premium" or "technical", and light is not a
shortcut to "clean". If the sentence does not settle it, default to light
for reading-heavy and transactional pages and let the brand decide the
rest. Once chosen, the page keeps one ground; see the tone-switch note in
SKILL.md for the one sanctioned exception (a single deliberate band).

## The four strategies

| Strategy | What carries color | Fits | Risks |
|---|---|---|---|
| **Restrained** (default) | Neutrals carry the surface; ONE accent marks actions, focus, links and a few highlights | Product, SaaS, dashboards, docs, forms, trust-first briefs | Flat and anonymous if the neutrals are generic gray and the accent is a stock blue |
| **Committed** | One brand color owns a large share of the surface, roughly 30-60% (hero band, section grounds, footer), with neutrals for reading areas | Brands with a recognizable color, launches, campaign pages | The brand color fighting the CTA; text contrast on the colored ground |
| **Full palette** | Several named colors, each with a fixed role (per product line, per category, per data series, per section) | Multi-product brands, playful or kids' briefs, data-heavy pages, editorial illustration systems | Rainbow noise; colors assigned by mood rather than by role |
| **Drenched** | The color IS the surface: whole sections or the whole page sit on a saturated ground, type and imagery set to it | Posters, event pages, fashion, music, single-message campaigns | Fatigue on long pages, contrast failures, hard to show a CTA that stands out |

How to read the shares: estimate the area of the first two screens at
desktop that is painted with the strategy's carrier color. Restrained is
usually under 10% accent; Committed sits around a third to a half;
Drenched is most of it.

## Reconciling with the one-accent rule

The one-accent rule in SKILL.md IS the Restrained strategy, and Restrained
is the default whenever the brief does not ask for anything else.
Committed, Full palette and Drenched are deliberate choices, and the brief
(or the Design Read line) must name the strategy and the reason before
the build uses it. Without that sentence, anything beyond one accent is a
fail under the review rubric's palette item.

Even under the other strategies, keep what the one-accent rule protects:

- **One action color.** Whatever else is colored, primary CTAs, links and
  the focus ring share one color that appears nowhere decorative. Under
  Committed or Drenched this is often a contrasting accent against the
  brand ground, not the brand color itself.
- **Roles, not swatches.** Every color has a job (ground, text, action,
  category, state) recorded as a token (`var(--color-*)`); a hex that
  appears once without a role is a mistake.
- **Contrast is still checked per pair.** Body text 4.5:1, large text and
  UI parts 3:1, including secondary text on a colored ground (derive it
  from the ground's hue, not a generic gray).
- **The banned families still apply** (`presets/banned-palettes.json`),
  including the editorial broadsheet treatment, which is a type-and-rule
  pattern rather than a palette.

## Applying a strategy in f0

- Write the colors as design tokens through `get_design_tokens` / the
  stylesheet tools, then use them through `var(--color-*)`; never scatter
  literal hexes through section CSS.
- For a band that switches ground (a Committed brand band, a Drenched hero),
  rebind the color tokens on that section's scope (the `ds-section-dark`
  pattern) rather than overriding text and border colors element by
  element.
- Check the result with `f0_screenshot` at desktop and phone width: squint
  and confirm the action color is still the first thing the eye finds after
  the headline.
