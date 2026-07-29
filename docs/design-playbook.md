# Design-Language Playbook

Sources: 11 AI-generated landing pages (whichai.dev "with-design-skill" gallery — fable/sol/luna/terra/gpt-5.5/glm/kimi runs) + 10 full design-system prompts extracted verbatim from designprompts.dev's app bundle (sketch, maximalism, playful-geometric, neo-brutalism, kinetic, swiss-minimalist, newsprint, bauhaus, terminal, vaporwave). All CSS below is Tailwind-v4-friendly (arbitrary values, no config file needed).

---

## 1. Layout Tricks

### Asymmetric grids (the #1 anti-generic move)

- Never 50/50. Use 12-col grid with editorial splits: `lg:col-span-8` / `lg:col-span-4` (hero), `lg:col-span-5` / `lg:col-span-7` (benefits), 7:5 for product detail. Swiss prompt: "asymmetric column ratios (8:4, 7:5, 5:7) creating dynamic tension". Newsprint: "Don't default to 50/50 splits."
- Broken grid: mix `col-span-2` with `col-span-1`; stagger with `translate-y-8 md:translate-y-12` on every other item (`i % 2 === 1`); let heights vary.
- Bento with varied radius strategy per cell (some `rounded-full` sides, some sharp) — playful-geometric.

### Rotated / overlapping "sticker" elements

- Rotation vocabulary: `rotate-1`, `-rotate-2`, `rotate-3` on cards/text blocks/badges; badge rotated 15deg (`rotate-[15deg]`) for "MOST POPULAR" stars; `hover:rotate-12` to rotate further on hover; counter-rotate inner content when the container is rotated 45° (`rotate-45` box + `-rotate-45` content).
- Overlap: absolute badges at `-top-6 -right-6`; icons "sitting half-in/half-out of the top border" (`absolute -top-6 left-1/2 -translate-x-1/2`); avatars overlapping with `-space-x-4`; negative margins (`-mt-8`, `-ml-4`) to breach section boundaries; z-ladder `z-0` patterns → `z-10` content → `z-20` overlapping cards → `z-30` floaters.
- Skew: whole sections `-skew-y-1` with content un-skewed; vaporwave buttons `-skew-x-12` that `hover:skew-x-0` (inner `<span class="skew-x-12">` counter-skews the label).

### Oversized numerals as graphic shapes

- Ubiquitous across ALL whichai pages ("01/02/03", "CTX 005.1", drawer numbers) and prompts. Kinetic: numbers at `text-[6rem] md:text-[12rem]` in `text-[#27272A]` (muted, near-invisible) positioned absolutely behind content. Swiss: "giant watermark numbers (text-8xl at 10% opacity)" inside dark process steps.
- Numbered section eyebrows: `01. System`, `02. Method` in accent red, `uppercase tracking-widest text-xs` — cheap, high signal.

### Marquee strips

- Appears in kinetic, newsprint, neo-brutalism, playful-geometric prompts. Use `react-fast-marquee` (or CSS `@keyframes marquee { to { translate: -50% 0 } }` on a duplicated track). Stats marquee: speed 80, black or accent bg, `py-8 border-y`, huge numbers + `✦` separators, **no gradient edge fade** (kinetic explicitly forbids it; neo-brutalism allows fade). Testimonials marquee: speed 40, wide `mx-12` gaps.
- Newsprint variant: black-bg "breaking news ticker" with white mono text and red badges.

### Sticky patterns

- Sticky stacking cards: each feature card `sticky top-24 md:top-32` so cards pile/overlap while scrolling (kinetic).
- Sticky side rail: left column `sticky top-*` holding section header + pattern overlay while right column scrolls (swiss features, luna/terra pages use anchor rails `#capture #connect #retrieve`).

### Editorial devices (whichai pages + newsprint)

- Archive/catalog metaphors give structure for free: card-catalog labels ("FILED UNDER: …", "REG. NO. 0001", "Vol. I / 2026", due-date slips), timestamps ("THOUGHT / 10:42", "03:18 · transcribed") as mono metadata rows.
- Drop caps: `first-letter:float-left first-letter:text-7xl first-letter:font-serif first-letter:pr-2`.
- Justified multi-column body: `text-justify columns-2 gap-8`.
- Collapsed-border newspaper grid: container gets `border-l border-t`, children get `border-r border-b`, drop `border-r` on last col — grid lines celebrated, not hidden.
- Ornamental divider: `<div class="py-8 text-center font-serif text-2xl text-neutral-400 tracking-[1em]">✧ ✧ ✧</div>`.

---

## 2. Background Techniques (exact CSS)

### Hard-edged patterns (CSS-only, no images)

```css
/* Dot grid (paper grain) */
background-image: radial-gradient(#e5e0d8 1px, transparent 1px);
background-size: 24px 24px;
/* Halftone (bolder) */
background-image: radial-gradient(#000 1.5px, transparent 1.5px);
background-size: 20px 20px;
/* Graph paper */
background-size: 40px 40px;
background-image:
  linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
/* Diagonal stripes */
background-image: repeating-linear-gradient(
  45deg,
  transparent,
  transparent 10px,
  rgba(255, 230, 0, 0.08) 10px,
  rgba(255, 230, 0, 0.08) 20px
);
/* Checkerboard */
background-image: conic-gradient(
  from 90deg at 1px 1px,
  transparent 90deg,
  rgba(0, 245, 212, 0.05) 0
);
background-size: 40px 40px;
```

Tailwind form: `bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-10` (used verbatim by newsprint for halftone image placeholders).

### Noise (poster texture)

SVG feTurbulence data-URI, fixed full-viewport, `opacity-[0.03]`, `mix-blend-overlay` (kinetic) or 1.5% opacity global (swiss):

```css
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
```

### Blurred orbs / gradient mesh

- Giant sun orb (vaporwave): `h-[600px] w-[600px] rounded-full bg-gradient-to-b from-[#FF9900] to-[#FF00FF] opacity-20 blur-[100px]` fixed behind content.
- Mesh: 2–4 stacked `radial-gradient(ellipse at 20% 30%, rgba(255,58,242,.15) 0%, transparent 50%)` layers at low opacity (maximalism).
- Modal glow (designprompts' own UI): `-top-1/2 -right-1/2 absolute h-full w-full rounded-full opacity-20 blur-[100px]` with `radial-gradient(circle, rgba(139,92,246,.4) 0%, transparent 70%)`.

### Perspective grid floor (retro-future signature)

```css
background-image:
  linear-gradient(transparent 95%, #ff00ff 95%),
  linear-gradient(90deg, transparent 95%, #ff00ff 95%);
background-size: 40px 40px;
transform: perspective(500px) rotateX(60deg) translateY(-100px) scale(2);
mask-image: linear-gradient(to bottom, transparent, black);
```

### CRT scanlines + chromatic aberration (fixed overlay, `z-50 pointer-events-none`)

```css
background: linear-gradient(rgba(18,16,20,0) 50%, rgba(0,0,0,.25) 50%); background-size: 100% 4px;
/* + subtle RGB: */ linear-gradient(90deg, rgba(255,0,0,.06), rgba(0,255,0,.02), rgba(0,0,255,.06));
```

### Giant watermark typography

`absolute` word at `text-[12rem]`–`text-[20rem]`, `opacity-20` (maximalism) or `opacity-10` (swiss/neo-brutalism: "Background text as texture — absolute opacity-10 text-9xl"), bleeding off edges, `aria-hidden select-none`.

### Fine line-grid section texture (newsprint)

```css
.newsprint-texture::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    linear-gradient(0deg, transparent 98%, rgba(0, 0, 0, 0.02) 100%),
    linear-gradient(90deg, transparent 98%, rgba(0, 0, 0, 0.02) 100%);
  background-size: 3px 3px;
}
```

**Layering rule (maximalism):** minimum 2 overlapping patterns per section, each at 0.05–0.15 opacity, via `::before/::after` with `pointer-events-none`; optionally `mix-blend-overlay`/`screen`.

---

## 3. Typography Systems

### Scale contrast is the whole game

- Traditional web = 2–3x headline:body ratio. These systems use **8–10x**: body `text-lg`–`text-2xl` (18–24px, larger than normal), headlines `text-8xl`/`text-9xl`/`text-[10rem]` or fluid `text-[clamp(3rem,12vw,14rem)]`. "Let words be images."
- Tight lockups: `leading-[0.8]`–`leading-[0.9]` + `tracking-tighter` on display; `leading-relaxed` on body.

### Pairings that worked (font + role)

| Style             | Display                           | Body              | Mono/label                          |
| ----------------- | --------------------------------- | ----------------- | ----------------------------------- |
| Newsprint         | Playfair Display 900              | Lora              | JetBrains Mono (dates, edition no.) |
| Swiss             | Inter 900 (Helvetica stand-in)    | Inter 400–500     | —                                   |
| Neo-brutalism     | Space Grotesk 900                 | Space Grotesk 700 | —                                   |
| Kinetic           | Space Grotesk                     | Space Grotesk     | —                                   |
| Vaporwave         | Orbitron 900                      | Share Tech Mono   | Share Tech Mono                     |
| Terminal          | JetBrains Mono / VT323 everywhere | ←                 | ←                                   |
| Sketch            | Kalam 700 (marker)                | Patrick Hand      | —                                   |
| Playful-geometric | Outfit 700/800                    | Plus Jakarta Sans | —                                   |
| Bauhaus           | Outfit 900                        | Outfit 500        | —                                   |

### Micro-label system (seen on every whichai page)

`text-[10px]`/`text-[11px]` (verbatim gallery chrome) or `text-xs`, `uppercase tracking-widest font-mono` — for eyebrows, timestamps, metadata ("FILED UNDER: second brain · notes", "mica / field notes 04:17:09", "Bench 05 · the workshop"). Tracking values in the wild: `tracking-[0.12em]` (whichai nav), `tracking-[0.2em]` (neo-brut labels), `tracking-widest`, up to `tracking-[1em]` for ornaments.

### Outlined (hollow) display text

```css
.text-outline {
  -webkit-text-stroke: 2px black;
  color: transparent;
}
```

Tailwind: `text-transparent [-webkit-text-stroke:2px_black]`. Neo-brutalism: overlay a solid copy offset behind the hollow one for depth. Works on dark bg with white stroke too.

### Stacked hard text shadows (maximalism signature)

```css
text-shadow:
  2px 2px 0 #7b2fff,
  4px 4px 0 #ff3af2,
  6px 6px 0 #00f5d4; /* triple */
text-shadow:
  4px 4px 0 #7b2fff,
  8px 8px 0 #ff3af2,
  12px 12px 0 #00f5d4; /* mega   */
```

Pattern: 2px increments, rotate accent colors per layer. Neo-brutalism single-color: `text-shadow: 4px 4px 0 #000`.

### Gradient text fill

`bg-gradient-to-r from-[#FF9900] via-[#FF00FF] to-[#00FFFF] bg-clip-text text-transparent` + optional `drop-shadow-[0_0_30px_rgba(255,0,255,0.6)]`; animate by `background-size: 200-300%` + shifting `background-position` (4s loop). Use on ≤20–30% of headlines.

### Vertical text

Luxury/editorial signature: `writing-mode: vertical-rl` (`[writing-mode:vertical-rl]`) for decorative side labels ("Editorial / Vol. 01"), absolutely positioned on image edges, uppercase + wide tracking.

### Other treatments

- Italic serif word inside sans headline for emphasis ("Keep the good parts _close_" — luna; "Give every thought _a way back._" — sol).
- Drop caps (newsprint, sketch): `first-letter:` utilities.
- Terminal: ALL-CAPS mono headers, prompt glyphs `>` `$` `~`, phosphor glow `text-shadow: 0 0 5px rgba(51,255,0,.5)`.

---

## 4. Component Styling

### The hard-offset shadow system (canonical values)

```
sm  shadow-[4px_4px_0px_0px_#000]      md  shadow-[8px_8px_0px_0px_#000]
lg  shadow-[12px_12px_0px_0px_#000]    xl  shadow-[16px_16px_0px_0px_#000]
on-black: shadow-[20px_20px_0px_0px_#fff]
```

Zero blur, zero spread, always bottom-right. Theme-token form: `shadow-[8px_8px_0_theme(colors.foreground)]` or `shadow-[8px_8px_0_var(--color-foreground)]`.

### The press/lift physics (used by 6 of 10 styles — the single most reusable interaction)

```html
<!-- Button: mechanical press -->
class="border-2 border-black shadow-[4px_4px_0_#000] transition-all duration-100
active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
<!-- Optional hover lift first: -->
hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_#000]
<!-- Card: lift -->
class="shadow-[8px_8px_0_#000] hover:-translate-y-2
hover:shadow-[12px_12px_0_#000] duration-200"
```

Newsprint inverse (gain shadow on hover): `hover:shadow-[4px_4px_0_#111] hover:-translate-x-[2px] hover:-translate-y-[2px]`.

### Card treatments by mood

- **Brutalist**: `bg-white border-4 border-black rounded-none shadow-[8px_8px_0_#000]`; colored header band with `border-b-4 border-black`; small geometric shape (8px) in top-right corner (circle/square/triangle via `clip-path: polygon(50% 0%, 0% 100%, 100% 100%)`).
- **Newsprint**: `border border-[#111] bg-[#F9F9F7] p-6`, radius 0, shared collapsed borders.
- **Kinetic**: `border-2 border-[#3F3F46] bg-[#09090B] p-8 rounded-none`, hover = full flood `hover:bg-[#DFE104]` + all text `group-hover:text-black`.
- **Vaporwave glass**: `border border-[#FF00FF]/30 border-t-2 border-t-[#00FFFF] bg-[#1a103c]/80 backdrop-blur-md` (dual-border neon tube), title `text-[#00FFFF] drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]`.
- **Sketch wobbly**: never plain rounded — inline `border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;` + `border-[3px]` + tape strip / thumbtack decoration; post-it `bg-[#fff9c4]`.
- **Playful sticker**: `bg-white border-2 border-[#1E293B] rounded-xl shadow-[8px_8px_0_#E2E8F0]` (shadow in pastel, not black), `hover:-rotate-1 hover:scale-[1.02]`.
- **Terminal pane**: black box, `border border-[#1f521f]`, ASCII title bar `+--- SYSTEM STATUS ---+` or inverted bar; window-chrome dots `h-3 w-3 rounded-full` in 3 accent colors.

### Buttons

- Radius is binary: `rounded-none` or `rounded-full` — never `rounded-md/lg` (bauhaus, neo-brutalism both explicit).
- Invert-on-hover (swiss/newsprint): `bg-[#111] text-white hover:bg-white hover:text-[#111] hover:border-[#111] transition-all duration-200` — no fades, hard flips.
- Candy button (playful): pill + dark 2px border + `shadow-[4px_4px_0_#1E293B]`, hover extends shadow to 6px, active shrinks to 2px; white circular icon chip inside.
- Skewed neon (vaporwave): `-skew-x-12 border-2 border-[#00FFFF] text-[#00FFFF] uppercase font-mono hover:skew-x-0 hover:bg-[#00FFFF] hover:text-black hover:shadow-[0_0_20px_#00FFFF]`.
- Terminal: label in brackets `[ INITIATE ]`; hover = inverted video (bg fills primary, text black).
- Typography on all: `uppercase font-bold tracking-wide`+.

### Badges / eyebrows

- Pill or square, `border-4 border-black`, accent bg, `font-black text-sm uppercase tracking-widest`, positioned `absolute top-4 left-4` and rotated (`rotate-3`, star badge at 15deg).
- Numbered eyebrow: `<span class="text-[#FF3000] font-mono text-xs uppercase tracking-widest">01. System</span>`.
- Metadata chips (whichai): `rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs` (verbatim from designprompts modal).

### Dividers

- `border-b-4 border-black` after every section (bauhaus rhythm); `divide-x divide-y` grids; `gap-px` + colored container bg = hairline connected-card grid (kinetic); ASCII `================` (terminal); serif ornaments `✧ ✧ ✧`; squiggly SVG underlines/connectors (sketch, playful); dashed SVG line threading between step cards.

### Hover-state grammar (pick a lane)

| Mood         | Hover                                                                         |
| ------------ | ----------------------------------------------------------------------------- |
| Brutal/press | translate + shadow grow/shrink, `duration-100–200`, `ease-out`/linear         |
| Swiss        | full color inversion, icon rotates 90°, `duration-150–200`, no springs        |
| Kinetic      | card floods accent, titles `hover:translate-x-8`, hidden desc `opacity-0→100` |
| Playful      | `ease-[cubic-bezier(0.34,1.56,0.64,1)]` bounce, wiggle keyframe ±3deg         |
| Neon         | glow ×2–3 `hover:shadow-[0_0_20px_#00FFFF]`, un-skew, invert                  |
| Newsprint    | image `grayscale` → `sepia-[50%]`, red `decoration-2` underline               |

---

## 5. Section Rhythm

- **Color-block banding**: rotate solid section backgrounds — bauhaus (white → blue → yellow → red → yellow → near-black footer), neo-brutalism (cream/yellow/violet/black), newsprint/swiss (mostly light with exactly ONE inverted black section — "flip at least one major section to black with white text, red accent numbers"). Kinetic: black ↔ acid-yellow flips.
- **Density alternation** (all whichai pages): whitespace-huge hero statement → dense labeled card cluster → breathing quote/full-bleed band → dense grid. Alternate `py-32` narrative sections against tightly packed `gap-px` information grids.
- **Full-bleed vs contained**: marquees and color bands run `w-full`; content in `max-w-7xl` (or `max-w-[95vw]` for kinetic drama, `max-w-5xl` sketchbook feel). Push-to-edge hero, contained prose (`max-w-2xl`).
- **Diagonal transitions**: `-skew-y-1` on section container (content counter-skewed), `rotate-1` on containers; wavy/dripping SVG top edge on footer (playful); clip-path corner cuts for chamfered panels:

```css
clip-path: polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px,
                   100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px));
/* simple slanted band: */ clip-path: polygon(0 0, 100% 4vw, 100% 100%, 0 calc(100% - 4vw));
/* card corner cut:    */ clip-path: polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%);
/* arch image:         */ rounded-t-full rounded-b-none  (or clip-path arch)
```

- **Horizontal scroll strips**: marquee stats + marquee testimonials (2 per page per kinetic mandate, different speeds 80/40).
- **Section-anchor rails**: sticky mini-nav with anchors (`#capture #connect #retrieve`) — every whichai landing used them.
- **Timeline alternation**: vaporwave/newsprint how-it-works alternate left/right around a central line with glowing checkpoint dots.
- **min-h-screen finale**: kinetic footer = full-height accent-bg section with clamp() mega headline and border-bottom email input.

---

## 6. Verbatim Style Rules (designprompts.dev prompt library)

Each page ships a full markdown design-system prompt (wrapped in `<role>…<design-system>` XML). Key hard rules per style:

- **neo-brutalism** (23KB prompt): "If it doesn't have a border, it doesn't exist. `border-4` is default." Shadows 4/8/12/16px `0px 0px #000`. Palette cream `#FFFDF5` / black / red `#FF6B6B` / yellow `#FFD93D` / violet `#C4B5FD`. Space Grotesk 900/700 only. Radius 0 or full, nothing between. Press effect mandatory. NO blur, NO gradients, NO mid grays, NO `rounded-md`. Marquees as trust strip + testimonials. Text-stroke hollow display + solid overlay.
- **swiss-minimalist**: white/black/`#F2F2F2`/Swiss red `#FF3000` only. Inter 900 uppercase `tracking-tighter`; headlines to `text-[10rem]`. Radius 0. NO shadows — depth via 4 CSS patterns (24px grid @3%, 16px dots @4%, 45° lines @2%, noise @1.5%). Numbered section labels in red. Ratios 8:4/7:5/5:7. Hover = full inversion; plus icons rotate 90°; `duration-150–200` linear.
- **newsprint**: `#F9F9F7` paper / `#111` ink / red `#CC0000` used "extremely sparingly — 99% black and white". Playfair Display headlines to `text-9xl leading-[0.9] tracking-tighter`, Lora body, Inter UI, JetBrains Mono data. Radius 0 everywhere. Collapsed-border grids, drop caps, justified 2-col text, grayscale→sepia images, marquee ticker, "Vol. 1 | Date | Edition" metadata, "Fig 1.1" captions.
- **bauhaus**: primaries `#D02020`/`#1040C0`/`#F0C020` + `#121212`/`#F0F0F0`. Outfit 900. Entire sections color-blocked. Shapes: circle/square/triangle only; every 3rd shape rotated 45°. `border-2`→`border-4` desktop, `border-b-4` section dividers. shadow 3/4/6/8px hard. Geometric 3-shape logo.
- **kinetic**: `#09090B`/`#FAFAFA`/acid `#DFE104`/zinc borders `#3F3F46`. `clamp(3rem,12vw,14rem)` hero; 10x scale ratio; everything display = uppercase. Flat — NO shadows; depth via muted mega-numbers. 2 marquees min (speed 80 + 40, no fade). Sticky stacking cards. Hard color-flood hovers. `max-w-[95vw]`, `py-32`.
- **maximalism**: bg `#0D0D1A` + FIVE accents (`#FF3AF2 #00F5D4 #FFE600 #FF6B35 #7B2FFF`) rotated via `i % 5`. Borders must CLASH with background (magenta bg → yellow border), `border-4/8`, mix solid+dashed within one section. Stacked text shadows + stacked box shadows (8→16→24px, different color per layer) + glow. 2–3 patterns layered per section. 5–10 floating animated shapes/section. `text-[12rem]-[20rem]` watermark words at `opacity-20`. Float/wiggle/pulse-glow/gradient-shift keyframes (given verbatim above).
- **playful-geometric**: "Stable Grid, Wild Decoration" (Memphis cleaned up). Cream `#FFFDF5`, slate ink `#1E293B`, violet/pink/amber/mint confetti rotation. 2px chunky borders, pill buttons with dark outline + `4px 4px 0 #1E293B` shadow (6px hover / 2px active). Blob radii (`rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-none`), arch masks, dashed SVG connectors, sticker badges, bounce easing `cubic-bezier(0.34,1.56,0.64,1)`.
- **sketch**: paper `#fdfbf7`, pencil `#2d2d2d` (never pure black), marker red `#ff4d4d`, ballpoint blue `#2d5da1`, post-it `#fff9c4`. Kalam/Patrick Hand. Wobbly radius `255px 15px 225px 15px / 15px 225px 15px 255px`. Rotations ±2deg, tape/thumbtack decorations, dashed hand-drawn SVG arrows, buttons "press flat" (shadow→none on active).
- **terminal**: `#0a0a0a` + phosphor green `#33ff00` (+ amber `#ffb000`, dim `#1f521f`). Mono everything, radius 0, NO shadows except glow `text-shadow: 0 0 5px rgba(51,255,0,.5)`. Buttons `[ BRACKETED ]`, inputs = bare prompt `user@acme:~$` + blinking block cursor, ASCII dividers/tables/progress bars `[||||||....]`, typewriter hero, stats as system report, blog as `ls -l` listing, testimonials as IRC/git logs.
- **vaporwave**: void `#090014`, magenta `#FF00FF`, cyan `#00FFFF`, orange `#FF9900`; card glass `#1a103c/80 backdrop-blur-md`. Orbitron + Share Tech Mono. Radius 0, `border-2`, dual-border cards (cyan top + magenta/30 sides). Glow shadows `0_0_10/20/50px`. Perspective grid floor + scanline overlay + 600px blurred sun. Skewed CTAs, rotate-45 diamond icon boxes, terminal windows w/ chrome dots, `> QUERY:`/`> RESPONSE:` FAQ, `<username>` IRC testimonials.

---

## 7. Art-Direction Recipes

### (a) About / Story page — "Editorial Archive" (newsprint × luxury × whichai catalog motifs)

- **Tokens**: bg `#F9F9F7`, ink `#111111`, muted `#E5E5E0`, one accent `#CC0000` (or brand color) at <2% usage. Fonts: Playfair Display 900 display / Lora body / JetBrains Mono metadata. Radius 0.
- **Layout**: 12-col with 8/4 and 5/7 splits; collapsed-border grid (`border-l border-t` container, `border-r border-b` cells); masthead header "Vol. I — Our Story | Est. 2019" in mono `text-xs uppercase tracking-widest`; chapter numbers as red eyebrows `01. Origins`.
- **Signature moves**: hero headline `text-6xl lg:text-9xl leading-[0.9] tracking-tighter`; drop cap on opening paragraph; timeline as archive cards with mono date stamps ("NOV 12 2019") and "FILED UNDER:" tag rows; one full-bleed inverted black band for the mission statement with `opacity-10 text-9xl` watermark year behind; vertical `[writing-mode:vertical-rl]` label on team photos; grayscale team images `hover:grayscale-0`; ornament dividers `✧ ✧ ✧`; justified 2-col body for the long history section; `hover:shadow-[4px_4px_0_#111] hover:-translate-x-[2px] hover:-translate-y-[2px]` on cards.
- **Rhythm**: paper → paper-with-line-grid texture → black inverted band → paper → dense bordered fact grid → footer with edition metadata.

### (b) Accounting firm — "Swiss Ledger" (swiss-minimalist backbone + restrained brutalist edge)

- **Tokens**: white bg, `#0A0A0A` ink, `#F2F2F2` panels, ONE signal color (Swiss red `#FF3000` or deep green); Inter 400/700/900 + JetBrains Mono for every number. Radius 0, `border-2` default / `border-4` structural.
- **Layout**: visible-grid sections with asymmetric 8:4 hero (massive `text-7xl lg:text-9xl uppercase tracking-tighter` claim left, geometric composition + 24px grid pattern @3% right); numbered service sections `01. Bookkeeping / 02. Tax / 03. Advisory` red mono eyebrows; stats strip `divide-x` 1×4 with mono numerals that `hover:scale-105` + plus icons rotating 90°; sticky left rail for the process page.
- **Trust devices**: figures always tabular mono (`font-mono tabular-nums`); a "ledger table" pricing section with explicit borders; fine dot-matrix texture on gray panels only; NO soft shadows anywhere — depth from borders and one restrained hard shadow `shadow-[6px_6px_0_#0A0A0A]` on the primary CTA card only (the brutalist edge).
- **Interactions**: instant color inversions (white→black, hover CTA→red), `duration-150 ease-linear`; underline links `decoration-2` in signal color. One inverted black band ("How engagements work") with 10%-opacity giant step numbers.

### (c) AEO SaaS tool — "Kinetic Terminal" (terminal × kinetic × restrained vaporwave glow)

- **Tokens**: bg `#09090B`, fg `#FAFAFA`, muted `#27272A`/`#A1A1AA`, borders `#3F3F46`, ONE acid accent (`#DFE104` or phosphor `#33ff00`). Space Grotesk 900 display + JetBrains Mono for all data/labels/UI. Radius 0, `border-2`, flat (glow reserved for terminal panes only).
- **Layout**: hero `text-[clamp(3rem,11vw,12rem)] uppercase leading-[0.85] tracking-tighter` with one word in accent; beneath it a terminal pane (`border border-[#3F3F46] bg-black/60`, chrome dots, mono `$ aeo audit yoursite.com` with typewriter output and blinking cursor `animate-pulse`) showing a live citation-check run; stats as a full-width accent-bg marquee (speed 80, `border-y`, mono numerals + ✦); features as sticky stacking cards (`sticky top-28`) with `text-[8rem]` muted index numbers and `--flag` style feature names (`--schema`, `--citations`, `--llm-visibility`); comparison section as before/after split code panes; "how it works" as shell log steps (`[OK] crawling…`, `[OK] scoring…`); raw-data viz: ASCII progress bars `[||||||||__] 82% cited`.
- **Interactions**: card hover = full accent flood + text-to-black; buttons `[ RUN AUDIT ]` mono bracketed with inverted-video hover; `duration-200 ease-out`; noise overlay `opacity-[0.03] mix-blend-overlay`; optional single blurred accent orb `blur-[100px] opacity-15` behind hero. Respect `prefers-reduced-motion` (pause marquee/typewriter).
