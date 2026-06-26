export const buildHomepageSpecSliceJson = (spec) => {
  if (!spec || typeof spec !== 'object') return ''
  const pages = spec.pages
  if (!Array.isArray(pages) || !pages.length) return ''
  const home =
    pages.find(
      (p) => p && (p.route === '/' || /^home$/i.test(String(p.name || ''))),
    ) ?? pages[0]
  const slice = {
    projectName: spec.projectName,
    slug: spec.slug,
    siteType: spec.siteType,
    planMeta: spec.planMeta,
    theme: spec.theme,
    navigation: spec.navigation,
    homepage: home,
    ecommerce: spec.siteType === 'ecommerce' ? spec.ecommerce : undefined,
  }
  return JSON.stringify(slice, null, 2)
}
