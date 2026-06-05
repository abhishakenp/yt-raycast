import type { ResolvedPageSeo } from '../seo/resolve-page-seo.ts'
import { escapeHtml } from '../utils.ts'

export type HeadTagOptions = {
  includeLlmsTxtLink?: boolean
  structuredDataScript?: string
}

export function buildHeadTags(seo: ResolvedPageSeo, options: HeadTagOptions = {}): string[] {
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

  if (options.includeLlmsTxtLink !== false) {
    tags.push('<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable site summary" />')
  }

  if (options.structuredDataScript) {
    tags.push(options.structuredDataScript)
  }

  return tags
}

export function renderSeoHeadMarkup(
  seo: ResolvedPageSeo,
  structuredDataScript?: string,
  options: HeadTagOptions = {},
): { htmlLang: string; markup: string } {
  const script = structuredDataScript
    ? structuredDataScript.startsWith('<script')
      ? structuredDataScript
      : `<script type="application/ld+json">${structuredDataScript}</script>`
    : undefined

  return {
    htmlLang: seo.htmlLang,
    markup: buildHeadTags(seo, { ...options, structuredDataScript: script }).join('\n    '),
  }
}
