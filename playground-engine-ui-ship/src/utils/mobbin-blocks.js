import { resolveDna, synthesizeDna } from './dna.js'

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
  const primary = norm.find((h) => h !== background && h !== surface && h !== text) || sorted[Math.floor(sorted.length / 2)]
  return `background=${background}, surface=${surface}, primary=${primary}, text=${text}`
}

function dnaImperatives(dna, app) {
  const out = []
  if (!dna) return out
  if (dna.display) out.push(`Display typography: ${dna.display}`)
  if (dna.body) out.push(`Body typography: ${dna.body}`)
  if (dna.layout) out.push(`Layout signature: ${dna.layout}`)
  if (dna.copy) out.push(`Copy register: ${dna.copy}`)
  if (Array.isArray(dna.doctrine)) {
    for (const line of dna.doctrine) out.push(`Required move: ${line}`)
  }
  if (Array.isArray(dna.avoid)) {
    out.push(`Reject these ${app} anti-patterns: ${dna.avoid.join('; ')}`)
  }
  return out
}

export function mobbinDoctrineBlock() {
  return `Design doctrine:
- First viewport must feel expensive: decisive hero scale, one memorable visual object, concrete named copy.
- Use the anchor palette literally in Tailwind arbitrary hex classes.
- Every data-img block is a finished visual artifact (dashboard panel, product still-life, room composition, menu board, editorial spread) — never a flat gray rectangle.
- No lorem, no generic SaaS filler, no exclamation marks.`
}

/** Compact Mobbin DNA for Gemini hero leg — high signal, ~250 tokens max. */
export function mobbinHeroBlock(primary, { publication = false } = {}) {
  if (!primary?.app) return ''
  const dna = primary.dna
  const palette = primary.palette?.length ? primary.palette : dna?.accents || []
  const lines = [
    '',
    `MOBBIN ANCHOR — ${primary.app}: inherit this app's visual signature (palette, typography, layout grammar). Not a generic template.`,
  ]
  if (palette.length) {
    lines.push(`Palette (verbatim in arbitrary hex): ${formatPaletteLine(palette)}`)
    const roleHint = paletteRoleHint(palette)
    if (roleHint) lines.push(`Roles: ${roleHint}`)
  }
  if (dna?.display) lines.push(`Display type: ${String(dna.display).slice(0, 90)}`)
  if (dna?.body) lines.push(`Body type: ${String(dna.body).slice(0, 90)}`)
  if (dna?.layout) lines.push(`Layout: ${String(dna.layout).slice(0, publication ? 180 : 220)}`)
  if (dna?.copy) lines.push(`Copy: ${String(dna.copy).slice(0, publication ? 120 : 160)}`)
  if (Array.isArray(dna?.doctrine)) {
    for (const line of dna.doctrine.slice(0, publication ? 3 : 4)) lines.push(`Must: ${line}`)
  }
  if (Array.isArray(dna?.avoid)) {
    lines.push(`Reject: ${dna.avoid.slice(0, 4).join('; ')}`)
  }
  return lines.join('\n')
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
      lines.push(`Palette roles: ${roleHint}. Use these exact hex strings in Tailwind arbitrary-value classes.`)
    }
  }

  for (const line of dnaImperatives(primary.dna, primary.app)) lines.push(line)
  if (primary.dna?.composition) {
    lines.push(
      `Composition (follow surface-by-surface): ${String(primary.dna.composition).slice(0, 520)}`,
    )
  }
  lines.push(
    `Inheritance: palette hex MUST appear literally in Tailwind arbitrary classes; ≥3 doctrine moves visible; zero anti-patterns; thumbnail-glance should read as ${primary.app}-family craft.`,
  )
  if (secondary?.app) {
    lines.push(`SECONDARY ANCHOR: ${secondary.app}`)
    for (const line of dnaImperatives(secondary.dna, secondary.app).slice(0, 2)) lines.push(line)
  }
  return lines.join('\n')
}
