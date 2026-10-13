# review rubric: mechanical pre-ship gate

A pre-ship checklist for a page built or edited in f0. Each item states what to
grep or inspect for and what pass/fail means. This is a MECHANICAL gate, not a
taste pass: run it right before you present the page. Items that belong to a
sibling package (the wow-moment choice, the scroll-scrub camera journey) are
not repeated here; see the **flowmo-wow-catalog** package for those.

## 1. Placeholders

Grep the HTML/copy for `lorem`, `REMOVE_THIS`, `TODO`, `<brand name>`-style
angle-bracket tokens, and empty `src=""` attributes. Fail on any hit. Every
visible string and every asset reference must be real content, not a
stand-in, and every generated or uploaded asset must actually be referenced
by the page, not sitting unused.

## 2. Em-dash / en-dash ban

Grep every visible copy string (headings, body, buttons, captions, quotes) for
the em dash (Unicode U+2014) or an en dash (U+2013) used as a separator.
Zero tolerance: one hit is a fail. Use a period, comma, colon, parentheses,
or a plain hyphen instead. Code comments are exempt. This is also f0's own
house style, per the **flowmo-authoring-contract** package and the
ASCII-fold rule every skill package itself follows.

## 3. Banned palette family

Pull the page's colors from `get_design_tokens` plus any inline hex in a
`<style>` block or `update_stylesheet`/`apply_class_styles` call, and check
each against the `banned-palettes` preset (`presets/banned-palettes.json`
at the package root). A hex within a couple of steps of a banned family's listed values (not only an
exact match) is a fail, unless the user's own explicit brand colors land
there on purpose. Also check by eye against the last page built in this
session: sharing a palette family with it is a fail even if neither family is
individually banned.

## 4. Eyebrow ration

An eyebrow is a small uppercase or mono kicker label sitting DIRECTLY above a
section's display headline in the same column. Count only that position;
uppercase mono text used as a spec strip, table caption, rail label, or
footer column head does not count. The count must be `<= ceil(sectionCount /
3)`. Over the ratio: drop the lowest-value eyebrows first, the headline alone
usually carries the section.

## 5. Hero has a real visual element

The hero section must reference a real image, video, or a live
interactive/3D layer, not a CSS-gradient-only background and not a div-built
fake product UI (fake task list, fake terminal, fake dashboard). This is a
grep for `<img>`/`<video>`/an interactive host element inside the hero
section's subtree, plus a check that the `src` is non-empty and not a stock
placeholder domain. Restates the **flowmo-frontend-design** package's Hero
elevation rule; do not ship a hero without it.

## 6. No fixed viewport-height section

Grep the page's CSS for a `height` or `min-height` rule pinning a
`ds-section` (or any structural container: `section`/`header`/`footer`/`nav`)
to a fixed viewport unit or pixel value. This is f0's equivalent of the
Tailwind `h-screen` anti-pattern: structural containers size to content,
never to a fixed height. Only the page root may carry a viewport-width value,
and only on width, never height. Fail on any structural element with a fixed
or `100vh`-style height rule.

## 7. Reduced-motion guard present

Every `author_animation` entry that plays automatically (`load`,
`scroll-reveal`, `scroll-scrub`, or any ambient loop) must have a
reduced-motion fallback: either the runtime's own reduced-motion handling, or
an explicit static resting state that looks finished with motion off. Grep
`read_animations` output for entries with no reduced-motion consideration
noted, and confirm by eye that turning off interactions preview still leaves
a complete-looking page.

## 8. CTA integrity and interaction identity

One label per call-to-action intent, page-wide: "Get in touch", "Contact
us", and "Let's talk" cannot all appear on one page. Primary CTA label is
three words or fewer and fits one line at desktop. Check that CTAs are not
all the bare `ds-button` base class with no variant and no interaction
polish: a page where every button is visually and behaviorally identical
(same variant, no hover motion, no size distinction between primary and
secondary intents) is a fail. Use `ds-button`'s own variant and size system
(`ds-button-primary`/`ds-button-secondary`/`ds-button-ghost`, size steps) plus
a tasteful per-instance hover tween so each CTA still reads as considered,
not as one shared, uninflected chrome. Every button label must pass WCAG AA
contrast against its own background; white-on-white or ghost-over-photo with
no scrim is a fail.

## 9. Screenshot-safe reveals

Grep the CSS and any inline styles for `opacity: 0` or `display: none` on an
element that also carries a `scroll-reveal`/`scroll-scrub` interaction. Per
the **flowmo-motion-design** package's FOUC rule, persistent CSS must never
hide an animated element while it waits for a viewport trigger; the runtime
owns the starting state. Hover-state
decorations that sit at `opacity: 0` until hovered are fine. A full-page
screenshot of the resting canvas state must show every section as complete,
not as a wall of invisible elements waiting to reveal.

## 10. Layout-family repetition

List every section's layout family (split text+image, N-column card grid,
full-width quote, bento, stacked list, ...). Each family may appear at most
once on a page with six or more sections; a page with 6+ sections needs at
least four distinct families. No more than two consecutive text/image zigzag
splits in a row. No `ds-grid-3-column` of three visually identical
`ds-card` elements anywhere on the page; use a 2-up zigzag, an asymmetric
grid, or a horizontal scroll instead.

## 11. Copy self-audit

Re-read every visible string. Fail on: filler verbs (elevate, seamless,
unleash, next-gen, revolutionize), fake-precise unlabeled marketing stats
("92% faster", "4.1x ROI", "10k+ teams") with no source, referent-unclear or
grammatically broken sentences, and anything that reads as an LLM trying to
sound thoughtful. Plausible, internally-consistent invented PRODUCT facts
(a price, a spec value, a dimension) for a fictional brand brief are fine;
the ban targets unverifiable performance and social-proof claims, not
catalog data.

## 12. WCAG 2.2: motion you can stop

Anything that moves on its own for more than a few seconds (an auto-advancing
carousel, a logo or card marquee, a looping flip board, an ambient GSAP loop)
needs a visible pause control, must pause while it holds pointer hover or
keyboard focus, and must stand still under reduced motion. Check
`read_animations` for every looping or autoplay entry and confirm each has
all three. A marquee that only pauses on mouse hover fails for keyboard and
touch users.

## 13. WCAG 2.2: focus is never hidden

Tab through the whole page with a sticky or fixed header (and any sticky
footer bar, cookie banner or chat bubble) in place. The focused element must
never sit fully behind one of them. Fix with `scroll-padding-top` on the
root equal to the header height token (and `scroll-padding-bottom` for a
bottom bar), not by unsticking the header. Fail on any focus stop that
lands under a sticky surface.

## 14. WCAG 2.2: target size

Every interactive target is at least 24 x 24 CSS pixels, or has enough
spacing that a 24px circle centered on it touches no other target. Primary
touch targets (nav, CTAs, form controls) should reach about 44px. Inspect
icon buttons, carousel dots, close buttons, inline social icons and footer
links; a 16px glyph with no padding is a fail.

## 15. Heading levels never skip

Walk the page outline: one `h1`, then levels that step down one at a time
(`h2` to `h3`, never `h2` to `h4`). Visual size comes from the `ds-heading-*`
class or `--text-size-*` token, not from picking a heading level for its
default look. Fail on any skipped level or a second `h1` used for styling.

## 16. Drag has a non-drag alternative

Every drag interaction (a draggable carousel or marquee, a slider, a
before/after comparison handle, sortable lists) also works with single
clicks or taps and with the keyboard: arrow buttons, arrow keys, or a plain
input. Fail on any control that can only be operated by dragging.

## 17. Alignment across a group

- **CTAs bottom-aligned:** in a row of cards with different copy lengths,
  every card's button sits on the same baseline (the card is a column flex
  container and the CTA row takes `margin-top: auto`).
- **Lists start level:** in pricing or comparison columns the feature lists
  begin at the same y, even when the plan names or prices above them differ
  in height (fixed-height header block or a subgrid).
- **Optical centering:** play triangles, arrows and asymmetric icons inside
  a circle or square are nudged to look centered, not centered by their
  bounding box (a play glyph usually needs a small shift toward its point).

Fail on any visible misalignment in a group of siblings.

## 18. Type and number finishing

- `text-wrap: balance` on headings, `text-wrap: pretty` on body paragraphs,
  so no heading ends on a single orphaned word.
- `font-variant-numeric: tabular-nums` on any number that changes or lines
  up in columns (counters, count-ups, prices in a table, timers, stats).
- The weight ladder uses the middle steps (500 medium, 600 semibold), not
  only 400 and 700; a page built from regular and bold alone reads flat.
- Sentence case for headings, buttons and labels unless the brand guide
  says otherwise; Title Case Everywhere is a template tell.

## 19. Page completeness and wayfinding

- An active state on the current nav item (and `aria-current="page"`).
- No dead `href="#"` links or buttons that do nothing; every link goes
  somewhere real or is removed.
- A skip link to `main` as the first focus stop.
- Legal links (privacy, terms, and an accessibility statement where the
  market expects one) in the footer.
- A 404 page exists for the site, styled like the rest.
- Page title and meta description set per page (through f0's site
  settings where the page tools cannot set them).

Fail on any missing item for a page that is about to ship as part of a site.

## 20. Content density

- A list of more than about five items is not shown as one flat run of
  equal cards or bullets. Group it, feature the top one to three and fold
  the rest, or put the tail behind a disclosure (native accordion, "show
  all").
- One copy register per page: pick plain-professional, warm-conversational
  or playful and hold it. A playful hero over a legal-toned body, or a
  formal page with one jokey section, reads as two authors.

## 21. Performance-safe effects

- `backdrop-filter` (frosted glass) only on fixed or sticky surfaces such
  as the navbar or a modal, never on scrolling cards or many repeated
  elements, where it repaints on every frame.
- Grain or noise textures live on one fixed, full-viewport layer with
  `pointer-events: none`, never as a background on each section or on a
  scrolling container.

Fail on either effect applied to scrolling or repeated content.

## Out of scope for this rubric

The Tier-1 wow-moment pick and its screenshot-safe-initial-paint requirement,
the scroll-scrub camera journey gate, and the six-axis anti-convergence
ledger live in the **flowmo-wow-catalog** package; the file-handoff validator
(`validate-handoff.mjs`) for an Import-page or drag-drop delivery lives in the
**flowmo-authoring-contract** package. Favicon, apple-touch-icon, manifest,
and Open Graph/Twitter-card completeness are configured through f0's site
settings surface, not through this package's page-authoring tools; check
that separately before shipping a new site, it is not part of this gate.
Run those separately when the build calls for them. The scored usability
critique (heuristics, severity, personas) is
[critique-scoring.md](critique-scoring.md); palette strategy is
[color-strategy.md](color-strategy.md).
