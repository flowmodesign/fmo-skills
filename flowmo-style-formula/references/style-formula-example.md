# Worked example: formula, token, and an assembled prompt

This walks one small asset family end to end so the shape of the SKILL.md
rules is concrete.

## Brief

A side-scrolling dungeon-crawler with a slime hero, stone-tile floors, and
glowing hazard pickups.

## Derived STYLE FORMULA (five blocks, concatenated, 60-90 words)

> Flat vector cartoon with soft gradients, rounded blobby shapes with thick
> dark-plum outlines, environment rendered in deep violet stone with charcoal
> shadows, hero rendered in warm coral-cream tones that contrast sharply
> against the stone, hazards and pickups marked with a single acid-green
> glow, moody but playful underground atmosphere under flat ambient light,
> high contrast between game elements and backgrounds, clean readable
> silhouettes, consistent side-view perspective across all assets.

This is shown to the user for approval before any asset generation starts.
Once approved, it is stored and reused byte-identical.

## Derived STYLE TOKEN (<=120 chars, for length-limited fields only)

> `flat vector cartoon, deep violet dungeon palette, glowing acid-green accents, warm coral hero contrast, thick dark-plum outlines`

## Assembling one sprite prompt

Kind: `sprite` (see the `sprite` item in `presets/kind-templates.json`).
Asset description: `the round coral slime`. Key color: the formula's palette
uses violet/plum and coral, nothing near magenta, so the default `#FF00FF`
key color is safe.

```
game sprite of the round coral slime, single character/object, full body visible, centered,
Flat vector cartoon with soft gradients, rounded blobby shapes with thick
dark-plum outlines, environment rendered in deep violet stone with charcoal
shadows, hero rendered in warm coral-cream tones that contrast sharply
against the stone, hazards and pickups marked with a single acid-green
glow, moody but playful underground atmosphere under flat ambient light,
high contrast between game elements and backgrounds, clean readable
silhouettes, consistent side-view perspective across all assets.,
on a solid uniform bright #FF00FF background, no shadows cast on the
background, no ground plane, nothing cropped at the edges
```

Note the formula is inserted byte-identical - the same paragraph would be
pasted into the `tile` prompt for the stone floor, the `background` prompt
for the establishing shot, and the `ui` prompt for the health icon, each
wrapped in that kind's own template and suffix.

## Assembling one 3D concept-image prompt (section 6 of SKILL.md)

Same formula, `three-quarter isometric view` replaces `side-view`, flat
shadow-free background replaces the key color, and a geometry clause is
added because the formula's blobby shape language implies one:

```
Concept reference image of the round coral slime, three-quarter isometric
view, low-poly faceted geometry,
Flat vector cartoon with soft gradients, rounded blobby shapes with thick
dark-plum outlines, environment rendered in deep violet stone with charcoal
shadows, hero rendered in warm coral-cream tones that contrast sharply
against the stone, hazards and pickups marked with a single acid-green
glow, moody but playful underground atmosphere under flat ambient light,
high contrast between game elements and backgrounds, clean readable
silhouettes, consistent side-view perspective across all assets.,
on a pure flat white background, no shadow, no ground plane, no clutter
```

## Contact sheet at approval time

Before locking the batch, the slime (`relative_scale: 1.0`), a spike hazard
(`relative_scale: 0.6`), and a doorway (`relative_scale: 2.0`) are placed
side by side on one canvas, each sized to its `relative_scale`, over a strip
of the stone tile. Check: does the slime read as a friendly hero against the
stone, or does it blend in? Does the spike read as small and dangerous next
to the doorway? Any answer other than yes means one regeneration, not a
rebuild of the whole set.
