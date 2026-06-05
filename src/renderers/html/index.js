import { createHash } from 'node:crypto'
import {
  buildGlobalCss,
  buildHtmlMotionModule,
  buildHtmlRuntimeScript,
  escapeHtml,
  getLanguageFontMarkup,
  pageUsesExactClone,
  renderSectionHtml,
  routeToHtmlFile,
} from '../shared.js'
import { renderGeneratedSiteLlmsTxt } from '../llms-txt.js'
import { renderSeoHeadMarkup as renderAeoHeadMarkup } from '@ship-fast/aeo'
import {
  buildStructuredData,
  renderRobotsTxt,
  renderSitemapXml,
  resolvePageSeo,
  serializeStructuredData,
} from '../seo.js'
import { shouldUseSwiper } from '@ship-fast/engine/lib/swiper-policy.js'

function renderSeoHeadMarkup(siteSpec, page) {
  const seo = resolvePageSeo(siteSpec, page)
  const structuredData = buildStructuredData(siteSpec, page)
  return renderAeoHeadMarkup(seo, serializeStructuredData(structuredData))
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

const SWIPER_CDN_CSS = 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css'
const SWIPER_CDN_JS = 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js'
const SPLIDE_CDN_CSS = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css'
const SPLIDE_CDN_JS = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js'

function renderPageDocument(siteSpec, page, siteCssHref, siteMotionHref, useSwiper = false) {
  const sections = (page.sections || []).map((section) => renderSectionHtml(section, siteSpec)).join('\n')
  const { htmlLang, markup } = renderSeoHeadMarkup(siteSpec, page)
  const indianFontMarkup = getLanguageFontMarkup(siteSpec._indiaMode)
  const cssHref = escapeHtml(siteCssHref)
  const motionHref = escapeHtml(siteMotionHref)
  const swiperHead = useSwiper
    ? `    <link rel="stylesheet" href="${escapeHtml(SWIPER_CDN_CSS)}" />\n    <link rel="stylesheet" href="${escapeHtml(SPLIDE_CDN_CSS)}" />\n`
    : ''
  const swiperBeforeSiteJs = useSwiper
    ? `    <script src="${escapeHtml(SWIPER_CDN_JS)}" defer></script>\n    <script src="${escapeHtml(SPLIDE_CDN_JS)}" defer></script>\n`
    : ''

  const storeShell = siteSpec.siteType === 'ecommerce' ? ' site-shell--store' : ''
  return `<!doctype html>
<html lang="${escapeHtml(htmlLang)}">
  <head>
    ${markup}
    ${indianFontMarkup}
${swiperHead}    <link rel="stylesheet" href="${cssHref}" />
  </head>
  <body>
    <div class="site-shell${storeShell}">
      <main id="main-content">
      ${sections}
      </main>
    </div>
${swiperBeforeSiteJs}    <script src="./site.js" defer></script>
    <script type="module" src="${motionHref}"></script>
  </body>
</html>`
}

export function renderHtmlProject(siteSpec) {
  const useSwiper = shouldUseSwiper(siteSpec)
  const cssContent = buildGlobalCss(siteSpec.theme, {
    ecommerce: siteSpec.siteType === 'ecommerce',
    siteType: siteSpec.siteType,
  })
  const cssFingerprint = createHash('sha256').update(cssContent).digest('hex').slice(0, 12)
  const siteCssHref = `./site.css?v=${cssFingerprint}`

  const motionContent = buildHtmlMotionModule()
  const motionFingerprint = createHash('sha256').update(motionContent).digest('hex').slice(0, 12)
  const siteMotionHref = `./site-motion.mjs?v=${motionFingerprint}`

  const files = {
    'site.css': cssContent,
    'site.js': buildHtmlRuntimeScript(useSwiper),
    'site-motion.mjs': motionContent,
    'robots.txt': renderRobotsTxt(siteSpec),
    'llms.txt': renderGeneratedSiteLlmsTxt(siteSpec),
  }
  const sitemapXml = renderSitemapXml(siteSpec)
  if (sitemapXml) files['sitemap.xml'] = sitemapXml

  // Enrich ecommerce sections with seed data for static rendering
  if (siteSpec.siteType === 'ecommerce' && siteSpec.ecommerce?.products) {
    for (const page of siteSpec.pages || []) {
      for (const section of page.sections || []) {
        if (section.type === 'product-grid' && (!section.items || section.items.length === 0)) {
          section.items = siteSpec.ecommerce.products.map((p) => ({
            id: p.id,
            title: p.title,
            body: p.description,
            price: typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price,
            image: p.image || '',
            category: p.category || p.categoryName || '',
            compareAt:
              p.compareAt != null
                ? typeof p.compareAt === 'number'
                  ? `$${p.compareAt.toFixed(2)}`
                  : p.compareAt
                : p.compare_at != null
                  ? typeof p.compare_at === 'number'
                    ? `$${p.compare_at.toFixed(2)}`
                    : p.compare_at
                  : '',
            rating: typeof p.rating === 'number' ? p.rating : undefined,
          }))
        }
        if (section.type === 'featured-products' && (!section.items || section.items.length === 0)) {
          section.items = siteSpec.ecommerce.products.slice(0, 4).map((p) => ({
            id: p.id,
            title: p.title,
            body: p.description,
            price: typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price,
            image: p.image || '',
            category: p.category || p.categoryName || '',
            compareAt:
              p.compareAt != null
                ? typeof p.compareAt === 'number'
                  ? `$${p.compareAt.toFixed(2)}`
                  : p.compareAt
                : p.compare_at != null
                  ? typeof p.compare_at === 'number'
                    ? `$${p.compare_at.toFixed(2)}`
                    : p.compare_at
                  : '',
            rating: typeof p.rating === 'number' ? p.rating : undefined,
          }))
        }
      }
    }
  }

  for (const page of siteSpec.pages || []) {
    files[routeToHtmlFile(page.route)] = pageUsesExactClone(page)
      ? applySiteCssHrefToHtml(
          applySeoToExactCloneDocument(page.renderBlueprint.originalHtmlDocument, siteSpec, page),
          siteCssHref,
        )
      : renderPageDocument(siteSpec, page, siteCssHref, siteMotionHref, useSwiper)
  }

  return { files }
}
