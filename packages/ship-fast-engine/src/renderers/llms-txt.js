import { normalizeSiteUrl, resolvePageSeo } from './seo.js'

function normalizePath(value = '/') {
  const raw = String(value || '').trim()
  if (!raw || raw === '/') return '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}

function joinUrl(baseUrl, path = '/') {
  if (!baseUrl) return ''
  try {
    return new URL(normalizePath(path), `${baseUrl}/`).toString()
  } catch {
    return ''
  }
}

function llmsLine(name, url, note) {
  const n = String(note || '').trim()
  return n ? `- [${name}](${url}): ${n}` : `- [${name}](${url})`
}

export function renderShipFastLlmsTxt({ siteUrl, includeBlog = false, includeInstitutional = false }) {
  const base = normalizeSiteUrl(siteUrl || '')
  const link = (path, name, note) => llmsLine(name, base ? joinUrl(base, path) : path, note)

  const lines = [
    '# Ship Fast',
    '> AI website generator: describe a site, preview it, export HTML, React, or Next.js.',
    '',
    '## Product',
    link('/', 'Home', 'Prompt UI, generation, and gallery.'),
    link('/pricing', 'Pricing', 'Plans and limits.'),
    link('/privacy', 'Privacy', 'Data handling and contact.'),
  ]

  if (includeBlog) {
    lines.push('', '## Content', link('/blog', 'Blog', 'Articles and updates.'))
  }

  if (includeInstitutional) {
    lines.push(
      '',
      '## Company',
      link('/notices', 'Notices', 'Official notices and documents.'),
      link('/careers', 'Careers', 'Open roles.'),
    )
  }

  return `${lines.join('\n')}\n`
}

export function renderGeneratedSiteLlmsTxt(siteSpec) {
  const siteName = String(siteSpec?.seo?.siteName || siteSpec?.projectName || 'Site').trim() || 'Site'
  const siteUrl = normalizeSiteUrl(siteSpec?.seo?.siteUrl || '')
  const desc = String(siteSpec?.seo?.description || '').trim()
  const pages = (siteSpec?.pages || []).filter((p) => p?.seo?.noIndex !== true)

  const header = [`# ${siteName}`]
  if (desc) header.push(`> ${desc}`)
  header.push('')
  const section = ['## Pages']

  for (const page of pages) {
    const seo = resolvePageSeo(siteSpec, page)
    const route = normalizePath(page.route || '/')
    const href = siteUrl ? joinUrl(siteUrl, route) : route
    const note = String(seo.description || page.description || page.title || '').trim().slice(0, 240)
    section.push(llmsLine(String(page.name || page.title || route).trim() || 'Page', href, note))
  }

  if (pages.length === 0) {
    section.push('- (No indexable pages in site spec.)')
  }

  return `${[...header, ...section].join('\n')}\n`
}
