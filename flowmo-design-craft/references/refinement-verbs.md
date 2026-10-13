# Refinement verbs

Most design requests after the first build are a single verb aimed at something that already exists. Each verb below has a specific meaning and a scope rule. The shared rule for all of them: the page's system (the `:root` tokens, the `ds-*` classes, the design system's font pair, the native interactions already wired) is the given. Touch only what was named, and say so if the system genuinely cannot express the request instead of quietly extending it.

## Bolder

Raise the named target to the conviction its neighbors already have. It is amplification, not decoration.

- **Amplify what the system already owns.** Use the existing display size at full strength, the signature motif, the strongest accent, the density shift the rest of the page uses for its peaks. The result should look more like the same brand, not like a new one.
- **No new primitives.** No new color, font, radius, shadow or token appears unless the user asks for it. If one is truly needed, name the exact addition and the job it does, and ask.
- **One decisive move, then quiet around it.** If every element got louder, the section got flatter.
- **Skeleton test.** Replace the copy with grey boxes in your head. The layout alone should still say what the section is and what matters most. If it only works once the words come back, the boldness lives in font size, not in the design.
- **Keep the content true.** Claims, numbers and quotes stay as supplied.

## Quieter

Lower intensity while keeping the point of view. Quiet is precise, not bland.

- **Color:** desaturate accents to roughly 70-85% of their current saturation; let neutrals carry more of the surface and keep the accent for the one or two places it earns.
- **Weight:** step weights down one notch, e.g. 900 -> 600, 700 -> 500. Keep at least one anchor at full weight so hierarchy survives.
- **Motion:** shorter travel (about 10-20px instead of 40px), gentler ease-out curves, and no bounce, elastic or overshoot. Cut motion that has no job.
- **Surfaces:** thinner or fainter borders, fewer layered effects, flatter elevation.
- **Never grey text on a colored fill.** Use a darker shade of that fill's hue, or the foreground at reduced opacity.
- Do not flatten everything to one size, drain all color, or remove the affordances controls need.

## Distill

Strip the view to what the user came for. Cut before adding.

- **One primary action per view.** A few secondary actions at most; everything else tertiary or behind progressive disclosure.
- **Type budget:** one family (from the design system's font pair), 3-4 sizes, 2-3 weights.
- **Palette budget:** one or two colors plus neutrals.
- **Containers:** spacing and alignment group content before a card does; never nest a card inside a card.
- **Copy:** say each thing once. A heading that already explains the state does not need an intro restating it.
- Keep every capability the user actually needs; simpler must not mean missing or mysterious.

## Harden

Make the surface survive real data and real people. Stress it before calling it done:

- **Text:** names and titles of 100+ characters, single unbroken words, emoji, RTL (Hebrew, Arabic) with logical properties so layout flips, CJK, and translation that runs 30-40% longer than English.
- **Counts:** empty, exactly one, a handful, and 1000+ items. Lists, grids and tables must hold at each.
- **Network and timing:** slow responses, offline, a request that fails halfway.
- **Input:** double submit (disable the control while the action runs), paste of oversized content, an interrupted drag or swipe, keyboard-only use.
- **Every state is designed:** empty, loading, error, success, plus disabled where a control can be unavailable. An empty state teaches the next step; a loading state names what is happening.

## Clarify

Rewrite interface text so the user knows what happened and what to do next.

- **Errors** say what failed, why (when it is known and useful), and how to recover. No internal codes as the headline, no "Oops", no jokes when work, money or access is at risk.
- **Labels name the action and its object** ("Save draft", "Delete 3 files"), not the gesture or a generic "Submit" / "OK".
- **Confirmations** repeat the action on the button; prefer undo when recovery is safe.
- **Placeholders are examples, not labels.** Persistent labels stay visible.
- Keep one word per concept across the whole product.

## Polish

Polish is finishing work on a design that is already right. If the concept itself is wrong, say so and recommend a redesign instead of slipping one in.

### Classify each drift before fixing it

- **Missing token:** a value is reused but has no name. Add a custom property in `:root` and point every use at it.
- **One-off implementation:** a hand-built thing duplicates something the system already has. Swap it for the existing `ds-*` class or token.
- **Conceptual mismatch:** the flow, structure or information architecture differs from comparable parts of the product. That is not a polish fix; raise it.
- **Local defect:** the element is simply unfinished or inconsistent. Fix it in place.

Fix at the narrowest level that removes the cause, and do not invent a system abstraction for a single exception.

### Triage order

1. Broken or blocked tasks, misleading state, inaccessible paths.
2. Missing states: loading, empty, error, success, disabled.
3. Flow, hierarchy, responsive and design-system drift.
4. Visual and motion inconsistencies.
5. Cleanup: dead styles, duplicated rules, stray debug output.

Bring the whole path up to the same bar rather than perfecting one corner.

### Bounded verification

- Inspect desktop and mobile together in one pass, collecting every finding before touching anything.
- Fix everything found in one batch.
- Run at most one confirmation round afterwards. If that round surfaces something new, fix it and report it rather than starting another open-ended loop.
