/**
 * Dev-only heuristics on OpenUI Lang source. Does not replace human visual approval.
 * @param {string} source
 * @returns {string[]}
 */
export function openUIDevQualityHints(source) {
  const hints = []
  const t = String(source || '').trim()
  if (!t) {
    hints.push('Empty source.')
    return hints
  }
  if (!/\broot\s*=/.test(t)) hints.push('Missing root assignment.')
  if (!/=\s*[A-Z][A-Za-z0-9_]*(Navbar|Header|Hero)\(/.test(t)) {
    hints.push('No primary registry module (Navbar, Header, or Hero) detected.')
  }
  const assigns = t.match(/[a-zA-Z_][a-zA-Z0-9_]*\s*=/g) || []
  if (assigns.length < 3)
    hints.push('Few named assignments; output may be a thin scaffold.')
  if (t.length < 380)
    hints.push(
      'Short program body; consider more sections for marketing/dashboard briefs.',
    )
  if (
    !/=\s*[A-Z][A-Za-z0-9_]*(Features|Stats|Kpis|Table|Gallery|Menu|Services|Solutions|Products|LatestStories)\(/.test(
      t,
    )
  ) {
    hints.push(
      'No common registry content module detected — ok for minimal pages.',
    )
  }
  return hints
}
