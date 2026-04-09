function uniqueStrings(values = []) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]
}

function cleanObject(value) {
  if (Array.isArray(value)) {
    const cleaned = value.map(cleanObject).filter((entry) => entry !== undefined)
    return cleaned.length ? cleaned : undefined
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, entry]) => [key, cleanObject(entry)])
      .filter(([, entry]) => entry !== undefined)
    return entries.length ? Object.fromEntries(entries) : undefined
  }

  if (value === '' || value == null) return undefined
  return value
}

function normalizePath(value = '/') {
  const raw = String(value || '').trim()
  if (!raw || raw === '/') return '/'
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw)
      return `${parsed.pathname || '/'}${parsed.search || ''}${parsed.hash || ''}`
    } catch {
      return '/'
    }
  }
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

function extractFaqItems(page) {
  return (page?.sections || [])
    .filter((section) => section.type === 'faq')
    .flatMap((section) => section.items || [])
    .map((item) => ({
      question: String(item?.title || '').trim(),
      answer: String(item?.body || '').trim(),
    }))
    .filter((item) => item.question && item.answer)
}

export function normalizeSiteUrl(value = '') {
  const raw = String(value || '').trim()
  if (!raw) return ''

  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return ''
    return url.toString().replace(/\/+$/, '')
  } catch {
    return ''
  }
}

export function resolveAssetUrl(value = '', siteUrl = '') {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  if (siteUrl) return joinUrl(siteUrl, raw)
  return raw.startsWith('/') ? raw : ''
}

export function resolvePageSeo(siteSpec, page) {
  const siteSeo = siteSpec?.seo && typeof siteSpec.seo === 'object' ? siteSpec.seo : {}
  const pageSeo = page?.seo && typeof page.seo === 'object' ? page.seo : {}
  const siteUrl = normalizeSiteUrl(siteSeo.siteUrl || '')
  const routePath = normalizePath(pageSeo.canonicalPath || page?.route || '/')
  const canonicalUrl = pageSeo.canonicalUrl
    ? normalizeSiteUrl(pageSeo.canonicalUrl)
    : joinUrl(siteUrl, routePath)
  const locale = String(siteSeo.locale || 'en_US').trim() || 'en_US'
  const htmlLang = locale.replace('_', '-')
  const title = String(pageSeo.title || page?.title || siteSeo.title || siteSpec?.projectName || '').trim()
  const description = String(
    pageSeo.description || page?.description || siteSeo.description || '',
  ).trim()
  const siteName = String(siteSeo.siteName || siteSpec?.projectName || title || 'Website').trim()
  const robots = pageSeo.noIndex ? 'noindex, nofollow' : String(siteSeo.robots || 'index, follow')
  const keywords = uniqueStrings([...(siteSeo.keywords || []), ...(pageSeo.keywords || [])])
  const ogImage = resolveAssetUrl(pageSeo.ogImage || siteSeo.ogImage || '', siteUrl)
  const ogImageAlt = String(
    pageSeo.ogImageAlt || siteSeo.ogImageAlt || `${title || siteName} social preview`,
  ).trim()
  const twitterCard = String(siteSeo.twitterCard || 'summary_large_image')
  const themeColor = String(siteSpec?.theme?.colors?.background || '#09090b')

  return {
    title,
    description,
    siteName,
    siteUrl,
    routePath,
    canonicalUrl,
    locale,
    htmlLang,
    robots,
    keywords,
    ogImage,
    ogImageAlt,
    twitterCard,
    themeColor,
    noIndex: Boolean(pageSeo.noIndex),
  }
}

export function buildStructuredData(siteSpec, page) {
  const seo = resolvePageSeo(siteSpec, page)
  const entries = []

  if (page?.route === '/') {
    entries.push(
      cleanObject({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seo.siteName,
        url: seo.siteUrl || seo.canonicalUrl,
        description: seo.description,
      }),
    )
  }

  entries.push(
    cleanObject({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: seo.title,
      description: seo.description,
      url: seo.canonicalUrl,
      isPartOf: seo.siteUrl
        ? {
            '@type': 'WebSite',
            name: seo.siteName,
            url: seo.siteUrl,
          }
        : undefined,
    }),
  )

  const faqItems = extractFaqItems(page)
  if (faqItems.length) {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    })
  }

  return entries.filter(Boolean)
}

export function serializeStructuredData(data) {
  return JSON.stringify(data.length === 1 ? data[0] : data).replace(/</g, '\\u003c')
}

export function buildNextMetadata(siteSpec, page) {
  const seo = resolvePageSeo(siteSpec, page)

  return cleanObject({
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: cleanObject({
      type: 'website',
      locale: seo.locale,
      url: seo.canonicalUrl,
      title: seo.title,
      description: seo.description,
      siteName: seo.siteName,
      images: seo.ogImage
        ? [
            {
              url: seo.ogImage,
              alt: seo.ogImageAlt,
            },
          ]
        : undefined,
    }),
    twitter: cleanObject({
      card: seo.ogImage ? seo.twitterCard : 'summary',
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    }),
    themeColor: seo.themeColor,
  })
}

export function buildSitemapEntries(siteSpec) {
  const siteUrl = normalizeSiteUrl(siteSpec?.seo?.siteUrl || '')
  if (!siteUrl) return []

  const lastModified = siteSpec?.generatedTimestamp
    ? new Date(siteSpec.generatedTimestamp).toISOString()
    : new Date().toISOString()

  const pageEntries = (siteSpec?.pages || [])
    .filter((page) => page?.seo?.noIndex !== true)
    .map((page) =>
      cleanObject({
        url: joinUrl(siteUrl, page.route || '/'),
        lastModified,
        changeFrequency: page.route === '/' ? 'weekly' : 'monthly',
        priority: page.route === '/' ? 1 : 0.8,
      }),
    )

  if (siteSpec?.siteType === 'ecommerce') {
    const extra = [
      cleanObject({
        url: joinUrl(siteUrl, '/shop'),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.85,
      }),
      cleanObject({
        url: joinUrl(siteUrl, '/checkout'),
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
      }),
    ]
    return [...pageEntries, ...extra]
  }

  return pageEntries
}

export function renderRobotsTxt(siteSpec) {
  const siteUrl = normalizeSiteUrl(siteSpec?.seo?.siteUrl || '')
  const lines = ['User-agent: *', 'Allow: /']
  if (siteUrl) {
    lines.push('', `Sitemap: ${siteUrl}/sitemap.xml`)
  }
  return `${lines.join('\n')}\n`
}

export function renderSitemapXml(siteSpec) {
  const entries = buildSitemapEntries(siteSpec)
  if (!entries.length) return null

  const body = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}
