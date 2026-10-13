# Palette and typography contracts

Rules a generated palette or type system must satisfy before it can become
part of the Brand Lock's source of truth. These are gates, not inspiration -
a palette or pair that fails one of these is not ready to lock, no matter
how good it looks in isolation.

## Palette contract

A proposed palette (via `set_stylesheet` writing `:root` vars, or a fresh
`create_design_system` pass) must define:

- 3-6 named colors with exact hex values.
- Explicit roles: background, text, primary, accent, support. A color with
  no assigned role is not usable in the lock.
- A rationale tied to at least one Creative DNA field (see
  creative-dna-and-axes.md) - "it looked nice" is not a rationale.
- One central visual mechanism the palette expresses (not just "a blue and
  a warm neutral").
- A contrast-safe text/background relationship: roughly WCAG AA, ~4.5:1 for
  body text and ~3:1 for large text/display. Check this explicitly, don't
  eyeball it - dark themes need slightly desaturated, lifted surfaces; pure
  `#000` on pure white is harsh, not "high contrast".
- 2-3 rough logo-mechanism seeds appropriate to that palette, so a later
  logo-mechanism proposal (creative-dna-and-axes.md) has something concrete
  to build from. A palette proposal that omits mechanism seeds is
  incomplete - it doesn't yet say what kind of identity it can support.

Multiple palette options presented together must differ in strategic
emphasis, not merely hue (a "restrained neutral" option and an "expressive
saturated" option read as genuinely different systems, not the same palette
recolored).

Once selected, the palette becomes `DesignSystemPayload.colors` /
project `:root` vars via the normal design-system write path - it is never
hand-maintained as a separate object once it is live. Re-read it fresh with
`get_design_tokens` for every subsequent lock compilation rather than
caching the values from the selection turn.

## Typography contract

A proposed display/body pair must satisfy:

- **Anatomy match to the mark.** The display face's geometry and stroke
  character should complement the selected logo's construction (a
  geometric sans display face beside a geometric-constructed mark; a
  humanist serif beside an organic one) - not merely "look nice together".
- **Readability discipline.** Body text stays quieter and more legible than
  display; keep measure to roughly 60-75 characters per line where the
  target surface allows it.
- **Distinctiveness without impracticality.** Available weights, italics,
  optical sizes, and language/glyph coverage must actually support the
  brief's requested languages and sizes (poster/carousel/deck scale
  included).
- **No repeated pairs.** Every option offered to the user must use a
  unique display/body combination - never the same two families swapped, or
  identical display/body families, unless the brief explicitly asks for a
  one-family system with just weight contrast.
- **No decorative body text.** Never propose a decorative/display-only face
  for body copy. Two families that both compete for contrast, width, or
  personality do not pair - pick the one with a genuinely quieter register
  for body.

## Mapping to f0's live type system

- The three vars a design system names its faces with are `--font-heading`,
  `--font-body`, `--font-mono` (`dsFontVars.ts`'s `DS_FONT_VARS`). Read
  these from `get_design_tokens`, not from a cached description of "the
  brand font".
- When a DESIGN.md exists for the project (`designSystemMarkdownExporter.ts`
  round-trips it), its `typography` roles are the source-declared version of
  the same facts - prefer it over a visual guess when both are available,
  per the source-precedence order in brand-lock-shape.md.
- Do not create a full type-ROLE table, a line-height system, or a
  letter-spacing specification at lock time - that is a per-surface
  decision (**flowmo-frontend-design** owns type-scale tokens on the
  canvas). This contract only fixes the pair itself: which two families,
  which weights, why they were chosen.
- A design system with only `--font-heading`/`--font-body` set and no
  DESIGN.md is still a valid, lockable pair - DESIGN.md is corroborating
  evidence, not a requirement.

## Do not fake either one

Never bake final palette or typography decisions into an image generation
as a substitute for setting the actual tokens - a generated preview image is
not evidence of an exact hex or an exact letterform, and it cannot become
the lock's source of truth. Set the real `:root` values (or use the
project's design-system creation flow) and read them back through
`get_design_tokens` before locking.
