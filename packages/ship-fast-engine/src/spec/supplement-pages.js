import { HOME_LABELS } from '../config.js'
import { routeToHtmlFile } from '../renderers/shared.js'
import { slug } from '../pipeline/workspace.js'

function isHomePage(page = {}) {
  const name = String(page.name || page.title || '').toLowerCase()
  const route = String(page.route || '')
  return route === '/' || HOME_LABELS.includes(name)
}

function secondaryPageCount(pages = []) {
  return pages.filter((p) => p && !isHomePage(p)).length
}

function minimalPageStub(name, projectName, idx) {
  const route = idx === 0 ? '/' : `/${slug(name)}`
  const title = idx === 0 ? projectName : `${name} | ${projectName}`
  return {
    id: idx === 0 ? 'page-home' : `page-${slug(name)}`,
    name,
    route,
    title,
    description: `${name} page for ${projectName}.`,
    seo: {
      title,
      description: `${name} page for ${projectName}.`,
      keywords: [name, projectName].filter(Boolean),
      canonicalPath: route,
      canonicalUrl: '',
      ogImage: '',
      ogImageAlt: '',
      noIndex: false,
    },
    layoutType: 'marketing',
    sections: [],
  }
}

/**
 * Mobbin anchors often collapse the spec to a single marketing homepage.
 * Merge ctx.pages back in so we still generate shop/blog/cart HTML and wire nav.
 */
export function supplementSiteSpecPages(siteSpec, ctx = {}) {
  if (!siteSpec || typeof siteSpec !== 'object') return siteSpec
  const ctxPages = Array.isArray(ctx.pages) ? ctx.pages.filter(Boolean) : []
  if (!ctxPages.length) return siteSpec

  const existing = Array.isArray(siteSpec.pages) ? siteSpec.pages : []
  if (secondaryPageCount(existing) > 0) return siteSpec

  const projectName = siteSpec.projectName || ctx.project_name || 'Project'
  const homeName =
    ctxPages.find((n) => HOME_LABELS.includes(String(n).toLowerCase())) ||
    existing.find((p) => isHomePage(p))?.name ||
    'Home'
  const names = ctxPages.length ? ctxPages : [homeName]

  const pages = names.map((name, idx) => {
    const match = existing.find(
      (p) =>
        isHomePage(p) && idx === 0 && HOME_LABELS.includes(String(name).toLowerCase()),
    )
    if (match) return match
    const byName = existing.find((p) => slug(p.name || p.title) === slug(name))
    if (byName) return byName
    return minimalPageStub(name, projectName, idx)
  })

  const navLinks = pages.map((page) => ({
    label: page.name,
    href: routeToHtmlFile(page.route),
  }))

  return {
    ...siteSpec,
    pages,
    navigation: {
      ...(siteSpec.navigation && typeof siteSpec.navigation === 'object' ? siteSpec.navigation : {}),
      global: navLinks,
      footer: navLinks,
    },
  }
}
