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
  if (secondary?.app) {
    lines.push(`SECONDARY ANCHOR: ${secondary.app}`)
    for (const line of dnaImperatives(secondary.dna, secondary.app).slice(0, 2)) lines.push(line)
  }
  return lines.join('\n')
}
