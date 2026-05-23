export function mergePaletteDrift(html, plan, route) {
  const a = plan?.visualWorld
  if (!a?.accent || !a?.bg) return html
  let out = String(html ?? '')
  const driftPatterns = [
    [/\bbg-(?:slate|zinc|gray|neutral|stone)-(?:50|100|200|800|900|950)\b/g, `bg-[${a.bg}]`],
    [/\btext-(?:slate|zinc|gray|neutral|stone)-(?:400|500|600|700|800|900)\b/g, `text-[${a.text}]`],
  ]
  for (const [pattern, replacement] of driftPatterns) {
    if ((out.match(pattern) || []).length > 12) {
      out = out.replace(pattern, replacement)
    }
  }
  if (a.accent && !out.includes(a.accent)) {
    out = out.replace(/\bbg-(?:blue|indigo|violet|purple)-(?:500|600)\b/g, `bg-[${a.accent}]`)
    out = out.replace(/\btext-(?:blue|indigo|violet|purple)-(?:500|600)\b/g, `text-[${a.accent}]`)
  }
  const anchorAccents = route?.primary?.dna?.accents || route?.primary?.palette || []
  for (const hex of anchorAccents.slice(0, 2)) {
    const lower = String(hex).toLowerCase()
    if (/^#[0-9a-f]{6}$/.test(lower) && !out.toLowerCase().includes(lower)) {
      out = out.replace(/\bbg-(?:blue|indigo|violet|purple)-(?:500|600)\b/g, `bg-[${lower}]`)
    }
  }
  return out
}

export function applyGenomeMerge(html, plan, route) {
  return mergePaletteDrift(html, plan, route)
}
