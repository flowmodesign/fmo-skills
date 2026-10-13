# Logo prompt compiler for generate_logo_asset

This is the final compilation layer between a Design Brain candidate (see
creative-dna-and-axes.md) and one `generate_logo_asset` call on the Designer
`logo` kind. There is no separate server-side enhancer tool - apply this
contract yourself, exactly once per candidate, converting one structured
logo-candidate specification into one precise prompt.

The creative decision is already made by the time you reach this step. Do
not replace, reinterpret, broaden, or add a second concept here. Do not
narrate this step to the user.

## Input contract

Assemble one structured candidate specification per mechanism before
writing its prompt:

```json
{
  "brand_context": {
    "name": "context only - never render it as text",
    "offering": "...",
    "industry": "...",
    "positioning": "...",
    "audience": "...",
    "values": ["..."]
  },
  "visual_axes": {
    "restrained_expressive": 50,
    "geometric_organic": 50,
    "familiar_experimental": 50
  },
  "candidate": {
    "mark_type": "wordmark | lettermark_monogram | pictorial | abstract | combination | emblem",
    "central_idea": "...",
    "visual_mechanism": "...",
    "distinctive_element": "specific silhouette, negative-space device, motif treatment, or unexpected locked color pairing",
    "shape_logic": "...",
    "treatment": "flat_vector | monoline | vector_gradient | hand_drawn_vector",
    "style_register": "...",
    "user_style_directive": "explicit user-requested style, or null",
    "composition": "..."
  },
  "palette": {
    "count": "1, 2, or 3 as required by the locked concept; more only if user_requested_more_than_three is true",
    "user_requested_more_than_three": false,
    "roles": ["primary", "accent", "background"]
  },
  "reference_signals": ["formal qualities only, never a brand/designer name"],
  "forbidden_elements": ["..."]
}
```

Treat supplied creative decisions as authoritative. If a nonessential
detail is missing, infer the smallest sensible default without changing the
central idea.

## Output contract

The result is exactly one continuous enhanced prompt string per candidate -
no bullet points inside the prompt, no explanation, no debug text - passed
as the prompt for one `generate_logo_asset` call.

The prompt follows this field order:

**mark type -> central subject/mechanism -> shape logic -> style register ->
palette behavior -> composition -> constraint tail**

Every clause must materially affect the drawing. The central
subject/mechanism portion states exactly one visual idea in one clause - do
not add a second metaphor, an "and/or" construction, or a hybrid concept.

## Stage boundary - symbol only

This flow produces a SYMBOL before typography selection (except a pure
`wordmark` candidate, where the rendered name IS the mark). For every
symbol-type candidate, never include: brand name, tagline, descriptor,
invented letters, or any other readable word. The only exception is a
`lettermark_monogram` candidate - its explicitly supplied initials inside
`candidate.visual_mechanism` are permitted, and even there "no text" still
means no additional words, taglines, or unrelated lettering.

Every non-wordmark candidate's constraint tail includes the exact phrase
"no text" (it does not need to be the final phrase).

## Distinctiveness floor

Every enhanced prompt must contain at least one concrete distinctive
element: a specifically described silhouette, a specific negative-space
device, a particular motif treatment, or an unexpected but locked
color-role pairing. Generic adjectives do not satisfy this. "Simple",
"clean", and "minimal" are allowed only when the prompt ALSO defines an
ownable construction decision. Never emit a generic swoosh, blob, orbit,
shield, spark, leaf, letter-in-circle, or interchangeable startup symbol
without a brief-specific mechanism. Describe the distinctive element
concretely enough that another designer could sketch its structure without
guessing.

## One concept per logo

The prompt expresses one central visual idea only. Never physically merge,
morph, or fuse two metaphors (cloud + mountain, leaf + flame, letter +
animal) unless the user's own request explicitly describes that exact
fusion. A single motif may use negative space or geometric transformation -
that does not authorize adding a second symbolic subject.

## Treatment and the four constraint tails

Preserve `candidate.treatment` exactly, and preserve `style_register` /
`user_style_directive` - when the user named a specific style, name it
directly and translate it into compatible drawing decisions rather than
diluting it into a generic "modern" or "premium" treatment.

- **flat_vector** - solid fills, clean SVG paths, no surface effects.
- **monoline** - uniform stroke weight, rounded caps, no fills.
- **vector_gradient** - a vector-safe linear, radial, or duotone gradient
  with the locked stop count.
- **hand_drawn_vector** - only when supplied explicitly; preserve
  intentional stroke variation and a clear silhouette. Never promise minimal
  anchor points for this treatment. Dimensional/3D treatment is forbidden
  for every treatment.

Close every prompt with the constraint tail matching the treatment, exactly:

- **flat_vector:** "Flat vector design, clean lines, no shadows, no
  texture, no text. Clean editable vector paths, SVG-friendly, minimal
  anchor points."
- **monoline:** "Monoline vector design, uniform stroke weight, rounded
  line caps, no fills, no shadows, no texture, no text. Clean editable
  vector paths, SVG-friendly, minimal anchor points."
- **vector_gradient:** "Flat vector design with the specified locked vector
  gradient, no shadows, no texture, no text. Clean editable vector paths,
  SVG-friendly, minimal anchor points."
- **hand_drawn_vector:** "Intentional hand-drawn vector strokes, approved
  surface variation, clear scalable silhouette, no shadows, no text."

## Structural priorities (in order)

1. one dominant unified silhouette
2. concrete geometric or organic construction logic
3. symmetry or intentional asymmetry
4. positive and negative-space behavior
5. stroke/fill behavior
6. internal detail limit
7. small-size scalability
8. centered isolated presentation

Prefer one coherent mechanism over several decorative ideas.

## Visual axes -> drawing decisions

Translate, never print the numbers or mention "axes" in the output:

- `restrained_expressive` -> intensity, contrast, detail density.
- `geometric_organic` -> construction, curves, regularity.
- `familiar_experimental` -> category recognition vs. novelty.

## Palette in the prompt

The palette is locked - never invent, replace, expand, or reinterpret it.
Use one, two, or three colors per the locked concept; three is a maximum,
never a default. State strict color count, role relationships (locked
primary/accent/background), and solid-vs-gradient behavior in words. Exact
hex values are never typed into the prompt string itself - pass them
through `generate_logo_asset`'s own color parameters when the tool exposes
them, sourced from `get_design_tokens`.

## Reference safety

Never output a live brand, studio, artist, or designer name. Translate any
`reference_signals` into formal qualities only - geometry, contrast,
density, rhythm, form register, material impression, energy. Never
reproduce a reference's logo mechanism, distinctive shape, composition, or
artwork.

## Vector language

For every treatment above, never use: lens, camera, lighting, depth of
field, photorealistic, cinematic, material rendering, grain, paper texture,
shadows, mockup, scene. Define drawing logic, not presentation photography -
that vocabulary belongs to mockup-contract.md, not here.

## Silent validation before submitting

- Follows the supplied `central_idea` and `visual_mechanism`.
- Central mechanism is one visual idea stated in one clause.
- No metaphors fused unless the user explicitly requested that exact fusion.
- `mark_type` and `treatment` unchanged from the candidate.
- Explicit user style present, not generalized away.
- At least one concrete distinctive element clears the floor above.
- No brand/designer names appear.
- No words appear except explicitly permitted monogram initials or a
  `wordmark` candidate's own name.
- Exact phrase "no text" appears in the constraint tail (non-wordmark
  candidates).
- Palette uses at most three colors unless the explicit override is true,
  and is not padded to reach three.
- Geometry is practical to generate as a clean vector.
- Every `forbidden_elements` entry is honored literally - never swap one
  cliche for another generic symbol.
- No camera or unsupported texture language appears.

If any check fails, rewrite the prompt before calling `generate_logo_asset`.

## Three candidates, never self-selected

Produce exactly three distinct candidates per new-logo request (see
creative-dna-and-axes.md's logo-type routing), apply this contract once per
candidate, and show all three results to the user. Never rank them
privately and present only your favorite; never treat generation success or
your own visual read as approval.
