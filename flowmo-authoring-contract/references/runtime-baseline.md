# Local HTML/CSS runtime baseline

Generated from src/lib/export/authoringBaseline.ts by scripts/build-authoring-baseline.mjs. Do not hand-edit this snapshot.

F0 RUNTIME BASELINE (preview-only, never project source)
Before authoring importable HTML/CSS, read f0_guide topic "mcp-html-baseline" or the flowmo-authoring-contract references/runtime-baseline.md. Use its exact generated HTML/CSS floor for local previews, before project tokens and authored styles. It is generated from the same globalExportCss used by Preview and the staticExportFloorCss used by publish; do not approximate it with a browser, Tailwind or custom reset.
Keep the floor in its own <style data-f0-runtime-baseline> block. Keep the local page frame in a <div class="f0-page" data-f0-authoring-root>. Give content elements temporary unique data-f0-id attributes so the real per-element defaults apply locally. Put actual page design on a separate semantic wrapper INSIDE that frame. The importer discards the marked floor, unwraps the marked frame and replaces temporary IDs. Never merge authored CSS/tokens into the baseline block, persist it through build/update_stylesheet, import it as design-system CSS, or add the frame as a content element. Remove the marked floor and frame when preparing the final handoff; f0 injects its current runtime floor itself.
The baseline supplies resets, page framing, layout and interaction helper classes, not the project's ds-* definitions, brand tokens or fonts. Read/reuse the actual project design system separately and load those resources for local verification. Preview uses a page query container; static publish rewrites that floor's container queries to viewport media queries. Verify the actual imported Preview/export at desktop and phone widths.

Copy this scaffold for local verification, then author inside site-root. Do not ship a separate scaffold/example HTML page in the import folder.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style data-f0-runtime-baseline>

html {
    scroll-behavior: smooth;
}

*:where(:not(.f0-source-node)) {
    box-sizing: border-box;
    text-decoration: none;
    font-size: inherit;
    margin: 0;
}

body {
    margin: 0;
    padding: 0;
}

/* Unstyled headings must match the editor canvas, which renders under Tailwind's
   preflight (h1–h6 { font-weight: inherit }). Without this a bare <h1> publishes
   in the UA bold default while the canvas shows it at normal weight — the
   "preview/export text looks totally different from the viewport" bug. Heading
   font-size is already inherited via the star rule above; authored design-system
   classes / per-element rules out-specify this and still win. */
:is(h1, h2, h3, h4, h5, h6):where(:not(.f0-source-node)) {
    font-weight: inherit;
}

[data-f0-id]:where(:not(.f0-source-node)) {
  position: relative;
  min-width: 0;
}

input:where(:not(.f0-source-node)),
button:where(:not(.f0-source-node)) {
    border-width: 0px;
    outline: none;
    background: transparent;
    color: inherit;
}

button:where(:not(.f0-source-node)) {
    cursor: pointer;
}

select:where(:not(.f0-source-node)) {
    border: 0;
    background: transparent;
    -webkit-appearance: none;
}

textarea:where(:not(.f0-source-node)) {
    outline: none;
    border: 0px;
    resize: none;
    background: transparent;
}

img:where(:not(.f0-source-node)),video:where(:not(.f0-source-node)) {
    max-width: unset;
    object-fit: cover;
    object-position: center;
    height: unset;
    width: unset;
}

/* Native <details> disclosure triangle. The UA draws it via display: list-item
   + ::marker (standard) and, on older Safari/Blink, via the non-standard
   ::-webkit-details-marker pseudo-element — which could not be reached from the
   style panel at all, so a designer had no way to remove it. Neutralize both
   here, the way every modern reset does, and let the design supply its own
   chevron. Specificity is (0,0,1), so any authored rule (class or per-element)
   out-specifies it: list-style: revert on a summary brings the UA triangle
   back, and the summary's Disclosure-marker states let you style it instead.
   Note .v3-details > summary already did this for v3 templates only; this
   generalizes it to any authored <details>. Canvas mirror:
   src/app/styles/editor-layout.css. */
summary:where(:not(.f0-source-node)) {
    list-style: none;
}

summary:where(:not(.f0-source-node))::-webkit-details-marker {
    display: none;
}

/* Fade-stack: stacks children in a single grid cell so the container sizes
   to the tallest panel and the carousel/tabs runtime can cross-fade with
   pure opacity. Works without runtime — design-time falls back to the first
   child being visible until .f0-active is assigned. */
.f0-carousel-fade:where(:not(.f0-carousel-flow)) {
  display: grid !important;
  grid-template-columns: 100% 1fr !important;
  grid-template-rows: 100% 1fr !important;
  align-items: start !important;
  justify-items: center !important;
  position: relative;
}
.f0-carousel-fade > * {
  grid-area: 1 / 1;
}

.f0-carousel-fade > :not(.f0-active):not(.state-f0-active),
.f0-carousel-fade > :not(.f0-active):not(.state-f0-active)>* {
  opacity: 0;
  pointer-events: none !important;
}
.f0-carousel-fade > .f0-active,
.f0-carousel-fade > .state-f0-active {
  opacity: 1;
  pointer-events: auto;
}
.f0-carousel-fade:not(:has(> .f0-active)) > :first-child,
.f0-carousel-fade:not(:has(> .state-f0-active)) > :first-child {
  opacity: 1;
  pointer-events: auto;
}

/* Slide-track: lays the carousel's direct children out along the axis the
   runtime translates via GSAP. The axis is stamped as f0-carousel-h /
   f0-carousel-v by the controller so the DOM layout and the translated
   property can never disagree. The fade variant above wins via !important,
   so this only governs slide/loop carousels.

   --f0-visible (slides in view) and --f0-gap (the track's own gap on the
   main axis) are written by the controller; the defaults keep the rule sane
   design-time before any controller runs. Kept as a low-specificity rule on
   purpose - an authored per-slide width still wins. */
.f0-carousel:not(.f0-carousel-fade) {
  display: flex;
  overflow: hidden;
  position: relative;
}
.f0-carousel-h:not(.f0-carousel-fade) { flex-direction: row; }
.f0-carousel-v:not(.f0-carousel-fade) { flex-direction: column; }
.f0-carousel:not(.f0-carousel-fade) > * {
  flex: 0 0 calc(
    (100% - (var(--f0-visible, 1) - 1) * var(--f0-gap, 0px)) / var(--f0-visible, 1)
  );
  min-width: 0;
  min-height: 0;
  /* The track shift lives on the SLIDES, never on the container: the
     container is what clips, and translating a clipping box moves its own
     clip with it, so it just leaves its layout slot instead of revealing the
     next slide. Uses the standalone translate property, not transform, so a
     per-slide GSAP animation (which writes transform) composes with the
     carousel instead of fighting it. */
  translate: var(--f0-shift-x, 0px) var(--f0-shift-y, 0px);
}

/* Tab buttons (carousel bullets styled as a tab bar) + accordion panel clip.
   The active tab carries .state-f0-active (toggled by the carousel runtime). */
.f0-tab { cursor: pointer; }
.f0-accordion-panel { overflow: hidden; }

.page, .f0-page {
    display: grid;
    min-height: 900px;
    width: 100vw !important;
    font-family: var(--font-body);
    background: #fff;
}

a:where(:not(.f0-source-node)) {
font-family: var(--font-body);
}

/* Smooth-resizing scale-lock — class added by buildScaleLockScript at runtime.
   The script owns the exact width / transform / left-offset inline (width is
   set !important to beat the 100vw rule above); these rules just prevent the
   horizontal scrollbar the scaled-and-centered page would otherwise produce. */
html.f0-scale-lock, body.f0-scale-lock { overflow-x: hidden; }
body.f0-scale-lock { position: relative; }
.free-mode.f0-page {
  display: grid !important;
  grid-template-columns: 100% 1fr !important;
  grid-template-rows: 100% 1fr !important;
  align-items: start !important;
  justify-items: start !important;
}
html .free-mode {
    display: grid;
    grid-template-columns: 100% 1fr;
    grid-template-rows: 100% 1fr;
    /* grid-area: 1 / 1 / 2 / 2; */
    align-items: start;
    justify-items: start;
}

.free-mode>[data-f0-id] {
    grid-area: 1 / 1 / 2 / 2 !important;
}

[data-f0-role="mask"] {
    opacity: 0!important;
}

/* Follow-mouse custom cursor: applied by the follow-mouse runtime to
   targets in snap-to-cursor mode. The follower must detach from layout so
   a translate3d(clientX, clientY) lands it exactly under the pointer.
   Magnetic followers (keepPosition=true) keep their layout slot and never
   receive this class. Sister rule lives in src/app/globals.css. */
.f0-follow-cursor {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    pointer-events: none !important;
    z-index: 2147483646;
    will-change: transform;
}
    .glowing-border,
.glowing-border-assistant,
.glowing-border-assistant-button {
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
}

[data-f0-role="mask"] {
  opacity: 0 !important;
}

.f0-auto-bar-scroll::-webkit-scrollbar {
  display: none;
}

/* ═══════════════════════════════════════════════════════════════════════ */

.f0-effect-overlay {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none !important;
  z-index: 999;
}

.effect-film-grain {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.3'/%3E%3C/svg%3E") !important;
  background-size: cover !important;
  mix-blend-mode: overlay !important;
  opacity: var(--effect-opacity, 0.4) !important;
  animation: f0-grain-flicker calc(var(--effect-speed, 0.15) * 1s) steps(4, jump-none) infinite;
}

@keyframes f0-grain-flicker {
  0% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(-1px, 1px);
  }

  50% {
    transform: translate(1px, -1px);
  }

  75% {
    transform: translate(-1px, -1px);
  }

  100% {
    transform: translate(0, 0);
  }
}

.effect-vignette {
  background: radial-gradient(ellipse at center,
      transparent calc(var(--effect-spread, 40) * 1%),
      rgb(0 0 0 / var(--effect-opacity, 0.7)) 100%) !important;
}

.effect-cinematic-bars {
  background: linear-gradient(to bottom,
      black calc(var(--effect-bar-size, 12) * 1%),
      transparent calc(var(--effect-bar-size, 12) * 1%),
      transparent calc(100% - var(--effect-bar-size, 12) * 1%),
      black calc(100% - var(--effect-bar-size, 12) * 1%)) !important;
}

.effect-scanlines {
  background-image: repeating-linear-gradient(0deg,
      transparent 0px,
      transparent calc(var(--effect-line-gap, 4) * 1px),
      rgb(0 0 0 / var(--effect-opacity, 0.15)) calc(var(--effect-line-gap, 4) * 1px),
      rgb(0 0 0 / var(--effect-opacity, 0.15)) calc(var(--effect-line-gap, 4) * 2px)) !important;
  background-size: 100% calc(var(--effect-line-gap, 4) * 2px) !important;
  animation: f0-scanlines-roll 2s linear infinite;
}

@keyframes f0-scanlines-roll {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 0 calc(var(--effect-line-gap, 4) * 2px);
  }
}

.effect-light-leak {
  background:
    radial-gradient(ellipse at 20% 50%, rgb(255 180 50 / var(--effect-opacity, 0.25)) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 30%, rgb(255 100 50 / var(--effect-opacity, 0.25)) 0%, transparent 50%) !important;
  mix-blend-mode: screen !important;
  opacity: var(--effect-intensity, 1) !important;
  animation: f0-light-leak-drift calc(var(--effect-duration, 8) * 1s) ease-in-out infinite alternate;
}

@keyframes f0-light-leak-drift {
  0% {
    background-position: 0% 0%, 0% 0%;
  }

  100% {
    background-position: 10% 5%, -10% -5%;
  }
}

.effect-bokeh {
  background:
    radial-gradient(circle 80px at 15% 25%, rgb(255 255 255 / var(--effect-opacity, 0.1)) 0%, transparent 100%),
    radial-gradient(circle 50px at 75% 15%, rgb(255 255 255 / var(--effect-opacity, 0.1)) 0%, transparent 100%),
    radial-gradient(circle 65px at 60% 70%, rgb(255 255 255 / var(--effect-opacity, 0.1)) 0%, transparent 100%),
    radial-gradient(circle 40px at 30% 80%, rgb(255 255 255 / var(--effect-opacity, 0.1)) 0%, transparent 100%),
    radial-gradient(circle 55px at 85% 55%, rgb(255 255 255 / var(--effect-opacity, 0.1)) 0%, transparent 100%) !important;
  mix-blend-mode: screen !important;
  transform: scale(var(--effect-scale, 1));
  animation: f0-bokeh-drift calc(var(--effect-duration, 12) * 1s) ease-in-out infinite alternate;
}

@keyframes f0-bokeh-drift {
  0% {
    background-position: 0 0, 0 0, 0 0, 0 0, 0 0;
  }

  100% {
    background-position: 6% 4%, -4% 6%, 4% -4%, -6% -3%, 3% 5%;
  }
}

.effect-glow {
  background: radial-gradient(circle at center,
      rgb(79 143 255 / var(--effect-opacity, 0.2)) 0%,
      transparent 60%) !important;
  mix-blend-mode: screen !important;
  filter: hue-rotate(calc(var(--effect-color, 0) * 1deg)) !important;
  animation: f0-glow-pulse calc(var(--effect-duration, 4) * 1s) ease-in-out infinite alternate;
}

@keyframes f0-glow-pulse {
  0% {
    opacity: 0.6;
  }

  100% {
    opacity: 1;
  }
}

.effect-shine-sweep {
  background: linear-gradient(105deg,
      transparent 40%,
      rgb(255 255 255 / var(--effect-opacity, 0.25)) 50%,
      transparent 60%) !important;
  background-size: 200% 100% !important;
  animation: f0-shine-sweep calc(var(--effect-duration, 4) * 1s) linear infinite;
}

@keyframes f0-shine-sweep {
  0% {
    background-position: -100% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* ─── Whoosh effects (animated overlays) ─── */

.effect-whoosh-right,
.effect-whoosh-left {
  background: linear-gradient(105deg,
      transparent 35%,
      rgb(255 255 255 / var(--effect-opacity, 0.7)) 50%,
      transparent 65%) !important;
  background-size: 250% 100% !important;
  filter: blur(6px);
  /* Confine the gradient to a vertical band so translateX actually moves a
     visible "streak" across the parent rather than tiling a full sheet. */
  width: 60% !important;
  inset: 0 auto 0 20% !important;
  opacity: 0;
  will-change: transform, opacity;
}

.effect-flash {
  background: white !important;
  opacity: 0;
  will-change: opacity;
}

.effect-speed-lines {
  background-image: repeating-linear-gradient(90deg,
      transparent 0px,
      transparent 40px,
      rgb(255 255 255 / var(--effect-opacity, 0.5)) 40px,
      rgb(255 255 255 / var(--effect-opacity, 0.5)) 42px,
      transparent 42px,
      transparent 80px) !important;
  background-size: 200% 100% !important;
  filter: blur(2px);
  opacity: 0;
  will-change: transform, opacity;
}

.effect-shock-ring {
  background: transparent !important;
  /* The element itself is the ring — no pseudo. width/height set so
     transform-origin: center works under scale. */
  width: 20px !important;
  height: 20px !important;
  inset: 50% auto auto 50% !important;
  margin: -10px 0 0 -10px !important;
  border-radius: 50% !important;
  border: 4px solid rgb(255 255 255 / var(--effect-opacity, 0.8)) !important;
  transform-origin: center;
  will-change: transform, opacity;
}

.effect-light-streak {
  background: radial-gradient(ellipse 60% 8% at 50% 50%,
      rgb(255 240 200 / var(--effect-opacity, 0.9)) 0%,
      transparent 80%) !important;
  mix-blend-mode: screen !important;
  filter: blur(2px);
  transform: rotate(-12deg);
  opacity: 0;
  will-change: transform, opacity;
}
/* ═══════════════════════════════════════════════════════════════════════ */
@container (min-width: 1280px) {
  .desktop-hide {
    display: none !important;
  }
}

@container (max-width: 1279px) and (min-width: 768px) {
  .tablet-hide {
    display: none !important;
  }
}

@container (max-width: 767px) {
  .mobile-hide {
    display: none !important;
  }
}


/**
 * v3 MICRO-INTERACTIONS — CSS-only, no JavaScript, accessible.
 *
 * Every v3 section links this after `foundation.css`. All motion is:
 *   • Progressive enhancement — content is fully visible/usable without it.
 *   • Gated behind `prefers-reduced-motion` (disabled when the user opts out).
 *   • Class/attribute driven so authors opt in per element.
 *
 * Hooks (add to elements in section HTML):
 *   .v3-reveal              fade+rise in when scrolled into view
 *   .v3-reveal--left/right  directional reveal
 *   .v3-reveal--scale       scale-up reveal
 *   [data-stagger]          on a parent → children reveal in sequence
 *   .v3-hover-lift          lift + shadow on hover (cards/tiles)
 *   .v3-hover-zoom          image zoom-on-hover (wrap img in this, overflow hidden)
 *   .v3-link-underline      animated underline grow on hover
 *   .v3-arrow               nudge a trailing arrow/icon on hover of the link/button
 *   .v3-marquee             infinite horizontal scroll (logo strips); pauses on hover
 *   .v3-tilt                subtle pointer-agnostic press feedback
 *   .v3-float               gentle idle float (decorative/floating slots)
 *   .v3-details             <details> with animated height:auto open/close + marker
 *   .v3-tabs                ARIA tablist with sliding active state
 *
 * Author note: keep `opacity:0` ONLY inside the @media(prefers-reduced-motion:
 * no-preference) + @supports block so non-supporting / reduced-motion users
 * always see content. That is the structure used throughout this file.
 */

/* ───────────────────────────── Scroll reveal ─────────────────────────────
   Uses scroll-driven animations (animation-timeline: view()). Where supported
   AND motion is allowed, elements start hidden and animate in as they enter the
   viewport. Everywhere else they are simply visible. No JS, no IntersectionObserver. */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .v3-reveal {
      opacity: 1 !important;
      transform: unset !important;
      animation: v3-reveal-up linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 35%;
    }

    .v3-reveal--left {
      animation-name: v3-reveal-left;
    }

    .v3-reveal--right {
      animation-name: v3-reveal-right;
    }

    .v3-reveal--scale {
      animation-name: v3-reveal-scale;
    }

    .v3-reveal--fade {
      animation-name: v3-reveal-fade;
    }

    /* Staggered children: each direct child reveals slightly later as the
       group scrolls in. Pure CSS sequence via per-child animation-range. */
    [data-stagger]>* {
      opacity: 0;
      animation: v3-reveal-up linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 30%;
    }

    [data-stagger]>*:nth-child(1) {
      animation-range: entry 0% cover 22%;
    }

    [data-stagger]>*:nth-child(2) {
      animation-range: entry 4% cover 26%;
    }

    [data-stagger]>*:nth-child(3) {
      animation-range: entry 8% cover 30%;
    }

    [data-stagger]>*:nth-child(4) {
      animation-range: entry 12% cover 34%;
    }

    [data-stagger]>*:nth-child(5) {
      animation-range: entry 16% cover 38%;
    }

    [data-stagger]>*:nth-child(6) {
      animation-range: entry 20% cover 42%;
    }

    [data-stagger]>*:nth-child(7) {
      animation-range: entry 24% cover 46%;
    }

    [data-stagger]>*:nth-child(8) {
      animation-range: entry 28% cover 50%;
    }
  }
}

@keyframes v3-reveal-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes v3-reveal-left {
  from {
    opacity: 0;
    transform: translateX(-32px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes v3-reveal-right {
  from {
    opacity: 0;
    transform: translateX(32px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes v3-reveal-scale {
  from {
    opacity: 0;
    transform: scale(0.94);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes v3-reveal-fade {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* ───────────────────────────── Entrance (@starting-style) ─────────────────
   For elements that appear via state change (e.g. dialog/popover open, or a
   freshly mounted node). Animates from the starting style to the current one. */
@media (prefers-reduced-motion: no-preference) {
  .v3-enter {
    transition: opacity var(--transition-normal), transform var(--transition-normal);
  }

  @starting-style {
    .v3-enter {
      opacity: 0;
      transform: translateY(8px);
    }
  }
}

/* ───────────────────────────── Hover: lift ───────────────────────────────
   Cards, tiles, pricing columns. Combine with ds-card*/
.v3-hover-lift {
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
  will-change: transform;
}

@media (prefers-reduced-motion: no-preference) {
  .v3-hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
}

/* ───────────────────────────── Hover: image zoom ─────────────────────────
   Wrap an <img>/media in .v3-hover-zoom (which must clip overflow). */
.v3-hover-zoom {
  overflow: hidden;
}

.v3-hover-zoom>img,
.v3-hover-zoom>picture>img,
.v3-hover-zoom>video {
  transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

@media (prefers-reduced-motion: no-preference) {

  .v3-hover-zoom:hover>img,
  .v3-hover-zoom:hover>picture>img,
  .v3-hover-zoom:hover>video {
    transform: scale(1.05);
  }
}

/* ───────────────────────────── Animated underline ────────────────────────
   Links and nav items. Underline grows from left on hover/focus. */
.v3-link-underline {
  position: relative;
  text-decoration: none;
}

.v3-link-underline::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  height: 1.5px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.v3-link-underline:hover::after,
.v3-link-underline:focus-visible::after {
  transform: scaleX(1);
}

/* ───────────────────────────── Arrow nudge ───────────────────────────────
   A trailing arrow/icon (.v3-arrow__icon) slides right when its
   .v3-arrow ancestor (link/button) is hovered. */
.v3-arrow__icon {
  transition: transform var(--transition-normal);
  display: inline-block;
}

@media (prefers-reduced-motion: no-preference) {
  .v3-arrow:hover .v3-arrow__icon {
    transform: translateX(4px);
  }
}

/* ───────────────────────────── Marquee (logo strips) ─────────────────────
   Duplicate the track contents twice in HTML for a seamless loop. */
.v3-marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.v3-marquee__track {
  display: flex;
  width: max-content;
  gap: var(--spacing-2xl);
}

@media (prefers-reduced-motion: no-preference) {
  .v3-marquee__track {
    animation: v3-marquee 32s linear infinite;
  }

  .v3-marquee:hover .v3-marquee__track {
    animation-play-state: paused;
  }
}

@keyframes v3-marquee {
  to {
    transform: translateX(-50%);
  }
}

/* ───────────────────────────── Float (decorative) ────────────────────────
   Floating/decorative slots — gentle idle drift. */
@media (prefers-reduced-motion: no-preference) {
  .v3-float {
    animation: v3-float 7s ease-in-out infinite;
  }

  .v3-float--slow {
    animation-duration: 11s;
  }
}

@keyframes v3-float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

/* ───────────────────────────── Press feedback ────────────────────────────*/
.v3-tilt {
  transition: transform var(--transition-fast);
}

.v3-tilt:active {
  transform: scale(0.98);
}

/* ───────────────────────────── <details> accordion ───────────────────────
   Native, accessible, SEO-friendly. Animates open/close height to auto via
   interpolate-size (declared in foundation.css) + ::details-content where
   supported, with a transform/opacity fallback. Marker rotates. */
.v3-details {
  border-bottom: 1px solid var(--color-border);
}

.v3-details>summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  cursor: pointer;
  list-style: none;
  padding-block: var(--spacing-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.v3-details>summary::-webkit-details-marker {
  display: none;
}

.v3-details__marker {
  flex-shrink: 0;
  transition: transform var(--transition-normal);
}

.v3-details[open]>summary .v3-details__marker {
  transform: rotate(45deg);
}

.v3-details__body {
  color: var(--color-text-muted);
  padding-bottom: var(--spacing-lg);
}

/* Modern path: animate the height of the disclosure to auto. */
@supports (interpolate-size: allow-keywords) {
  .v3-details::details-content {
    block-size: 0;
    overflow: hidden;
    opacity: 0;
    transition: block-size var(--transition-normal), opacity var(--transition-normal), content-visibility var(--transition-normal) allow-discrete;
  }

  .v3-details[open]::details-content {
    block-size: auto;
    opacity: 1;
  }
}

/* ───────────────────────────── Tabs (ARIA tablist) ───────────────────────
   No native tab primitive — use role="tablist"/role="tab"/role="tabpanel".
   The :has() selector + the CSS-only radio pattern keeps it JS-free where the
   author wires inputs; otherwise the editor's interaction layer drives it.
   This block only styles the visual transition of the active indicator. */
.v3-tabs__list {
  display: inline-flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
  background: var(--color-surface);
  border-radius: var(--radius-full);
}

.v3-tabs__tab {
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  font: inherit;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  transition: color var(--transition-fast), background var(--transition-normal);
}

.v3-tabs__tab[aria-selected="true"] {
  color: var(--color-text);
  background: var(--color-background);
  box-shadow: var(--shadow-sm);
}

.v3-tabs__panel {
  animation: v3-reveal-fade var(--transition-normal) both;
}

/* ───────────────────────────── Focus rings (a11y) ────────────────────────
   Keyboard-only focus ring tracking the brand --color-ring. */
.v3-focusable:focus-visible,
.v3-tabs__tab:focus-visible,
.v3-details>summary:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}

/* ───────────────────────────── Ambient blobs ─────────────────────────────
   Background decorative gradient blobs (background slot). */
.v3-blob {
  position: absolute;
  border-radius: var(--radius-full);
  filter: blur(80px);
  /* Kept deliberately subtle so the ambient glow reads as soft light rather
     than an out-of-place colored circle across different brand themes. */
  opacity: 0.28;
  pointer-events: none;
  z-index: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .v3-blob--drift {
    animation: v3-float 14s ease-in-out infinite;
  }
}

/* ───────────────────────────── Reduced motion kill switch ────────────────*/
@media (prefers-reduced-motion: reduce) {

  .v3-reveal,
  [data-stagger]>*,
  .v3-tabs__panel {
    opacity: 1 !important;
    animation: none !important;
  }

  .v3-marquee__track,
  .v3-float,
  .v3-blob--drift {
    animation: none !important;
  }
}
/* f0 layout utilities - a closed, shipped vocabulary. Never authored, never stored. */

/* Container: one centred column with a max width. Two knobs, both read with a
   fallback so the sheet stands alone; setting them on :root retunes every
   container at once. `width: stretch` and not `100%` because that is the
   spelling the Resizing control reads back as Fill - and where the keyword is
   unsupported, width falls back to auto, which for a block box is the same
   picture. */
.f0-container {
  width: stretch;
  max-width: var(--f0-container-width, 1200px);
  margin-inline: auto;
  padding-inline: var(--f0-container-pad, 24px);
}

/* Stack and row: the two flows. A row centres its children on the cross axis
   because a heading next to a button is the common case and top-aligning it
   reads as a bug rather than as a decision. */
.f0-stack {
  display: flex;
  flex-direction: column;
}

.f0-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/* Wrap at every width. A row already wraps below the mobile boundary (see the
   query at the end of this sheet); this is for a row that should wrap on a
   desktop too, such as a logo wall or a tag list. */
.f0-wrap {
  flex-wrap: wrap;
}

/* Grid: auto-fit, so the column COUNT is a consequence of the available width.
   That is what makes the grid responsive with no breakpoint at all, and it is
   why this is the only grid in the vocabulary - a fixed 3-column grid is a
   decision Style can make by overriding grid-template-columns. */
.f0-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--f0-grid-min, 260px), 1fr));
}

/* The gap scale. ONE scale for stack, row and grid, so a page has one rhythm
   instead of a per-section guess. Each step reads its own variable first, so
   retuning the whole page is five declarations on :root rather than an edit to
   every element. */
.f0-gap-xs { gap: var(--f0-gap-xs, 8px); }
.f0-gap-sm { gap: var(--f0-gap-sm, 16px); }
.f0-gap-md { gap: var(--f0-gap-md, 24px); }
.f0-gap-lg { gap: var(--f0-gap-lg, 40px); }
.f0-gap-xl { gap: var(--f0-gap-xl, 64px); }

/* Alignment. Two, because "spread apart" and "centred" are the two a layout
   cannot express any other way. Everything else - text alignment, per-child
   alignment, baselines - is a Style decision and does not belong in a floor. */
.f0-between {
  justify-content: space-between;
}

.f0-center {
  justify-content: center;
  align-items: center;
}

/* Fill and Hug. The spellings are the ones f0's Resizing control reads back;
   any other spelling of the same picture shows the user a raw value instead of
   a control. flex-grow / flex-shrink ride along because on a flex MAIN axis the
   keyword alone does not hold: `stretch` is not a definite basis so the item
   does not actually fill, and `max-content` collapses under a competing
   sibling unless shrink is off. */
.f0-fill {
  width: stretch;
  flex-grow: 1;
}

.f0-hug {
  width: max-content;
  /* A Hug that can push the page wider than the viewport is a horizontal
     scrollbar, not a layout. The width keyword still reads back as Hug. */
  max-width: 100%;
  flex-shrink: 0;
}

/* WebKit renders `stretch` and `max-content` badly on replaced elements, so
   media takes the Safari-safe equivalents the editor itself stores for the same
   intent (Fill is 100%, Hug is unset). Tag+class, so these out-specify the pair
   above on their own - no forcing. */
img.f0-fill,
video.f0-fill,
picture.f0-fill {
  width: 100%;
}

img.f0-hug,
video.f0-hug,
picture.f0-hug {
  width: unset;
}

/* The ONE breakpoint this sheet owns. A row that cannot fit its children on a
   phone is not a layout decision, it is an overflow - so rows wrap below the
   mobile boundary. 767px is f0's mobile boundary and the only sanctioned one
   below tablet (src/components/AIAssistant/agent/prompts/breakpointRules.ts).
   A plain @media is correct HERE and only here: this sheet is INJECTED as text
   and never goes through the import, so the @media-to-container-query
   conversion that governs authored CSS does not apply to it. */
@media (max-width: 767px) {
  .f0-row {
    flex-wrap: wrap;
  }
}


.page, .f0-page {
    container-name: f0-page;
    container-type: inline-size;
}

</style>
<!-- Put project tokens, fonts and authored CSS after the runtime baseline. -->
</head>
<body>
<div class="f0-page" data-f0-id="preview-page" data-f0-authoring-root>
  <main class="site-root" data-f0-id="preview-root" data-name="Site">
    <!-- Add semantic page content here; temporary data-f0-id on every element. -->
  </main>
</div>
</body>
</html>
```
