export const inferSiteTypeHint = (prompt) => {
  const lower = (prompt || '').toLowerCase()
  if (/\b(e-?commerce|online\s*store|shop|product|cart|checkout|buy|retail|merch)\b/.test(lower))
    return 'ecommerce'
  if (
    /\b(government|govt|psu|public\s*sector|ministry|tender|tenders|notification|circular|bhel|ntpc|iocl|ongc|cpcb|powermin|shipindia)\b/.test(
      lower,
    )
  )
    return 'institutional'
  if (/\b(portfolio|creative|artist|photographer|designer)\b/.test(lower)) return 'portfolio'
  if (/\b(blog|journal|magazine|publication|article)\b/.test(lower)) return 'blog'
  if (/\b(game|play|3d|arcade)\b/.test(lower)) return 'game'
  return null
}
