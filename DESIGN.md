---
name: Nadeem Ahmed — Portfolio
description: A dark, frosted-glass portfolio that proves a product designer who also builds.
colors:
  carbon-black: "#0a0a0a"
  white: "#ffffff"
  text-primary: "#f0f0f0"
  text-dim: "#a1a1a1"
  text-muted: "#808080"
  signal-green: "#4ade80"
  alert-coral: "#f87171"
  border-default: "rgba(255,255,255,0.08)"
  border-strong: "rgba(255,255,255,0.12)"
  glass-surface: "rgba(17,17,17,0.7)"
  glass-surface-panel: "rgba(17,17,17,0.8)"
  glass-surface-chip: "rgba(17,17,17,0.9)"
  button-secondary-hover-bg: "#262626"
  placeholder-gradient-end: "#b3b7c2"
  statement-word-muted: "#5c5c5c"
  locked-form-error: "rgba(255,120,120,0.9)"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Satoshi, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Google Sans Code, monospace"
    fontSize: "0.7rem"
    fontWeight: 500
    letterSpacing: "0.08em"
  label-alt:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.15em"
rounded:
  xs: "8px"
  md: "16px"
  lg: "20px"
  full: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.carbon-black}"
    rounded: "{rounded.full}"
    padding: "0 14px"
    height: "32px"
  button-secondary:
    backgroundColor: "#1c1c1c"
    textColor: "rgb(251,251,251)"
    rounded: "{rounded.full}"
    padding: "0 14px"
    height: "32px"
  button-secondary-hover:
    backgroundColor: "{colors.button-secondary-hover-bg}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.full}"
    padding: "0.3rem 0.7rem"
  card:
    backgroundColor: "{colors.glass-surface}"
    rounded: "{rounded.md}"
    padding: "1.125rem"
---

# Design System: Nadeem Ahmed — Portfolio

## Overview

**Creative North Star: "The Frosted Terminal"**

Technical precision meets soft, frosted-glass surfaces — the same duality the site exists to prove ("I sit where design and engineering intersect"). Every surface is built from the same small vocabulary: a near-black ground, translucent panels with real `backdrop-filter` blur rather than a flat dark fill, a thin 1px border standing in for depth instead of a shadow, and small monospace labels (Google Sans Code) doing the "terminal" half of the metaphor wherever the interface needs to speak precisely — section kickers, tags, stat labels — while Satoshi carries everything a visitor actually reads.

The system is deliberately quiet. Across this project's entire build history, nearly every round of feedback pushed toward *less*: smaller type, tighter spacing, fewer competing surfaces, dimmer kickers, a removed ornament rather than an added one. Decoration is not absent — a grain-noise overlay, a trailing cursor glow, a hover sheen sweep on hero imagery — but it is always a faint, physical texture rather than a loud accent. Instrument Serif appears exactly twice on the entire site (the hero headline, the Work section title) and nowhere inside a case study, which is itself the clearest statement of the restraint this system runs on.

**Key Characteristics:**
- Near-black ground with translucent, blurred glass panels — never a flat opaque dark fill for an elevated surface.
- A 1px border is the default way to separate a surface from its background; shadow is reserved for interaction, not resting state.
- Exactly one serif appearance per page (hero or section title); everything else is sans or mono.
- Green/red exist solely as semantic signal, never as decoration or brand accent.
- A hidden native cursor replaced by a custom dot + trailing glow that inverts over any interactive surface — the one place the system allows itself a genuinely playful touch.

## Colors

Fundamentally monochrome: white-on-near-black with a four-step gray hierarchy for text, plus two colors reserved strictly for semantic good/bad signal. There is no brand accent hue — white itself, used sparingly (solid CTA fill, headline text, active states), is the only "color" that draws the eye.

### Primary
- **White** (`#ffffff`): The sole accent. Used at full value only for the solid-fill primary CTA and the brightest text (headings, active nav state). Its rarity is what makes it read as emphasis.

### Neutral
- **Carbon Black** (`#0a0a0a`): Page background. Near-black with a faint warmth rather than pure black, consistent with the grain-textured, physical feel of the page.
- **Text Primary** (`#f0f0f0`): Default body/UI text color at near-full contrast.
- **Dim Gray** (`#a1a1a1`): Secondary text — nav labels at rest, section-nav dots, meta values.
- **Muted Gray** (`#808080`): Lowest-emphasis text that still must pass AA — case-study body copy, kickers, captions. A computed floor, not an eyeballed value — specifically against the overlay panel's own composited background (`rgba(17,17,17,0.8)` over the page, which renders lighter than Carbon Black alone), the actual surface this color sits on almost everywhere it's used. An earlier pass computed this against Carbon Black directly (4.61:1) and missed that the panel's real composited background is lighter, quietly dropping it to 4.4:1 in practice; `#808080` clears 4.5:1 against the panel with a safe margin (4.82:1).
- **Glass Surface** (`rgba(17,17,17,0.7–0.9)`, three steps): The translucent fill behind every blurred panel — cards (0.7), the case-study overlay panel (0.8), small chips (0.9). Opacity rises with how much content detail needs to stay legible behind it.
- **Border Default / Strong** (`rgba(255,255,255,0.08)` / `0.12`): Hairline dividers and card edges. Strong is reserved for a border that must read as a real boundary (tag chips, the locked-state password field) rather than an ambient surface edge.

### Named Rules
**The Rarity Rule.** White at full opacity appears on at most one or two elements per screen. Everywhere else, contrast comes from the gray scale, not from reaching for white.

## Typography

**Display Font:** Instrument Serif (with Georgia, serif fallback)
**Body Font:** Satoshi (with system-ui fallback)
**Label/Mono Font:** Google Sans Code (case-study kickers, tags, stat labels); JetBrains Mono survives only on the hero subtitle and Work-grid card chips — both sit outside the case-study system and were deliberately left on the older mono rather than migrated.

**Character:** A restrained display serif for exactly two moments of warmth, set against an otherwise all-sans, precision-labeled interface — the pairing itself performs the "design meets engineering" positioning.

### Hierarchy
- **Display** (400, `clamp(2rem, 5vw, 2.5rem)`, 1.25 line-height): The hero headline only. Instrument Serif.
- **Headline** (500, 1.625rem, 1.4 line-height): Section-level titles (Work section title, case-study section headings). Satoshi — serif does not extend this far down the hierarchy.
- **Title** (500, 1.125–1.375rem): Card titles, overlay case-study title.
- **Body** (400, 0.95rem, 1.8 line-height): Case-study paragraphs and the hero tagline. Generous line-height is deliberate — this is the system's primary reading mode.
- **Label** (500, 0.7rem, 0.08em letter-spacing, uppercase): Google Sans Code. Section kickers, tags, stat labels, meta labels — the "terminal" register, always small, always uppercase, always this dim.

**Acknowledged exceptions (not ramp steps):** `html`'s own `16px` base (every other font-size in the file resolves from a token; the root reset value deliberately doesn't) and `13px` on the CTA/copy-email pills (a pixel-exact match to the libraries.dev reference this component was built from). Both are fixed, intentional literals — not drift to fold into the scale.

### Named Rules
**The One-Serif Rule.** Instrument Serif appears in exactly two places on the entire site (hero headline, Work section title) and never inside a case study. A future surface that wants a serif moment should ask whether it is as singular as those two before reaching for it.

## Layout

Single-column, generous-margin reading layouts throughout — a 600px hero column, a 720px case-study overlay, no multi-column dense grids except where content is genuinely tabular (the comparison/card-grid blocks, each `minmax()`-based and collapsing to one column under ~480px). The case-study overlay is the system's one persistent spatial device: a centered panel over a near-opaque backdrop, its own internal scroll, with content blocks separated by consistent 1.25rem vertical rhythm and section transitions marked by a 1px divider plus extra top padding rather than a change in background.

## Elevation & Depth

**Confirmed invariant: flat at rest, lifted on interaction.** Every interactive surface — cards, both CTA pills, the next-project link, chips — starts with `box-shadow: 0 0 0 rgba(0,0,0,0)` (explicitly zero, not merely unset) and gains a real shadow plus a small `translateY(-2px)` lift only on hover. Depth is never ambient; it is always a direct response to attention.

### Shadow Vocabulary
- **Resting (none)**: `box-shadow: 0 0 0 rgba(0,0,0,0)`. The deliberate zero-state every interactive surface starts from.
- **Card hover-lift** (`0 12px 32px rgba(0,0,0,0.35)`): The standard "this surface is now active" shadow — project cards, the next-project link.
- **Pill contact shadow** (`0px 1px 1px rgba(0,0,0,0.24)` + two 1px inset highlights): The CTA/chip "tactile button" treatment — a tight contact shadow plus a faint top inset highlight standing in for a physical bevel, rather than a soft ambient glow.
- **Panel shadow** (`0 16px 48px rgba(0,0,0,0.4)`): The case-study overlay panel itself — the single largest, softest shadow in the system, reserved for the one surface that sits above everything else.

### Named Rules
**The Flat-By-Default Rule.** Nothing is pre-elevated. A card, button, or link earns its shadow only at the moment a visitor's cursor says it matters.

## Shapes

Two radius families cover the whole system: an 8px "xs" radius for small contained surfaces (gallery frames, the password input, meta chips) and a 16px "md" radius for anything card-sized (project cards, comparison cards, the next-project link). A rarer 20px "lg" step exists for the single largest surface, the case-study overlay panel itself. Pills (CTAs, tags, the nav) use a full/999px radius. Borders are hairline (1px) throughout; nothing uses a heavier stroke. A handful of bespoke "hugged" insets (the profile photo, hero images) deliberately break the scale — their inner radius is offset from their container's radius rather than reusing a token directly, since a nested corner needs to be mathematically smaller than its parent's to read as concentric.

### Named Rules
**The Concentric Corner Rule.** A nested surface's radius is never copy-pasted from its parent's token; it is set smaller by the parent's padding, so the two corners stay visually concentric instead of fighting each other.

## Components

### Buttons
- **Shape:** Full pill (`var(--radius-full)`, 999px), 32px tall, `0 14px` padding — notably smaller and tighter than a typical marketing CTA.
- **Primary:** Solid white fill, `#0a0a0a` text, a soft external drop shadow (`0px 1px 2px rgba(0,0,0,.15), 0px 4px 10px rgba(0,0,0,.12)`). Reserved for the single strongest action on a screen (hero "View work").
- **Secondary:** `#1c1c1c` fill, near-white text, a tight contact shadow plus two inset highlights standing in for a physical bevel. Hover darkens to `#262626`; active applies `scale(0.96)`.
- **Feel:** Tactile and soft — the inset highlights and the press-scale are what make a flat-looking pill feel physically pressable, not the shadow alone.

### Chips
- **Style:** No fill at rest — just `var(--text-dim)` text inside a `border-strong` outline, full pill radius, Google Sans Code uppercase label. The "Locked" state adds a small lock glyph before the text, same treatment otherwise.
- **State:** Border and text brighten toward white on hover; no background fill is ever introduced, keeping chips visually light against the glass cards they usually sit inside.

### Cards / Containers
- **Corner Style:** 16px radius (`rounded.md`) for anything card-sized.
- **Background:** `rgba(17,17,17,0.7)` translucent fill with real `backdrop-filter: blur(20px)` — never a flat opaque dark box standing in for glass.
- **Shadow Strategy:** Flat at rest; see Elevation & Depth.
- **Border:** 1px `border-default`, brightening to a lighter white-alpha on hover.
- **Internal Padding:** 1.125–1.5rem depending on content density.

### Inputs / Fields
- **Style:** Flat `rgba(255,255,255,0.04)` fill, 8px radius, `border-strong` outline — notably more visible border than a resting card, since a field needs to read as "fill this in" rather than "glass surface."
- **Focus:** Border brightens to `rgba(255,255,255,0.3)`, fill lifts slightly to `rgba(255,255,255,0.06)` — no glow ring.
- **Error:** A short horizontal shake keyframe (`0.4s`, `cubic-bezier(0.36,0.07,0.19,0.97)`) on a failed password attempt, rather than a color change alone — this system prefers a physical response over a red state where it reasonably can.

### Navigation
- **Style:** A fixed glass pill, vertically centered on the left edge of the viewport (desktop) — icon-only links at 40×40px, full-pill `border-radius: var(--radius-full)`, lower blur (`10px` vs. the usual `20px`) specifically because this one surface stays on screen through the entire page scroll and a heavier blur measurably cost scroll smoothness in Chrome. Collapses to a right-docked hamburger on mobile.
- **States:** Dim gray at rest, brightens on hover; an `IntersectionObserver`-driven active state gives the current section's link a persistent highlighted pill rather than only a hover state.

### Next-Project Card (signature component)
The closing element of every case study: a compact horizontal card (thumbnail, "Next project" kicker, title, arrow) that links to the next project in sequence, wrapping back to the first. It shares the card component's exact chrome (glass fill, 16px radius, flat-then-lifted shadow) rather than inventing a new treatment, and reveals on scroll — never pre-rendered and waiting — so reaching the end of a case study always feels like arriving somewhere, not finding something that was already there.

## Do's and Don'ts

### Do:
- **Do** keep every elevated surface flat at rest and lift it only on hover/interaction (the Flat-By-Default Rule).
- **Do** use real `backdrop-filter` blur for any "glass" surface, never a flat dark fill standing in for one.
- **Do** reserve Signal Green / Alert Coral strictly for good/bad semantic state — confirmed, never decorative or brand use.
- **Do** keep label text (Google Sans Code, uppercase, small) for short machine-precise strings only — section kickers, tags, stat labels — never for anything a visitor reads at length.
- **Do** size nested corner radii smaller than their parent's by the padding amount, so insets stay concentric (the Concentric Corner Rule).

### Don't:
- **Don't** introduce a new accent hue. The system is monochrome by design; a new "brand color" would contradict the Rarity Rule this whole palette is built around.
- **Don't** add a shadow to a surface at rest. If something needs to look important without being hovered, use the border-strong token or a brighter text color instead.
- **Don't** reach for Instrument Serif below the hero/section-title level — confirmed twice this project (serif was deliberately removed from case-study headings and a persona name that briefly used it).
- **Don't** fill a chip's background. Chips stay borderline-and-text only; a filled chip would read as a button and compete with the actual buttons.
