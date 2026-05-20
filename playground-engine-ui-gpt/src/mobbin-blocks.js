import { resolveCopyExamples, resolveDna, synthesizeDna } from './dna.js'

function formatPaletteLine(palette = []) {
  return palette.slice(0, 5).join(', ')
}

function paletteRoleHint(palette = []) {
  const norm = palette.map((h) => String(h).toLowerCase()).filter((h) => /^#[0-9a-f]{6}$/.test(h))
  if (norm.length < 3) return ''
  const sorted = [...norm].sort((a, b) => {
    const la = parseInt(a.slice(1, 3), 16) + parseInt(a.slice(3, 5), 16) + parseInt(a.slice(5, 7), 16)
    const lb = parseInt(b.slice(1, 3), 16) + parseInt(b.slice(3, 5), 16) + parseInt(b.slice(5, 7), 16)
    return la - lb
  })
  const background = sorted[0]
  const text = sorted[sorted.length - 1]
  const surface = sorted[1]
  const primary =
    norm
      .filter((h) => h !== background && h !== surface && h !== text)
      .find((h) => {
        const r = parseInt(h.slice(1, 3), 16)
        const g = parseInt(h.slice(3, 5), 16)
        const b = parseInt(h.slice(5, 7), 16)
        return Math.max(r, g, b) - Math.min(r, g, b) > 40
      }) || sorted[Math.floor(sorted.length / 2)]
  return `background=${background}, surface=${surface}, primary=${primary}, text=${text}`
}

function dnaImperatives(dna, app) {
  const out = []
  if (!dna) return out
  if (dna.display) out.push(`Display typography: ${dna.display}`)
  if (dna.body) out.push(`Body typography: ${dna.body}`)
  if (dna.mono) out.push(`Mono typography: ${dna.mono}`)
  if (dna.layout) out.push(`Layout signature: ${dna.layout}`)
  if (dna.copy) out.push(`Copy register: ${dna.copy}`)
  if (dna.composition) out.push(`Composition reference: ${dna.composition}`)
  if (Array.isArray(dna.doctrine)) {
    for (const line of dna.doctrine) out.push(`Required move: ${line}`)
  }
  if (Array.isArray(dna.avoid)) {
    out.push(`Reject these ${app} anti-patterns: ${dna.avoid.join('; ')}`)
  }
  return out
}

export function resolveAnchor({ app, category, palette } = {}) {
  if (!app) return null
  const dna = resolveDna(app) || synthesizeDna(palette || [])
  if (!dna) return null
  return {
    app: dna._bankApp || app,
    category: category || null,
    palette: palette?.length ? palette : Array.isArray(dna.accents) ? dna.accents : [],
    dna,
    copyExamples: resolveCopyExamples(dna._bankApp || app),
  }
}

export function mobbinSessionBlock(primary, secondary = null) {
  if (!primary?.app) return ''
  const lines = []
  lines.push('')
  lines.push('MOBBIN OFFLINE DESIGN DNA')
  lines.push(`PRIMARY ANCHOR: ${primary.app}${primary.category ? ` (${primary.category})` : ''}`)

  const palette = primary.palette?.length ? primary.palette : primary.dna?.accents || []
  if (palette.length) {
    lines.push(`Palette: ${formatPaletteLine(palette)}`)
    const roleHint = paletteRoleHint(palette)
    if (roleHint) {
      lines.push(`Palette roles: ${roleHint}. Use these exact hex strings in Tailwind arbitrary-value classes and tailwind.config colors.`)
    }
  }

  for (const line of dnaImperatives(primary.dna, primary.app)) lines.push(line)

  if (primary.copyExamples) {
    if (primary.copyExamples.headlines?.length) {
      lines.push(`Headline register examples, style only, never copy verbatim: ${primary.copyExamples.headlines.slice(0, 3).map((h) => `"${h}"`).join(' | ')}`)
    }
    if (primary.copyExamples.products?.length) {
      lines.push(`Product noun register, inspiration only: ${primary.copyExamples.products.slice(0, 6).join(', ')}. Invent equivalents for this brand.`)
    }
  }

  if (secondary?.app) {
    lines.push('')
    lines.push(`SECONDARY ANCHOR: ${secondary.app}${secondary.category ? ` (${secondary.category})` : ''}`)
    if (secondary.dna?.copy) lines.push(`Secondary copy register: ${secondary.dna.copy}`)
    if (secondary.copyExamples?.headlines?.length) {
      lines.push(`Secondary headline energy, style only: ${secondary.copyExamples.headlines.slice(0, 2).map((h) => `"${h}"`).join(' | ')}`)
    }
    lines.push(`Blend rule: ${primary.app} supplies palette, typography, and layout. ${secondary.app} supplies copy energy only. Invent all copy.`)
  }

  lines.push('')
  lines.push(`Inheritance target: the page should read as if it could ship from the ${primary.app} brand team, adapted to the user's brief. Borrow design logic, never literal marketing copy.`)
  return lines.join('\n')
}

export function mobbinDoctrineBlock() {
  return `
MOBBIN PRO INHERITANCE DOCTRINE
The generated page should feel at home beside high-quality Mobbin Pro references such as Linear, Stripe, Vercel, Notion, Figma, Airbnb, Apple, Patagonia, Spotify, and Vogue.

Rules:
1. Palette discipline. If an anchor supplies hex values, use the literal strings in Tailwind arbitrary-value classes and tailwind.config colors. Do not round or substitute them.
2. Typography register. Match the anchor's display/body/mono register. Never use more than 3 font families.
3. Composition rigor. The page needs a load-bearing silhouette: strong opening surface, immediate proof or orientation strip, deep content/product surfaces, named social proof or editorial evidence, penultimate CTA, and real footer.
4. Copy specificity. Use concrete product nouns, real numbers, named entities, and outcome verbs. Ban generic hype such as unleash, revolutionize, supercharge, and next-gen.
5. Visual restraint. One or two saturated accents at most unless the chosen anchor is explicitly maximalist. Avoid default purple-blue gradient SaaS.
6. Real surfaces. A hero visual must contain real UI, catalog, editorial, event, data, or product structure. Empty gradient rectangles do not count.
7. Variety. The same vertical may take multiple valid forms. Do not repeat the same layout grammar, fonts, palette, or proof rhythm across runs.
`
}
