# Design Language — Capsule Revamp Playbook

Extracted from the Claude conversation that produced the hand-crafted capsules
(commit `80695445` "revamp capsules design"). This is the binding design bar
that all motifs and generated UI must meet.

## 15 Strongest Techniques (from whichai.dev + designprompts.dev)

1. **Hard-offset shadow system**: `shadow-[4/8/12/16px_..._0px_0px_#000]` —
   zero blur, bottom-right. The #1 recurring signature across 6 of 10 styles.
   Token version: `shadow-[8px_8px_0_0] shadow-foreground`.
2. **Press/lift physics**: `active:translate-x-[2px] active:translate-y-[2px]
active:shadow-none` buttons; cards `hover:-translate-y-2` + shadow grows.
3. **Radius is binary**: `rounded-none` OR `rounded-full`, never mid-range —
   instantly kills the generic-Tailwind look.
4. **8–10x type-scale ratio**: `text-[clamp(3rem,12vw,14rem)]` heroes,
   `leading-[0.85] tracking-tighter` uppercase, vs `text-xs uppercase
tracking-widest font-mono` micro-labels.
5. **Giant muted numerals/watermark words** (`text-[8rem]`–`text-[20rem]`,
   opacity 10–20%) as background graphic shapes — every page used numbered
   sections.
6. **Hollow display text**: `-webkit-text-stroke: 2px black` +
   `color: transparent`, solid copy layered behind for depth. Token version:
   `text-transparent [-webkit-text-stroke:1px_currentColor]`.
7. **CSS-only pattern layering**: dot grid / graph paper / diagonal stripes /
   conic checkerboard / feTurbulence noise at 2–5% opacity, 2+ layered per
   section.
8. **Asymmetric 12-col splits** (8:4, 7:5, 5:7) + staggered `translate-y`
   grids + sticker rotations (`rotate-1`…`-rotate-2`) — never 50/50, never
   perfectly aligned.
9. **Marquee strips** + collapsed-border newspaper grids (`border-r border-b`
   cells).
10. **Hard color inversion hovers**: full card floods accent, text flips
    black, `duration-150–200`, no fades; Swiss plus-icons rotate 90°.
11. **Color-blocked section banding** (solid primary backgrounds per section,
    one mandatory inverted black band) as rhythm engine.
12. **Skew/diagonal kinetics**: `-skew-x-12` CTAs that un-skew on hover
    (counter-skewed inner span), `-skew-y-1` sections, chamfer/corner-cut
    clip-path polygons.
13. **Perspective grid floor + CRT scanline overlay + 600px `blur-[100px]`
    gradient orb** — the full retro-neon background stack.
14. **Editorial trust devices**: drop caps, justified 2-col text, mono
    metadata rows ("Vol. I / FILED UNDER: / NOV 12 1981"), grayscale→color
    images, ornament dividers.
15. **Terminal grammar**: `[ BRACKETED ]` buttons, `$` prompt inputs, ASCII
    progress bars, typewriter hero, `--flag` feature names.

## Hard Constraints (what MUST NOT change)

1. Props schema byte-identical. No new/removed/renamed props.
2. Capsule `name` stays identical.
3. Default prop values stay identical — copy text is content, not design.
4. All behavioral wiring intact (NavbarRouteLink, Saas\*, commerce, Image).
5. Tokens ONLY (no hex/palette classes). Opacity modifiers + token gradients
   fine. NEVER `bg-indigo-500`, hex, oklch, rgb.
6. TypeScript strict: NO `as any`.
7. Update JSDoc + description to match new visuals.

## Quality Bar (user-endorsed taste rules)

- **Asymmetric, non-uniform, surprising layouts.** NO centered-heading +
  uniform-3-col-grid slop unless deliberately subverted.
- **Slanted/diagonal section transitions**, overlapping elements, rotated
  accents, oversized typographic numerals, editorial grids, sticky side
  labels, marquee-like strips (CSS only).
- **Backgrounds**: layered token-tinted washes, dot/grid patterns via
  absolutely-positioned divs with token classes (`bg-primary/5`,
  `border-border`, giant blurred orbs `bg-primary/20 blur-3xl`, oversized
  watermark text `text-foreground/[0.04]`).
- **Typography**: dramatic scale contrast (display up to text-7xl/8xl + tiny
  `font-mono text-[11px] uppercase tracking-[0.2em]` labels), mix `font-mono`
  metadata with big sans display; outlined/ghost display text via
  `text-transparent [-webkit-text-stroke:1px_currentColor]`.
- **Eyebrow restraint**: not every section needs a pill; prefer mono index
  labels ("01 / Services"), rule-lines, vertical text.
- **NO glow shadows, no neon.** Hard offset shadows only:
  `shadow-[6px_6px_0_0]` + token color.
- **Cards**: avoid "icon tile + title + text" uniform card. Vary card sizes
  (bento/asymmetric spans), numbered editorial list rows, hairline dividers,
  hover: border-primary + `-translate-y-0.5` + press `active:translate-y-0`.
- **Buttons need press feedback** (`active:translate-y-px` or
  `active:scale-[0.98]`).
- **Accent color ≤ ~5%** of surface area; most of page is
  background/foreground/muted with primary reserved for few moments.
- **Dark-band sections**: `bg-foreground text-background` inversion (tokens!)
  for dramatic alternation, child tokens adjusted (`text-background/70`).
- **Every section responsive** (mobile-first; asymmetry collapses to stacked)
  and readable in both light & dark themes.
- **Decorative elements**: `aria-hidden="true"` + `pointer-events-none`.

## Required Design Moves Per Page

- ≥1 **slanted section seam**: clip-path on a CONTRASTING band
  (`[clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)]` + compensating pt;
  band bg must differ from neighbors — `bg-foreground` inversion or
  `bg-muted/40` wash).
- ≥1 **giant watermark/ghost element**; mono micro-label metadata grammar;
  **asymmetric splits** (7:5/5:7, never 50:50); staggered/bento/collapsed-
  border grids instead of uniform card grids; hard offset shadows OR
  hairline-precision (pick per language); binary radius per language.
- **Small screens (390) must stay deliberately designed.**

## Style Assignments (category → art direction)

| Category          | Art Direction                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| agency            | Neo-brutalist portfolio: thick 2px borders, 8px hard offset shadows, sticker rotations, giant slab display, marquee-feel strips |
| ai-product        | Kinetic tech-editorial: oversized clamp display, skewed CTA, dot grids, diagonal seams, marker-highlight phrases                |
| analytics         | Swiss data-grid: hairline collapsed grids, tabular numerals, div-built chart motifs, inverted KPI band                          |
| architecture-firm | Brutalist-minimal blueprint: graph paper, hairline frames, huge thin display type, mono annotations, monochrome photos          |
| bakery            | Playful-geometric warmth: chunky rounded-full vs sharp cards, sticker badges, oversized script-feel serif                       |
| bar-nightclub     | Dark kinetic poster: giant condensed display, inverted bands, marquee strips, ticket-stub chips                                 |
| beauty-store      | Editorial vogue: serif italic display, asymmetric product plates, hairline rules, generous whitespace                           |
| blog              | Newsprint: column rules, drop caps, dateline mono rows, justified feel, ornament dividers                                       |
| bootcamp          | Terminal-classroom: prompt lines, bracketed labels, progress-bar motifs, module index numerals                                  |
| cafe              | Warm newsprint-menu: ledger menu rows, stamps, serif headlines, kraft-tone muted washes                                         |
| church            | Serene editorial: light washes, serif display, centered-subverted asymmetry, watermark verse numerals                           |
| coming-soon       | Kinetic teaser: giant countdown-scale type, diagonal bands, marquee strip                                                       |
| construction      | Industrial brutalism: hazard-stripe accents (token-built), heavy slab type, hard shadows, blueprint grid                        |
| consulting        | Swiss authority: hairline precision, giant serif pull-stats, inverted proof band                                                |
| corporate         | Swiss corporate: strict grid + one calculated rupture per section, tabular stats                                                |
| crowdfunding      | Playful bold: progress-bar hero motif, sticker goals, staggered backer cards                                                    |
| crypto            | Web3-terminal: dark, mono tickers, gradient-free glow-free precision, inverted stat bands, chamfers                             |
| cybersecurity     | Terminal-stealth: redaction-bar motifs, mono clearance labels, scanline-free dark bands                                         |
| dashboard         | Swiss data: dense hairline grids, tabular numerals, div-chart motifs                                                            |
| dev-tool          | Terminal: full commitment — prompts, flags, diff-line motifs, mono everything                                                   |
| ecommerce         | Editorial commerce: asymmetric product plates, oversized prices, ticker strips                                                  |
| electronics-store | Tech-brutalist: spec-sheet tables, hard shadows, giant model numerals                                                           |
| event             | Kinetic poster: diagonal date bands, giant display, ticket-stub chips, marquee                                                  |
| faq               | Editorial Q&A: giant Q numerals, hairline dividers, asymmetric two-col                                                          |
| fashion-store     | Vogue editorial: serif display, image-forward asymmetry, minimal chrome                                                         |
| fintech           | Swiss-fintech: precision hairlines, tabular money numerals, trust inversion band                                                |
| fitness           | Bold kinetic: italic speed display, giant rep numerals, diagonal energy seams                                                   |
| food-delivery     | Playful bold: chunky cards, sticker ETAs, staggered menu grid                                                                   |
| food-truck        | Sticker-poster: rotated stamps, bold slabs, hazard-lite accents                                                                 |
| furniture-store   | Editorial catalog: museum-label mono captions, asymmetric plates, generous air                                                  |
| healthcare        | Calm Swiss-clinical: airy precision, soft muted bands, giant care stats                                                         |
| hotel-resort      | Luxury editorial: serif display, full-bleed plates, hairline gold-free restraint                                                |
| law-firm          | Newsprint authority: serif gravitas, column rules, case-index numerals, seal stamps                                             |
| marketing         | Kinetic maximal-lite: bold display, marker highlights, diagonal seams, stat stickers                                            |
| music-artist      | Kinetic poster: giant condensed display, inverted bands, marquee lineup strips, ticket chips                                    |
| nonprofit         | Editorial warmth: serif mission display, impact stat band, asymmetric photo plates                                              |
| photography       | Dark editorial gallery: full-bleed plates, mono captions, letterbox bands                                                       |
| portfolio         | Editorial personal: giant name display, mono metadata, staggered work plates                                                    |
| pricing           | Swiss comparison: collapsed-border tiers, inverted highlight cell, tabular prices                                               |
| restaurant        | Menu editorial: ledger menu rows, serif dishes, stamps                                                                          |
| saas              | Kinetic SaaS: bento dashboards, marker highlights, diagonal seam, mono pipeline labels                                          |
| subscription-box  | Playful bold: box motifs, sticker cycles, staggered tiers                                                                       |
| team              | Editorial roster: staggered portraits, mono role labels, index numerals                                                         |
| testimonials      | Editorial quotes: giant quotation marks, staggered cards, source mono labels                                                    |
| travel            | Editorial wanderlust: full-bleed plates, itinerary ledger rows, stamp badges                                                    |
| wedding           | Romantic editorial: serif italic display, soft washes, hairline ornaments                                                       |
| winery-brewery    | Heritage editorial: serif gravitas, label-stamp motifs, ledger tasting rows                                                     |
| yoga-studio       | Calm organic: soft washes, airy asymmetry, hairline schedule ledger                                                             |

## Kit Facilities Available

- `DotGrid`, `Watermark`, `MonoTag`, `GraphPaper` from `#/section-kit/Decor.tsx`
- `Eyebrow` has a `mono` variant
- `SectionHeading` defaults are already mono-eyebrow + bold tracking-tight
- `Container` sizes: default (max-w-7xl), `sm`, `md`, `lg`, `xl`
