export const reconcileExpandedSiteSpec = (thin, expanded, log) => {
  if (!thin?.pages?.[0]?.id || !expanded?.pages?.length) return expanded
  const homeId = thin.pages[0].id
  const i = expanded.pages.findIndex((p) => p && p.id === homeId)
  if (i === 0) return expanded
  if (i > 0) {
    const row = expanded.pages.splice(i, 1)[0]
    expanded.pages.unshift(row)
    return expanded
  }
  log?.(`  site-spec expand: prepending thin homepage (id ${homeId})`)
  return { ...expanded, pages: [thin.pages[0], ...expanded.pages] }
}
