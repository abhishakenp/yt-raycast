export const inferSiteTypeHint = (prompt) => {
  const lower = (prompt || '').toLowerCase()
  if (
    /\b(dashboard|admin\s+panel|analytics\s+(workspace|console)|internal\s+(tool|app|dashboard))\b/.test(
      lower,
    )
  )
    return 'dashboard'
  if (
    /\b(saas|software-?as-?a-?service|b2b\s+(saas|platform|software)|subscription\s+platform|cloud\s+platform)\b/.test(
      lower,
    )
  )
    return 'saas'
  if (
    /\b(e-?commerce|online\s*store|shop|cart|checkout|buy|retail|merch)\b/.test(lower) ||
    (/\bproduct\b/.test(lower) &&
      !/\b(dashboard|admin|analytics|kpi|metrics|internal\s+tool)\b/.test(lower))
  )
    return 'ecommerce'
  if (
    /\b(government|govt|psu|public\s*sector|ministry|maharatna|cpse|tender|tenders|notification|circular|bhel|ntpc|iocl|ongc|cpcb|powermin|shipindia)\b/.test(
      lower,
    )
  )
    return 'institutional'
  if (/\b(portfolio|creative|artist|photographer|designer)\b/.test(lower)) return 'portfolio'
  if (/\b(blog|journal|magazine|publication|article)\b/.test(lower)) return 'blog'
  if (/\b(game|play|3d|arcade)\b/.test(lower)) return 'game'
  return null
}
