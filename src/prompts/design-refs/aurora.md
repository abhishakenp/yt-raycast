# Design System: Aurora

## 1. Visual Theme & Atmosphere

Aurora is a midnight civic dashboard on **Midnight Canvas** (`#0a0e1f`–`#0f1428`): cool indigo night-sky, structured multilingual typography, and role-colored components. **`design-refs/aurora/preview-dark.html` is the visual baseline** for QA (semantic HTML with Tailwind-first styling). **Generated `index.html`** comes from Groq using this document as the appendix plus Tailwind + the design-brief JSON — same tokens, different implementation path. **Regression check:** run `bun run aurora:qa` with Ship Fast on `localhost:7420` — it creates a Malayalam Aurora session, captures baseline + `/preview/{id}`, and runs `agent-browser diff screenshot` (set `AURORA_ROUNDS` for repeat runs; tune `homepage.js` / `aurora.md` / prompts until diffs stabilize). The hero’s read comes from a **four-layer stack** (bottom → top): (1) **liquid Aurora Spectrum** — slow-drifting, heavily blurred radial blobs (violet, fuchsia, amber, teal); (2) **boxed lattice** — 32px dashed crosshatch (cyan-white ~6–8% stroke) so motion stays legible; (3) **particle field** — canvas nodes on grid intersections, spring physics, optional neighbor links, pointer push + ambient drift; (4) **cursor halo** + content. Liquid + particles are the primary “living” signature; the mesh is the skeleton, not the only story.

**Key Characteristics:**
- Midnight Canvas base; six role colors (Violet, Lavender, Emerald, Amber, Rose, Teal, Plum) at 300/500/700/900
- Aurora Spectrum: Violet 700 → Fuchsia → Amber → Emerald → Teal (`linear-gradient(90deg, #5d4cf5 0%, #c026d3 25%, #facc15 50%, #22c55e 75%, #14b8a6 100%)`)
- Inter + Noto Sans Malayalam; JetBrains Mono for `/preview` chrome and export metadata
- Hairline borders `rgba(255,255,255,0.04–0.12)`; route pills and status dots for dashboard semantics
- `prefers-reduced-motion`: hide liquid animation + canvas particles + halo; keep static mesh + vignette

## 2. Color Palette & Roles

### Primary
- **Aurora Violet 500** (`#7c5cf5`): primary CTA, hero badge tint, logo tile
- **Aurora Violet 700** (`#5d4cf5`): active/pressed
- **Aurora Violet 300** (`#a594ff`): hover on primary
- **Aurora Violet 900** (`#3b2db8`): deep borders

### Secondary & Accent
- **Lavender 500/300/700/900** (`#c4b5fd`, `#ddd2ff`, `#9a85f0`, `#6e57c5`)
- **Plum 500/300/700/900** (`#a855f7`, `#c084fc`, `#8635d8`, `#5e1fa3`)

### Surfaces
- **Midnight Canvas** `#0a0e1f` · **Midnight Surface** `#0f1428` · **Midnight Elevated** `#141a2e` · **Midnight Inset** `#070a17` · **Pure White** `#ffffff`

### Neutrals
- **Slate Mist** `#cbd5e1` · **Slate Smoke** `#94a3b8` · **Slate Phantom** `#64748b` · **Slate Nightshade** `#475569`

### Role ramps (500 anchors)
- **Emerald** `#22c55e` — success, live stats
- **Amber** `#facc15` — training, warnings
- **Rose** `#ef4444` — alerts
- **Teal** `#14b8a6` — cool info, connectivity

### Hairlines
04 / 06 / 08 / 10 / 12 as `rgba(255,255,255,opacity)`; **Violet Whisper** `rgba(124,92,245,0.20)` for hero badge border.

### Gradients
- **Aurora Spectrum** — brand identity only (dividers, badge strokes), not body fills
- **Grid mask** — `radial-gradient(circle 200px at var(--mx) var(--my), rgba(255,255,255,0.28), rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.04) 100%)` over mesh
- **Hero vignette** — `radial-gradient(ellipse at top, rgba(124,92,245,0.10), transparent 70%)`
- **Card sheen** (optional hover) — `linear-gradient(135deg, rgba(124,92,245,0.06) 0%, transparent 50%)`

## 3. Typography Rules

### Font Family
- **UI**: `Inter` + `"cv11","ss01","ss03"` · **Indic**: `Noto Sans Malayalam` chain · **Mono**: `JetBrains Mono` for routes, hashes, export stack

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / Hero | Inter / Noto | 64–72px (4–4.5rem) | 700 | 1.05 (tight) | -0.02em | Centered hero |
| Section Heading | Inter / Noto | 32–40px (2–2.5rem) | 600 | 1.15 (tight) | -0.015em | |
| Sub Heading | Inter / Noto | 24px (1.5rem) | 600 | 1.20 | -0.01em | |
| Card Title | Inter / Noto | 18–20px (1.125–1.25rem) | 600 | 1.25 | normal | |
| Stats Numeral | Inter | 32px (2rem) | 700 | 1.00 (tight) | -0.02em | role color |
| Body Large | Inter / Noto | 17–18px | 400 | 1.60 | normal | |
| Body | Inter / Noto | 16px (1rem) | 400 | 1.55 | normal | |
| Body Small | Inter / Noto | 15px (0.94rem) | 400 | 1.55 | normal | |
| Caption | Inter / Noto | 14px (0.88rem) | 500 | 1.45 | normal | stats labels, CTAs |
| Label | Inter | 12px (0.75rem) | 500 | 1.40 | 0.02em | |
| Overline | Inter | 11px (0.69rem) | 600 | 1.30 | 0.08em | uppercase markers |
| Mono Body | JetBrains Mono | 13px (0.81rem) | 400 | 1.50 | -0.02em | |
| Mono Micro | JetBrains Mono | 12px (0.75rem) | 500 | 1.40 | 0.04em | route row |

### Principles
Weights 400 / 500 / 600 / 700 only. Indic display line-height ≥ 1.05. Mono never for prose.

## 4. Component Stylings

### Buttons
- **Primary**: bg Violet 500, white text, radius 8px, padding 12px 24px, shadow `rgba(124, 92, 245, 0.30) 0px 8px 24px -8px`; hover → Violet 300 + stronger shadow; active → Violet 700; focus ring `rgba(124, 92, 245, 0.45)` offset 2px
- **Ghost**: transparent, white text, `1px solid rgba(255,255,255,0.20)`; hover brightens border + `rgba(255,255,255,0.04)` fill
- **Profile pill**: Violet 500, 8px 16px, rounded 8px, leading icon

### Cards
- **Stats**: Midnight Elevated, Hairline 08, radius 12px, padding 24px 32px; numeral 32px/700 role color; label 14px/500 Slate Smoke
- **Service (role card)**: Midnight Surface, Hairline 06, radius 14px, padding 32px; 48px icon tile (role 500); title 18–20px/600; body 15px; CTA `അറിയുക →` in role 500; hover border role @ 30%, icon scale 1.05
- **Update**: same surface/border; top meta row + status pill; title 17–18px/600; body 15px Slate Mist

### Inputs
Midnight Inset field, white text, Phantom placeholder, Hairline 10 border, 12px 16px padding, 8px radius; focus Violet 500 + `0 0 0 3px rgba(124, 92, 245, 0.20)`

### Navigation
- **Logo**: 40×40 Violet 500 tile, 8px radius, white glyph; wordmark 18px/600 white; subtitle 12px/400 Slate Smoke
- **Actions**: bell 20px 80% white; profile pill as above

### Hero signature (implement together)
- **Liquid base**: blurred Aurora Spectrum ellipses, slow CSS drift (20–30s alternate), z below mesh
- **Mesh**: 32px cells, `stroke-dasharray` ~`2 4`, pointer-tracked radial brighten via `--mx`/`--my`
- **Particles**: canvas, grid-seeded nodes, springs + optional links + pointer repel; respect reduced motion
- **Halo**: `radial-gradient` on `.aurora-halo`, `mix-blend-mode: screen`, fades on pointer enter/leave

### Chrome
- **Route pill**: JetBrains Mono 12px/500, Midnight Inset, Hairline 10, pill radius; adjacent `EXPORT · HTML / REACT / NEXT.JS` mono 11px uppercase 0.08em tracking
- **Status dot pill**: 6px dot + label; bg/border = role @ 12%/24%; emerald=live, amber=training, rose=alert, violet=info
- **Hero badge**: centered pill, Violet 12% bg, Violet Whisper border, 6px Emerald dot + label

## 5. Layout Principles

- Base 8px; section gaps 96–128px; gutters 16 / 32 / 48px by breakpoint
- Max width 1280px content; hero full-bleed with inner max-width ~880px centered
- Stats 4→2→1 columns; services 3→2→1; updates 2→1

### Radius scale
4 / 6 / 8 / 10 / 12 / 14 / 16–20 / 999 pill

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | none | Canvas / text |
| Hairline | `1px solid rgba(255,255,255,0.06–0.12)` | Cards |
| Glow | `rgba(124,92,245,0.30) 0 8px 24px -8px` | Primary buttons |
| Floating | dark shadow + Hairline 10 | Modals |
| Focus | ring + `0 0 0 3px rgba(124,92,245,0.20)` | Focusable controls |

Depth = Midnight surface steps + hairlines + violet-tinted glows, not heavy black drops.

## 7. Do's and Don'ts

### Do
- Ship the full hero stack (liquid + mesh + particles + halo) on primary heroes unless reduced-motion
- Use Midnight Canvas everywhere; tier role colors 300/500/700/900
- Keep Aurora Spectrum for brand strokes and dividers, not arbitrary fills
- Mix Inter + Noto for Indic; hairlines for containment; semantic status colors

### Don't
- Pure `#000` canvas; full white 1px borders on dark; weight 300/800/900
- Spectrum gradient as generic body or card background
- Heavy photo backgrounds competing with the hero stack
- Decorative misuse of status colors
- **External design-system names as palettes** — implement only tokens and patterns defined in this Aurora document

## 8. Responsive & Motion

| Band | Width | Notes |
|------|-------|-------|
| Mobile | <640px | Single column stats/services; hero title down to ~36px |
| Tablet | 640–960px | 2-col grids; hero ~48px |
| Desktop | >960px | 4 stats, 3 services; hero up to 64–72px |

Touch: ripple decays from last tap ~1.2s. Minimum 44px targets.

## 9. Agent Prompt Guide

**Token cheat sheet:** Canvas `#0a0e1f` · Surface `#0f1428` · Elevated `#141a2e` · Violet 500 `#7c5cf5` · Slate Mist `#cbd5e1` · Slate Smoke `#94a3b8` · Hairline 06 `rgba(255,255,255,0.06)` · Spectrum `90deg #5d4cf5→#c026d3→#facc15→#22c55e→#14b8a6`

**One-shot hero:** “Midnight Canvas hero with blurred drifting Aurora Spectrum liquid under a 32px dashed cyan-white mesh, canvas particle field on grid points with neighbor links and pointer repel, violet vignette, centered badge (Violet 12% + Emerald dot), 64px/700 white headline, 18px Slate Mist subhead, primary Violet 500 + ghost CTAs, JetBrains route pill row.”

**One-shot services:** “3×2 role cards on Midnight Surface, Hairline 06, 14px radius, six roles (Violet, Emerald, Amber, Plum, Rose, Teal), 48px icon tiles, Malayalam copy, `അറിയുക →` CTAs.”

When refining: fix canvas + particles first, then mesh contrast, then typography — always keep Indic line-heights ≥1.05 display / ≥1.55 body.
