# Voice, tone and messaging

Part of the flowmo-brand-lock package - see SKILL.md for routing. This
reference fills the lock's `brand_context.tone` slot (and informs
`brand_context.positioning`) when a brand needs copy: a headline on a social
graphic, a hero line on a page, a tagline under a wordmark, the label on a
CTA. It is the verbal half of the lock - the same discipline as the palette,
applied to words.

## Voice holds, tone moves

Voice is the brand's character and does not change between surfaces. Tone is
how that character behaves in a particular moment, and it should change: the
same brand sounds different telling someone their payment failed than it does
announcing a launch. A brand that sounds identical everywhere is not
consistent, it is deaf to context. A brand whose character changes between
surfaces has no voice at all.

When the `<linked_brand>` block carries `tone` and `emotions`, those are
`source-declared` and win. Everything below is for filling gaps (`proposed`)
or for turning a one-word declaration ("friendly") into rules a generation
can actually follow.

## Place the brand on four spectra

Score each 0-100. Unspecified stays at 50, same convention as the visual
axes in creative-dna-and-axes.md.

| Spectrum | Low end sounds like | High end sounds like |
|---|---|---|
| formal - casual | complete sentences, no contractions, titles | contractions, direct address, fragments allowed |
| simple - complex | short common words, one idea per sentence | precise domain terms, layered qualification |
| serious - playful | literal, no jokes, restraint | wit, wordplay, surprise |
| reserved - expressive | understatement, few adjectives | strong feeling, exclamation used sparingly but used |

The spectra and the visual axes should agree. A restrained, geometric
identity with a wildly expressive, playful voice is a contradiction to
resolve with the user, not a style.

## Three to five voice traits

Write each trait as a pair: the quality, and the failure it must not tip
into. The second half is what makes the trait usable - "friendly" alone
licenses anything.

| Trait | Do | Don't |
|---|---|---|
| Confident, not boastful | "Ships in one afternoon." | "The most powerful platform ever built." |
| Warm, not sugary | "Glad you're here. Start with your logo." | "Yay!! We're SO excited to have you!!" |
| Expert, not lecturing | "Pick a palette first; the logo is drawn against it." | "As any design professional knows..." |
| Direct, not curt | "That file is too large. Try one under 20 MB." | "Error. Invalid file." |

Replace these examples with the brand's own; they illustrate the format, not
a default voice. Keep the list to five at most - a sixth trait usually
contradicts one of the first five.

## Tone by context

The voice traits stay fixed; each context moves the spectra a little.

| Context | Shift | Keep |
|---|---|---|
| Onboarding | warmer, simpler, one step per line | confidence - no apologizing for the product |
| Error | calmer, plainer, zero playfulness; say what happened and what to do next | directness - never blame the user |
| Success | brief lift in warmth; name the result, then the next action | restraint - no confetti language for a routine save |
| Marketing hero | the most expressive the brand gets; one claim, not three | specificity - a concrete outcome beats an adjective |
| Legal / notice | most formal and literal; no wit at all | plain words where the law allows them |
| Social | most casual; shorter, can use the brand's humor | the same traits - casual is not a different personality |

## Messaging hierarchy

One primary message, then three to five supporting points, each carrying its
own proof.

```text
Primary message: <one sentence, the single thing to remember>
Supporting point 1: <claim>  -- proof: <fact, number, named customer, demo>
Supporting point 2: <claim>  -- proof: <...>
Supporting point 3: <claim>  -- proof: <...>
```

A supporting point with no proof is a slogan; either find the proof in the
brief/brand record or drop the point. Never invent a statistic, a customer
name, or an award to fill the proof column - leave it empty and ask, or list
it under `unknowns`. On a single graphic or hero, the primary message leads
and at most one supporting point appears; the rest belong further down the
page or in the next asset of the set.

## Tests before copy ships

- **Competitor swap:** put a competitor's name on the sentence. If it still
  works, it says nothing about this brand - rewrite it around something only
  this brand can claim.
- **Read it aloud:** if it trips the tongue, or nobody would say it to a
  customer's face, rewrite it.
- **Jargon check:** every term the audience would have to look up gets
  replaced, unless the simple-complex score says this audience uses it daily.
- **Trait check:** name which voice trait the line expresses. If none, it is
  off-voice even if it reads well.

## How this feeds the Brand Lock

- `brand_context.tone` (an array) holds the voice traits verbatim in their
  "X, not Y" form, followed by the four spectrum placements written as
  `formal-casual: 30`, `simple-complex: 40`, and so on. Mark it
  `source-declared` when it came from the linked brand record's tone,
  `proposed` when this reference filled it.
- `brand_context.positioning` takes the primary message when the record has
  no positioning of its own; an existing positioning is `fixed` and the
  primary message must agree with it.
- A context tone shift that a specific deliverable needs (a legal footer on a
  social card, an error state in a mockup UI) is a per-format override under
  `applications`, named by format - never a rewrite of the core traits.
- The supporting points and their proof are copy inputs for the asset, not a
  lock slot. Exact user-supplied copy still outranks anything this reference
  would write (see qa-and-delivery.md's preflight).
