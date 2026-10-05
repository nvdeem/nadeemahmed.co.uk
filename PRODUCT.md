# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Three audiences, confirmed by Nadeem: hiring managers/recruiters evaluating him for full-time product design roles, freelance/contract clients deciding whether to hire him for a project, and peers/the design community browsing his work. The hiring and client audiences land here to decide whether to act (shortlist, reach out, hire); all three are assessing design craft and depth of process.

## Product Purpose
A personal portfolio site for Nadeem Ahmed, a product designer. It replaces a link-out to Behance with built-in, in-depth case studies, giving visitors a reason to trust his process and craft rather than skim a gallery of static screens.

## Positioning
Confirmed by Nadeem: the hybrid design+engineering ability is the core differentiator, proven by the site's own construction rather than just claimed in copy ("I sit where design and engineering intersect, turning complex problems into seamless, reliable experiences."). Hand-built interactions — a custom cursor system, scroll-linked case-study overlays with a section-jump progress indicator, a server-side password gate for confidential client work — stand as evidence of the claim, not decoration on top of it.

## Operating Context
- Static site, no build step, deployed to Netlify from a `feature/portfolio` branch (Nadeem merges to `main` himself).
- Case studies live in `projects.js` as data, rendered through a reusable block-type system in `work.js` (meta, section, stat-row, card-grid, comparison, gallery, finding-pairs, full-bleed, and others).
- Some case studies are real client work (e.g. a Monzo crypto-allowance project) and are password-gated server-side via a Netlify Edge Function, since the content genuinely can't be public — not a client-side illusion of privacy.
- Other case studies adapt real Behance write-ups into the site's own block vocabulary, with real screenshots/exports dropped in as they're supplied.

## Capabilities and Constraints
- Plain HTML/CSS/JS, no framework, no bundler — a deliberate, repeatedly reaffirmed constraint (React/Vite "islands" were considered and declined even for rich interaction, since the site's own glass-morphism/custom-cursor/scroll-linked work already disproves the premise that rich interaction requires a framework).
- One shared password across all locked projects currently; no per-project password, no session persistence across overlay re-opens — kept simple for v1.
- Real locked-project content never ships in any client-shipped file; only public-safe fields (title, tags, year, cover image) live in the public `projects.js`.

## Brand Commitments
- Name: Nadeem Ahmed. Dark theme (`--bg #050A0D`), faint grid background, grain overlay, custom cursor (native cursor hidden sitewide; a custom dot + trailing glow that inverts over dark-adjacent surfaces).
- Type system: Instrument Serif (hero headline + Work section title only — deliberately the only two serif appearances on the site), Satoshi (body/UI), Google Sans Code (small-caps case-study labels/kickers), JetBrains Mono (hero subtitle + work-grid card chips only).
- Contact: hello@nadeemahmed.co.uk, GitHub (github.com/nvdeem), LinkedIn.

## Evidence on Hand
- Real Behance case-study content adapted for "Designing Calm for Parents on the Go" / Quiet Hours (Project One) — fully built out, including real final-screen exports.
- Real client cover image and title for "Protecting Monzo Users from Crypto Scams" (Project Two) — password protected; its real body content lives server-side only, in the Netlify Edge Function, never in the public repo.
- Project Three ("Bridging Physical and Digital Security in Banking") has a confirmed real title but still placeholder body content — not yet built out.
- No résumé/CV file, no testimonials, no press mentions anywhere on the site currently — future work must not invent any of these.

## Product Principles
1. Prove the design+engineering claim through the site's own construction, not just through what the case studies describe.
2. Real work only — no invented metrics, testimonials, or claims; placeholder content stays explicitly marked as placeholder until replaced with the real thing.
3. Protect real client confidentiality with genuine server-side gating, never a client-side-only illusion of privacy.
4. Stay as simple and dependency-free as the medium allows; reach for a new pattern only when the existing block vocabulary genuinely can't express it.
5. Every interaction reads as deliberate and crafted — refined iteratively against real reference material (Mobbin, live sites) rather than shipped as a first pass.

## Accessibility & Inclusion
AA color-contrast conformance confirmed and fixed (computed real WCAG ratios; `--text-muted`/`--text-subtle` tuned to clear 4.5:1). No other project-specific accessibility requirement has been established beyond that.
