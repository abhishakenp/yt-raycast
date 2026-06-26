/**
 * Mobbin Pro prompt-block builders for the production engine.
 *
 * `mobbinDoctrineBlock()` — always-on system-prompt block. Universal rules
 * observed across the trending Mobbin Pro B2B SaaS + consumer corpus.
 *
 * `mobbinSessionBlock(anchor)` — per-session block carrying the chosen anchor's
 * concrete DNA (palette, typography, layout signature, doctrine moves,
 * anti-patterns, real-copy shape examples). Production analog of the forge
 * sandbox's per-iter mobbinIterBlock — single anchor instead of rotating set.
 *
 * `anchor` shape: { app, category, dna, copyExamples, palette?, accents? }
 * Pure module — no I/O.
 */
import { resolveCopyExamples, resolveDna, synthesizeDna } from './dna.js'

function formatPaletteLine(palette = []) {
  if (!palette.length) return ''
  return palette.slice(0, 5).join(', ')
}

function paletteRoleHint(palette = []) {
  const norm = palette
    .map((h) => h.toLowerCase())
    .filter((h) => /^#[0-9a-f]{6}$/.test(h))
  if (norm.length < 3) return ''
  const sorted = [...norm].sort((a, b) => {
    const la =
      parseInt(a.slice(1, 3), 16) +
      parseInt(a.slice(3, 5), 16) +
      parseInt(a.slice(5, 7), 16)
    const lb =
      parseInt(b.slice(1, 3), 16) +
      parseInt(b.slice(3, 5), 16) +
      parseInt(b.slice(5, 7), 16)
    return la - lb
  })
  const background = sorted[0]
  const body = sorted[sorted.length - 1]
  const surface = sorted[1]
  const primary =
    norm
      .filter((h) => h !== background && h !== surface && h !== body)
      .find((h) => {
        const r = parseInt(h.slice(1, 3), 16)
        const g = parseInt(h.slice(3, 5), 16)
        const b = parseInt(h.slice(5, 7), 16)
        return Math.max(r, g, b) - Math.min(r, g, b) > 40
      }) || sorted[Math.floor(sorted.length / 2)]
  if (primary === background || primary === surface || primary === body) {
    return `background=${background}, surface=${surface}, body=${body} (no distinct accent in palette — derive a complementary primary)`
  }
  return `background=${background}, surface=${surface}, primary=${primary}, body=${body}`
}

function dnaImperatives(dna, app) {
  if (!dna) return []
  const out = []
  if (dna.display) out.push(`Display typography: ${dna.display}`)
  if (dna.body) out.push(`Body typography: ${dna.body}`)
  if (dna.mono) out.push(`Mono typography: ${dna.mono}`)
  if (dna.layout) out.push(`Layout signature: ${dna.layout}`)
  if (dna.copy) out.push(`Copy register: ${dna.copy}`)
  if (Array.isArray(dna.doctrine)) {
    for (const line of dna.doctrine) out.push(`Required move: ${line}`)
  }
  if (Array.isArray(dna.avoid)) {
    out.push(
      `Anti-patterns to reject (${app} would never ship these): ${dna.avoid.join('; ')}`,
    )
  }
  return out
}

function dnaCompositionBlock(dna, app) {
  if (!dna?.composition || typeof dna.composition !== 'string') return ''
  return `\n  Section-by-section composition (this IS the layout brief for the rendered page — follow it surface-by-surface): ${dna.composition}`
}

/**
 * Format anchor's recommended-sections list for site-spec prompts.
 * Returns a multi-line spec the site-spec gen can use as section-type
 * scaffolding instead of inventing generic SaaS sections.
 */
export function dnaSectionsBlock(dna, app) {
  if (!Array.isArray(dna?.sections) || !dna.sections.length) return ''
  const lines = []
  lines.push(
    `Section pattern for ${app}'s homepage (use these section types + variants in pages[].sections[] — DO NOT substitute generic SaaS sections):`,
  )
  for (const sec of dna.sections) {
    if (!sec?.type) continue
    const variant = sec.variant ? ` | variant: "${sec.variant}"` : ''
    const note = sec.note ? `\n      → ${sec.note}` : ''
    lines.push(`  - type: "${sec.type}"${variant}${note}`)
  }
  return lines.join('\n')
}

/**
 * Resolve an anchor descriptor — given { app, category, palette? }, fill in
 * DNA + copy examples from the bank. Returns null if the app name is missing.
 */
export function resolveAnchor({ app, category, palette }) {
  if (!app) return null
  const dna = resolveDna(app) || synthesizeDna(palette || [])
  const copyExamples = resolveCopyExamples(app)
  return {
    app,
    category: category || null,
    palette: palette || null,
    dna,
    copyExamples,
  }
}

export function mobbinSessionBlock(anchor) {
  if (!anchor || !anchor.app) return ''
  const { app, category, palette, dna, copyExamples } = anchor

  const lines = []
  lines.push('')
  lines.push('── MOBBIN PRO DESIGN DNA (session anchor) ──')
  lines.push(`ANCHOR: ${app}${category ? ` (${category})` : ''}`)

  const accents = palette?.length
    ? palette
    : Array.isArray(dna?.accents)
      ? dna.accents
      : []
  if (accents.length) {
    lines.push(`  Palette: ${formatPaletteLine(accents)}`)
    const hint = paletteRoleHint(accents)
    if (hint) {
      lines.push(
        `  Role assignment: ${hint}. Plug these directly into tailwind.config.theme.extend.colors — DO NOT invent your own brand palette.`,
      )
    }
  }

  const imps = dnaImperatives(dna, app)
  for (const imp of imps) lines.push(`  ${imp}`)

  const compositionLine = dnaCompositionBlock(dna, app)
  if (compositionLine) lines.push(compositionLine)

  if (copyExamples) {
    if (copyExamples.headlines?.length) {
      lines.push(
        `  Real ${app} headline shapes (match this register; DO NOT copy verbatim): ${copyExamples.headlines
          .slice(0, 3)
          .map((h) => `"${h}"`)
          .join(' | ')}`,
      )
    }
    if (copyExamples.subs?.length) {
      lines.push(
        `  Real ${app} sub-headline shapes: ${copyExamples.subs
          .slice(0, 2)
          .map((s) => `"${s}"`)
          .join(' | ')}`,
      )
    }
    if (copyExamples.products?.length) {
      lines.push(
        `  Concrete proprietary product nouns ${app} uses in its IA (inspiration only — invent equivalents): ${copyExamples.products.slice(0, 6).join(', ')}. NEVER use generic "Dashboard"/"Analytics"/"Reports"/"Settings".`,
      )
    }
  }

  if (dna?._synthesized) {
    lines.push(
      `  Note: ${app} is not in the curated DNA bank — descriptor above was synthesized from the supplied palette alone. Lean on palette + register.`,
    )
  }

  lines.push('')
  lines.push(
    `Inheritance contract for this session — the generated site must read as if it could ship from the ${app} brand team. Specifically:`,
  )
  lines.push(
    `  • Palette hex strings above MUST appear LITERALLY in tailwind.config.theme.extend.colors AND in inline style attributes on hero/card surfaces. Do not "round" or substitute.`,
  )
  lines.push(
    `  • Hero h1 typeface + weight + size MUST match ${app}'s display-type register. Body paragraphs MUST use the named body family.`,
  )
  lines.push(
    `  • At least 3 of ${app}'s "Required move" lines from the doctrine above must be visible in the rendered output.`,
  )
  lines.push(
    `  • None of ${app}'s anti-patterns may appear anywhere on the page.`,
  )
  lines.push(
    `  • The output should be indistinguishable at thumbnail-glance from a real ${app}-family marketing site.`,
  )

  return lines.join('\n')
}

export function mobbinDoctrineBlock() {
  return `
── MOBBIN PRO INHERITANCE DOCTRINE (always on) ──
The generated site must read as if it could appear on Mobbin Pro's trending
web feed alongside Linear / Stripe / Vercel / Notion / Figma / Anthropic /
Airbnb / Apple / Patagonia / Spotify / NYT. Every section is judged against
the structural rigor and copy specificity of those products. Concrete rules:

A. Palette discipline. When a session anchor block supplies sampled hex
   values, those hex strings MUST appear in tailwind.config.theme.extend
   .colors verbatim. Do not "round" a sampled #5e6ad2 to #6366f1 — the
   literal string is the contract.
B. Typography register. Display fonts must match the anchor's family register
   (precise grotesk / editorial serif / display sans). Inter is the safe
   default for body, JetBrains Mono for inline code. Never mix more than
   3 families.
C. Composition rigor. Top Mobbin Pro homepages share a load-bearing pattern:
   (1) sub-fold hero with a single product-preview / hero-visual surface,
   (2) numeric or named proof strip immediately below hero (logos OR stats,
   never both at once), (3) feature grid 2x3 / 3x2 with concrete product
   nouns as titles, (4) deep pricing / plans band where applicable,
   (5) named-customer testimonial band (NOT anonymous stock quotes),
   (6) penultimate CTA band, (7) 4-column footer with real columns.
   Skipping load-bearing bands breaks the Mobbin Pro silhouette.
D. Copy register. Product nouns are concrete and proprietary. Verbs are
   outcome-driven imperatives. No "unleash" / "revolutionize" / "supercharge".
   No exclamation marks except in social/footer micro-copy. Pricing tier
   names are product-coherent ("Starter / Team / Enterprise") not generic
   ("Basic / Pro / Premium").
E. Visual restraint. Mobbin Pro winners use one or two saturated accent
   colors AT MOST. Aurora multi-color blob heroes are an anti-pattern unless
   the anchor explicitly calls for them. Single-accent on near-black or
   near-white is the dominant mode. Gradient stops MUST derive from the
   anchor palette — never invent peach/cyan/amber RGBA.
F. Real product surfaces, not gradient placeholders. Hero "product preview"
   must contain visible UI structure — a screenshot card with tabs, a code
   snippet with syntax highlighting, a data-table with realistic rows, a
   destination tile with real-looking imagery slot — not an empty rectangle
   behind a gradient.
G. Density target: Mobbin Pro homepages average 9-11 distinct sections at
   1440x900 viewport before the footer. Hit that count.

When the session anchor names a specific app, its Required moves OVERRIDE
these general rules wherever they conflict. The anchor is law; the doctrine
is default.`
}
