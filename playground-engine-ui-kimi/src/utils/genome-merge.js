export function mergePaletteDrift(html, plan) {
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
  }
  return out
}

export function applyGenomeMerge(html, plan) {
  return mergePaletteDrift(html, plan)
}
