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
  if (!/=\s*(EditorialHero|SplitHero|DashboardShell|AuthSplitPanel)\(/.test(t)) {
    hints.push('No primary layout component (EditorialHero, SplitHero, DashboardShell, AuthSplitPanel) detected.')
  }
  const assigns = t.match(/[a-zA-Z_][a-zA-Z0-9_]*\s*=/g) || []
  if (assigns.length < 3) hints.push('Few named assignments; output may be a thin scaffold.')
  if (t.length < 380) hints.push('Short program body; consider more sections for marketing/dashboard briefs.')
  if (!/\b(FeatureBento|MetricGrid|CampaignList|ActivityTable|ProductCard)\(/.test(t)) {
    hints.push('No common content block (FeatureBento, MetricGrid, lists, ProductCard) — ok for minimal pages.')
  }
  return hints
}
