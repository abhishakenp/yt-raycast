function normalizePath(value: string = '/'): string {
  const raw = String(value || '').trim()
  if (!raw || raw === '/') return '/'
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw)
      return `${parsed.pathname || '/'}`
    } catch {
      return '/'
    }
  }
  return raw.startsWith('/') ? raw : `/${raw}`
}

export interface NavLink {
  href?: string
  id?: string
  label?: string
  style?: string
}

interface PageSection {
  links?: NavLink[]
  actions?: NavLink[]
}

export interface PageSpec {
  route?: string
  id?: string
  name?: string
  title?: string
  description?: string
  seo?: { noIndex?: boolean; description?: string }
  sections?: PageSection[]
}

export interface SiteSpec {
  pages?: PageSpec[]
  navigation?: {
    global?: NavLink[]
    footer?: NavLink[]
    ctas?: NavLink[]
  }
}

function collectLinkedRoutes(siteSpec: SiteSpec): Set<string> {
  const set = new Set<string>()
  const addHref = (href: string | undefined): void => {
    const h = String(href || '').trim()
    if (!h.startsWith('/')) return
    const pathOnly = h.split('?')[0].split('#')[0]
    set.add(normalizePath(pathOnly))
  }
  for (const list of [
    siteSpec.navigation?.global,
    siteSpec.navigation?.footer,
    siteSpec.navigation?.ctas,
  ]) {
    for (const a of list || []) addHref(a?.href)
  }
  for (const page of siteSpec.pages || []) {
    for (const sec of page.sections || []) {
      for (const a of sec.links || []) addHref(a?.href)
      for (const a of sec.actions || []) addHref(a?.href)
    }
  }
  return set
}

const THIN_FAMILY_MAX_INDEXABLE = 12
const THIN_DESC_MIN_CHARS = 90

export function applyGeneratedSitePseoGuardrails(siteSpec: SiteSpec): SiteSpec {
  if (!siteSpec?.pages?.length) return siteSpec

  for (const page of siteSpec.pages) {
    const r = String(page.route || '/')
    if (r.includes('?') || r.includes('#')) {
      if (!page.seo) page.seo = {}
      page.seo.noIndex = true
    }
  }

  const byPrefix = new Map<string, PageSpec[]>()
  for (const page of siteSpec.pages) {
    if (page?.seo?.noIndex) continue
    const p = normalizePath(page.route || '/')
    if (p === '/') continue
    const parts = p.split('/').filter(Boolean)
    const key = parts.length >= 2 ? `/${parts[0]}` : p
    if (!byPrefix.has(key)) byPrefix.set(key, [])
    byPrefix.get(key)!.push(page)
  }

  for (const [, group] of byPrefix) {
    if (group.length <= THIN_FAMILY_MAX_INDEXABLE) continue
    group.sort((a: PageSpec, b: PageSpec) =>
      String(a.route).localeCompare(String(b.route)),
    )
    for (let i = THIN_FAMILY_MAX_INDEXABLE; i < group.length; i++) {
      const page = group[i]
      const desc = String(
        page.seo?.description || page.description || '',
      ).trim()
      if (desc.length < THIN_DESC_MIN_CHARS) {
        if (!page.seo) page.seo = {}
        page.seo.noIndex = true
      }
    }
  }

  const linked = collectLinkedRoutes(siteSpec)
  const indexable = (siteSpec.pages || []).filter((p) => !p?.seo?.noIndex)
  const missing = indexable.filter((p) => {
    const pr = normalizePath(p.route || '/')
    return pr !== '/' && !linked.has(pr)
  })

  if (missing.length) {
    if (!siteSpec.navigation)
      siteSpec.navigation = { global: [], footer: [], ctas: [] }
    const footer = [...(siteSpec.navigation.footer || [])]
    const seen = new Set(
      footer.map((x: NavLink) =>
        normalizePath(String(x?.href || '').split('?')[0]),
      ),
    )
    for (const page of missing) {
      const href = normalizePath(page.route || '/')
      if (seen.has(href)) continue
      seen.add(href)
      footer.push({
        id: `pseo-footer-${page.id || href.replace(/\W/g, '-')}`,
        label: String(page.name || page.title || href).slice(0, 80) || 'Page',
        href,
        style: 'link',
      })
    }
    siteSpec.navigation.footer = footer
  }

  return siteSpec
}
