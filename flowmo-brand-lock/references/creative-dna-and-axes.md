# Creative DNA, visual axes, logo-type routing

## Compile the Creative DNA once, trace every decision back to it

Before proposing or reading a lock value, compile a compact private summary.
Every recommendation this skill makes - a color role, a mark type, a
typography pair - must trace back to at least one of these fields, not to
taste alone:

```text
PRODUCT TRUTH        what is materially, functionally, or behaviorally real
AUDIENCE DESIRE       what the intended audience wants to feel, signal, achieve
POSITIONING/VALUES    the promise the identity must communicate
NAME CUES              meaning, sound, rhythm, initials, useful letter shapes
REFERENCE SIGNALS      palette/form/type/composition/material/energy preferences
                       from anything the user supplied - never live research
VISUAL AXES            see below
CENTRAL MECHANISM      one visual idea that can generate a palette, mark, type
                       relationship, and applications
FORBIDDEN CLICHES      generic devices that would make this identity
                       interchangeable with any competitor
```

Do not run external design research to fill this in. Use only: the brief,
supplied official assets, supplied inspiration, prior turns' feedback, and
already-locked palette/logo/type slots.

## Visual axes

Three directional constraints, not style recipes. Normalize each to 0-100
when persisting them into the lock (`presets/brand-lock-template.json`
carries the same three keys):

- **Restrained <-> Expressive** - controls intensity, contrast, density.
- **Geometric <-> Organic** - controls construction and shape language.
- **Familiar <-> Experimental** - controls category recognition vs. novelty.

Never invent a value the user did not supply or imply; use 50 (balanced).
Accept natural language ("mostly expressive and organic") - do not force the
user to give numbers.

## Logo-type routing

Choose a mark type from evidence in the Creative DNA, not from taste alone.
f0's working taxonomy for this decision:

- **wordmark** - the name itself, custom-set, IS the mark. Route here when
  no symbol is warranted (short, distinctive name; category where a clean
  type treatment already differentiates) or when the user explicitly wants
  type-only.
- **lettermark / monogram** - only when the initials or the name's
  letterforms support an ownable construction tied to the brief (a genuine
  interlock, negative-space device, or shape idea built FROM those letters -
  not just "put the initials in a circle").
- **pictorial** - only when one literal product/process/object is central to
  the brief and can be represented without falling into a category cliche
  (see anti-slop below).
- **abstract** - when the strongest source material is a process, benefit,
  emotion, or relationship rather than one literal object; render it as
  nonrepresentational geometry with a concrete distinctive element.
- **combination** - a symbol (any of the above) locked into one lockup with
  the wordmark. This is normally the SHIPPED state once typography is
  approved - the symbol is generated first, symbol-only (see
  logo-prompt-enhancer.md), and the combination lockup is assembled after
  type selection, matching stroke weight, cap/x-height balance, and optical
  gap between mark and word.
- **emblem** - only for heritage, certification, membership, ritual, or
  badge/label-heavy positioning: a text-free symbol contained within a
  badge/seal boundary.
- **mascot** - only for strongly character-led, playful, community, or
  family-facing positioning; one character/creature with a clear scalable
  expression. Rare - do not default to it.

When proposing three candidate directions, prefer three DIFFERENT routes
(one name/letter-derived, one product/meaning-derived, one concept/benefit
abstract route) over three variations of the same mechanism with different
shapes. If a route is not viable for this brief, replace it with the next
strongest evidence-based type rather than force-fitting it.

## One expressive move

Each direction gets exactly ONE distinctive expressive mechanism. Every
other element in that direction stays quieter so the one move reads clearly:

- Expressive mark -> restrained palette and type.
- Expressive palette -> simpler mark and layout.
- Expressive typography -> minimal supporting graphics.

A direction with three loud moves competing for attention is not more
distinctive, it is less legible. If a candidate has more than one strong
expressive idea, cut to the strongest and let the rest recede.

## Anti-slop: brand-identity cliches

This list is about IDENTITY MARKS AND PALETTES, not page layout - pair it
with **flowmo-design-craft**'s generic-AI-look section (which covers
layout, type scale, and motion) rather than substituting for it. Reject:

- a leaf used as an automatic synonym for "organic"
- sparkles used as an automatic synonym for "premium"
- a shield used as an automatic synonym for "trust"
- a random gradient used as an automatic synonym for "modern"
- a generic globe/orbit/network mark with no product-specific meaning
- arbitrary initials in a circle with no construction idea behind them
- gold + serif as the automatic default for "luxury"
- excessive decorative devices competing with the primary mark
- several unrelated metaphors combined in one symbol
- two metaphors physically fused (cloud + mountain, leaf + flame, letter +
  animal) without the user's own request explicitly describing that exact
  fusion
- a concept described only in adjectives ("clean", "modern", "premium")
  with no concrete construction decision behind it
- a generic minimal symbol with no described silhouette, negative-space
  device, motif treatment, or unexpected color-role pairing

"Simple", "clean", and "minimal" are valid ONLY when the direction also
names an ownable construction decision. A swoosh, blob, orbit, shield,
spark, leaf, or letter-in-circle with no brief-specific mechanism behind it
is not simple, it is generic.

## Internal selection rubric

Score raw candidates privately before any of them become user-facing
options:

- relevance to the brief
- distinctiveness
- ownability
- coherence
- category suitability
- scalability
- production feasibility
- application potential
- cliche risk
- reference-copy risk

Discard weak candidates before producing the 2-3 palette/typography options
or the exactly-three logo candidates actually shown. Never expose scores,
rejected drafts, or this internal reasoning to the user.

## Essential Kit critique, before final approval

Once palette, logo, and typography are all selected, critique the combined
system before presenting it as a finished identity:

- Is every element traceable to the Creative DNA?
- Do logo, palette, and typography express ONE central mechanism, not
  several unrelated ideas?
- Could the identity be renamed for another brand without a meaningful
  change? (If yes, it is not ownable enough.)
- Is there one primary expressive move, not several competing moves?
- Is the mark scalable and producible?
- Does typography complete the mark rather than fight it?
- Does the palette support real contrast and real applications?
- Does anything copy a supplied reference?
- Does anything rely on a generic AI-branding cliche (see Anti-slop above)?

Return specific revision instructions for whatever fails. Only treat the
combined kit as ready for final approval once every check passes.
