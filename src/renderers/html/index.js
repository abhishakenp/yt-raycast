import { createHash } from 'node:crypto'
import {
  buildGlobalCss,
  buildHtmlRuntimeScript,
  escapeHtml,
  getLanguageFontMarkup,
  pageUsesExactClone,
  renderSectionHtml,
  routeToHtmlFile,
} from '../shared.js'
import {
  buildStructuredData,
  renderRobotsTxt,
  renderSitemapXml,
  resolvePageSeo,
  serializeStructuredData,
} from '../seo.js'

function renderSeoHeadMarkup(siteSpec, page) {
  const seo = resolvePageSeo(siteSpec, page)
  const structuredData = buildStructuredData(siteSpec, page)
  const tags = [
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
    `<meta name="theme-color" content="${escapeHtml(seo.themeColor)}" />`,
  ]

  if (seo.keywords.length) {
    tags.push(`<meta name="keywords" content="${escapeHtml(seo.keywords.join(', '))}" />`)
  }
  if (seo.canonicalUrl) {
    tags.push(`<link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`)
    tags.push(`<meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`)
  }

  tags.push(
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(seo.siteName)}" />`,
    `<meta property="og:locale" content="${escapeHtml(seo.locale)}" />`,
    `<meta name="twitter:card" content="${escapeHtml(seo.ogImage ? seo.twitterCard : 'summary')}" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
  )

  if (seo.ogImage) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />`,
      `<meta property="og:image:alt" content="${escapeHtml(seo.ogImageAlt)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />`,
      `<meta name="twitter:image:alt" content="${escapeHtml(seo.ogImageAlt)}" />`,
    )
  }

  if (structuredData.length) {
    tags.push(`<script type="application/ld+json">${serializeStructuredData(structuredData)}</script>`)
  }

  return {
    htmlLang: seo.htmlLang,
    markup: tags.join('\n    '),
  }
}

function applyLangToDocument(html, htmlLang) {
  if (!htmlLang || !/<html\b/i.test(html)) return html
  return html.replace(/<html\b([^>]*)>/i, (_match, attrs) => {
    if (/\blang\s*=/i.test(attrs)) {
      return `<html${attrs.replace(/\blang\s*=\s*(['"]).*?\1/i, ` lang="${htmlLang}"`)}>`
    }
    return `<html${attrs} lang="${htmlLang}">`
  })
}

function stripExistingSeoHeadMarkup(headHtml = '') {
  return headHtml
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(
      /<meta\b[^>]*(?:name|property)\s*=\s*['"](description|keywords|robots|theme-color|twitter:[^'"]+|og:[^'"]+)['"][^>]*>/gi,
      '',
    )
    .replace(/<link\b[^>]*rel\s*=\s*['"]canonical['"][^>]*>/gi, '')
    .replace(/<script\b[^>]*type\s*=\s*['"]application\/ld\+json['"][^>]*>[\s\S]*?<\/script>/gi, '')
    .trim()
}

function applySeoToExactCloneDocument(html, siteSpec, page) {
  const { htmlLang, markup } = renderSeoHeadMarkup(siteSpec, page)
  const withLang = applyLangToDocument(html, htmlLang)

  if (/<head\b[^>]*>/i.test(withLang)) {
    return withLang.replace(/<head\b[^>]*>([\s\S]*?)<\/head>/i, (_match, headInner) => {
      const cleanedHead = stripExistingSeoHeadMarkup(headInner)
      return `<head>
    ${markup}${cleanedHead ? `\n    ${cleanedHead}` : ''}
  </head>`
    })
  }

  if (/<html\b[^>]*>/i.test(withLang)) {
    return withLang.replace(/<html\b[^>]*>/i, (match) => `${match}
  <head>
    ${markup}
  </head>`)
  }

  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
  <head>
    ${markup}
  </head>
  <body>
${withLang}
  </body>
</html>`
}

function applySiteCssHrefToHtml(html, siteCssHref) {
  const safe = escapeHtml(siteCssHref)
  const hadSiteCssLink = /<link\b[^>]*\bhref=["'][^"']*site\.css[^"']*["'][^>]*>/i.test(html)
  let next = html.replace(
    /(<link\b[^>]*\bhref=["'])(\.\/)?site\.css(\?[^"'#]*)?(["'])/gi,
    `$1${safe}$4`,
  )
  if (!hadSiteCssLink && /<\/head>/i.test(next)) {
    next = next.replace(/<\/head>/i, `    <link rel="stylesheet" href="${safe}" />\n  </head>`)
  }
  return next
}

function renderPageDocument(siteSpec, page, siteCssHref) {
  const sections = (page.sections || []).map((section) => renderSectionHtml(section)).join('\n')
  const { htmlLang, markup } = renderSeoHeadMarkup(siteSpec, page)
  const indianFontMarkup = getLanguageFontMarkup(siteSpec._indiaMode)
  const cssHref = escapeHtml(siteCssHref)

  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
  <head>
    ${markup}
    ${indianFontMarkup}
    <link rel="stylesheet" href="${cssHref}" />
  </head>
  <body>
    <div class="site-shell">
      ${sections}
    </div>
    <script src="./site.js"></script>
  </body>
</html>`
}

export function renderHtmlProject(siteSpec) {
  const cssContent = buildGlobalCss(siteSpec.theme)
  const cssFingerprint = createHash('sha256').update(cssContent).digest('hex').slice(0, 12)
  const siteCssHref = `./site.css?v=${cssFingerprint}`

  const files = {
    'site.css': cssContent,
    'site.js': buildHtmlRuntimeScript(),
    'robots.txt': renderRobotsTxt(siteSpec),
  }
  const sitemapXml = renderSitemapXml(siteSpec)
  if (sitemapXml) files['sitemap.xml'] = sitemapXml

  for (const page of siteSpec.pages || []) {
    files[routeToHtmlFile(page.route)] = pageUsesExactClone(page)
      ? applySiteCssHrefToHtml(
          applySeoToExactCloneDocument(page.renderBlueprint.originalHtmlDocument, siteSpec, page),
          siteCssHref,
        )
      : renderPageDocument(siteSpec, page, siteCssHref)
  }

  return { files }
}
