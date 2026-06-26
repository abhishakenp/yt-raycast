import { writeFile } from './workspace.js'
import {
  materializeBrandfetchLogoToWorkspace,
  resolveBrandfetchBrandProfile,
} from '../brandfetch.js'

const SEARCH_API_URL = 'https://search.brave.com/search'
const FETCH_TIMEOUT_MS = 7000
const MAX_SEARCH_RESULTS = 8
const MAX_SOURCE_PAGES = 3
const BLACKLISTED_PRIMARY_HOST_RE =
  /(^|\.)((facebook|instagram|linkedin|youtube|youtu|x|twitter|tiktok|pinterest|threads|justdial|indiamart|tradeindia|sulekha|amazon|flipkart|nykaa|myntra)\.)/i
const SOCIAL_HOST_RE =
  /(^|\.)((facebook|instagram|linkedin|youtube|youtu|x|twitter|tiktok|pinterest|threads|wa\.me)\.)/i
const SEARCH_RESULT_RE =
  /title:"((?:\\.|[^"\\])*)",url:"(https?:\/\/[^"]+)"[\s\S]{0,1600}?description:"((?:\\.|[^"\\])*)"[\s\S]{0,800}?type:"search_result"/g
const JSON_LD_RE =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
const META_RE = /<meta\b([^>]+?)>/gi
const IMG_RE = /<img\b([^>]+?)>/gi
const LINK_RE = /<link\b([^>]+?)>/gi
const ANCHOR_RE = /<a\b([^>]+?)>/gi
const PARAGRAPH_RE = /<p\b[^>]*>([\s\S]*?)<\/p>/gi

const BRAND_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'at',
  'by',
  'called',
  'co',
  'company',
  'for',
  'from',
  'house',
  'in',
  'india',
  'indian',
  'label',
  'official',
  'online',
  'org',
  'organization',
  'store',
  'the',
  'website',
  'with',
])

const SOCIAL_NETWORKS = [
  ['instagram', /(^|\.)instagram\.com$/i],
  ['facebook', /(^|\.)facebook\.com$/i],
  ['linkedin', /(^|\.)linkedin\.com$/i],
  ['youtube', /(^|\.)youtube\.com$/i],
  ['x', /(^|\.)x\.com$/i],
  ['twitter', /(^|\.)twitter\.com$/i],
  ['pinterest', /(^|\.)pinterest\.com$/i],
  ['tiktok', /(^|\.)tiktok\.com$/i],
  ['threads', /(^|\.)threads\.net$/i],
  ['whatsapp', /(^|\.)wa\.me$/i],
]

function normalizeText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim().toLowerCase()
}

function uniqueValues(values = []) {
  return [
    ...new Set(values.filter(Boolean).map((value) => String(value).trim())),
  ]
}

function dedupeBy(values = [], keyFn = (value) => value) {
  const seen = new Set()
  const out = []
  for (const value of values) {
    const key = keyFn(value)
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(value)
  }
  return out
}

function decodeHtmlEntities(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function decodeJsString(value = '') {
  return decodeHtmlEntities(
    String(value)
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
        String.fromCharCode(Number.parseInt(code, 16)),
      )
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, ' ')
      .replace(/\\t/g, ' '),
  ).trim()
}

function stripTags(value = '') {
  return decodeHtmlEntities(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  ).trim()
}

function parseAttributes(raw = '') {
  const attrs = {}
  for (const match of String(raw).matchAll(
    /([a-zA-Z_:.-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g,
  )) {
    const key = String(match[1] || '').toLowerCase()
    const value = decodeHtmlEntities(match[3] ?? match[4] ?? match[5] ?? '')
    attrs[key] = value
  }
  return attrs
}

function toUrl(value, baseUrl = null) {
  try {
    const url = baseUrl ? new URL(value, baseUrl) : new URL(value)
    if (!/^https?:$/i.test(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

function getHostname(value = '') {
  try {
    return new URL(value).hostname.replace(/^www\./i, '').toLowerCase()
  } catch {
    return ''
  }
}

function getOrigin(value = '') {
  try {
    return new URL(value).origin
  } catch {
    return ''
  }
}

function trimCandidate(value = '') {
  return String(value)
    .replace(/^[\s"'`“”‘’]+|[\s"'`“”‘’]+$/g, '')
    .replace(/[.,;:!?]+$/g, '')
    .trim()
}

function tokenizeBrandName(value = '') {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 2 && !BRAND_STOP_WORDS.has(part))
}

function toBigrams(value = '') {
  const clean = normalizeText(value).replace(/[^a-z0-9]+/g, ' ')
  if (clean.length < 2) return new Set(clean ? [clean] : [])
  const grams = new Set()
  for (let idx = 0; idx < clean.length - 1; idx++) {
    grams.add(clean.slice(idx, idx + 2))
  }
  return grams
}

function diceCoefficient(left = '', right = '') {
  const a = toBigrams(left)
  const b = toBigrams(right)
  if (!a.size || !b.size) return 0
  let overlap = 0
  for (const gram of a) {
    if (b.has(gram)) overlap++
  }
  return (2 * overlap) / (a.size + b.size)
}

function scoreSearchResult(result, brandName, domainCounts = new Map()) {
  const brandTokens = tokenizeBrandName(brandName)
  const hostname = getHostname(result.url)
  const haystack = normalizeText(
    [result.title, result.description, hostname].join(' '),
  )
  let score = 0

  for (const token of brandTokens) {
    if (haystack.includes(token)) score += token.length > 5 ? 2 : 1
  }

  score += Math.round(diceCoefficient(brandName, result.title) * 4)
  score += Math.round(diceCoefficient(brandName, hostname) * 3)
  score += Math.max(0, (domainCounts.get(hostname) || 0) - 1)

  if (
    /(official|shop|boutique|wedding|bridal|store|legacy|heritage|contact)/i.test(
      result.description,
    )
  ) {
    score += 1
  }
  if (BLACKLISTED_PRIMARY_HOST_RE.test(`${hostname}.`)) score -= 6
  if (
    /\/(posts?|reel|photo|videos?|collections?|products?)(\/|$)/i.test(
      result.url,
    )
  )
    score -= 1

  return score
}

function extractPromptUrl(prompt = '') {
  const match = String(prompt).match(/\bhttps?:\/\/[^\s)>"']+/i)
  return match ? trimCandidate(match[0]) : ''
}

export function extractOrganizationCandidate(prompt = '') {
  const input = String(prompt || '')
  const patterns = [
    /(?:brand|company|organization|org|label|boutique|store|business|website)\s+(?:called|named)\s+["“]?([^"\n]+?)["”]?(?:[.,\n]|$)/i,
    /(?:website|site|landing page|homepage)\s+for\s+["“]?([^"\n]+?)["”]?(?:[.,\n]|$)/i,
    /(?:for|about)\s+(?:the\s+)?(?:brand|company|organization|label|boutique|store)?\s*["“]?([A-Z][^"\n]{1,80})["”]?(?:[.,\n]|$)/,
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (!match) continue
    const candidate = trimCandidate(match[1] || '')
    if (candidate && candidate.length >= 3) return candidate
  }

  const quoted = input.match(/["“]([^"”]{3,80})["”]/)
  if (quoted) {
    const candidate = trimCandidate(quoted[1] || '')
    if (candidate && candidate.length >= 3) return candidate
  }

  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length === 1 && lines[0].split(/\s+/).length <= 8)
    return trimCandidate(lines[0])

  return ''
}

export function promptLooksBrandDriven(prompt = '') {
  return Boolean(
    extractPromptUrl(prompt) || extractOrganizationCandidate(prompt),
  )
}

async function fetchText(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    })

    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) return null

    return {
      url: res.url,
      html: await res.text(),
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function searchBrave(query) {
  const searchUrl = new URL(SEARCH_API_URL)
  searchUrl.searchParams.set('q', query)
  searchUrl.searchParams.set('source', 'web')

  const page = await fetchText(searchUrl.toString())
  if (!page?.html) return []

  const results = []
  for (const match of page.html.matchAll(SEARCH_RESULT_RE)) {
    const title = decodeJsString(match[1] || '')
    const url = decodeJsString(match[2] || '')
    const description = decodeJsString(match[3] || '')
    if (!title || !url) continue
    results.push({ title, url, description })
  }

  return dedupeBy(results, (result) => result.url).slice(0, MAX_SEARCH_RESULTS)
}

function selectOfficialResult(brandName, searchResults = []) {
  if (!searchResults.length) return null

  const domainCounts = new Map()
  for (const result of searchResults) {
    const hostname = getHostname(result.url)
    if (!hostname) continue
    domainCounts.set(hostname, (domainCounts.get(hostname) || 0) + 1)
  }

  const scored = searchResults
    .map((result) => ({
      ...result,
      score: scoreSearchResult(result, brandName, domainCounts),
    }))
    .sort((left, right) => right.score - left.score)

  const best = scored[0]
  return best && best.score > 1 ? best : null
}

function extractMetaMap(html = '') {
  const meta = {}
  for (const match of html.matchAll(META_RE)) {
    const attrs = parseAttributes(match[1] || '')
    const key = normalizeText(
      attrs.name || attrs.property || attrs.itemprop || '',
    )
    const value = trimCandidate(attrs.content || '')
    if (!key || !value || meta[key]) continue
    meta[key] = value
  }
  return meta
}

function safeJsonParse(text = '') {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function flattenJsonLd(value, out = []) {
  if (!value) return out
  if (Array.isArray(value)) {
    value.forEach((item) => flattenJsonLd(item, out))
    return out
  }
  if (typeof value === 'object') {
    out.push(value)
    if (Array.isArray(value['@graph'])) flattenJsonLd(value['@graph'], out)
  }
  return out
}

function extractJsonLdItems(html = '') {
  const items = []
  for (const match of html.matchAll(JSON_LD_RE)) {
    const raw = trimCandidate(match[1] || '')
    if (!raw) continue
    const parsed = safeJsonParse(raw)
    if (parsed) flattenJsonLd(parsed, items)
  }
  return items
}

function isOrganizationLike(value) {
  const types = Array.isArray(value?.['@type'])
    ? value['@type']
    : [value?.['@type']]
  return types.some((type) =>
    /organization|localbusiness|store|clothingstore|corporation|brand/i.test(
      String(type || ''),
    ),
  )
}

function formatAddress(value) {
  if (!value) return ''
  if (typeof value === 'string') return trimCandidate(value)
  const parts = [
    value.streetAddress,
    value.addressLocality,
    value.addressRegion,
    value.postalCode,
    value.addressCountry,
  ]
  return trimCandidate(parts.filter(Boolean).join(', '))
}

function extractParagraphs(html = '') {
  const paragraphs = []
  for (const match of html.matchAll(PARAGRAPH_RE)) {
    const text = stripTags(match[1] || '')
    if (text.length < 50) continue
    if (/cookie|javascript|shipping|returns?|subscribe/i.test(text)) continue
    paragraphs.push(text)
  }
  return paragraphs
}

function extractAnchors(html = '', baseUrl = '') {
  const links = []
  for (const match of html.matchAll(ANCHOR_RE)) {
    const attrs = parseAttributes(match[1] || '')
    const href = attrs.href ? toUrl(attrs.href, baseUrl) : null
    if (!href) continue
    links.push({
      href,
      text: trimCandidate(stripTags(match[1] || '')),
    })
  }
  return dedupeBy(links, (link) => link.href)
}

function extractImages(html = '', baseUrl = '') {
  const images = []
  for (const match of html.matchAll(IMG_RE)) {
    const attrs = parseAttributes(match[1] || '')
    const src = toUrl(
      attrs.src || attrs['data-src'] || attrs['data-lazy-src'] || '',
      baseUrl,
    )
    if (!src || src.startsWith('data:')) continue
    images.push({
      src,
      alt: trimCandidate(attrs.alt || ''),
      className: normalizeText(attrs.class || ''),
      id: normalizeText(attrs.id || ''),
      width: attrs.width || '',
      height: attrs.height || '',
    })
  }
  return dedupeBy(images, (image) => image.src)
}

function extractIcons(html = '', baseUrl = '') {
  const icons = []
  for (const match of html.matchAll(LINK_RE)) {
    const attrs = parseAttributes(match[1] || '')
    const rel = normalizeText(attrs.rel || '')
    if (!/icon|apple-touch-icon/.test(rel)) continue
    const href = toUrl(attrs.href || '', baseUrl)
    if (!href) continue
    icons.push(href)
  }
  return uniqueValues(icons)
}

function inferSocialNetwork(url = '') {
  const hostname = getHostname(url)
  for (const [network, pattern] of SOCIAL_NETWORKS) {
    if (pattern.test(hostname)) return network
  }
  return ''
}

function canonicalizeSocialUrl(url = '') {
  try {
    const parsed = new URL(url)
    const network = inferSocialNetwork(parsed.toString())
    const parts = parsed.pathname.split('/').filter(Boolean)
    if (!network || parts.length === 0) return parsed.toString()

    let canonicalParts = parts

    if (
      network === 'instagram' ||
      network === 'facebook' ||
      network === 'x' ||
      network === 'twitter'
    ) {
      canonicalParts = parts.slice(0, 1)
    } else if (network === 'youtube') {
      canonicalParts = parts[0]?.startsWith('@')
        ? parts.slice(0, 1)
        : parts.slice(0, 2)
    } else if (network === 'linkedin') {
      canonicalParts = parts.slice(0, 2)
    } else if (
      network === 'pinterest' ||
      network === 'threads' ||
      network === 'tiktok'
    ) {
      canonicalParts = parts.slice(0, 1)
    }

    parsed.pathname = `/${canonicalParts.join('/')}${canonicalParts.length ? '/' : ''}`
    parsed.search = ''
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return url
  }
}

function extractSocialLinks(links = []) {
  const socials = []
  for (const link of links) {
    const network = inferSocialNetwork(link.href)
    if (!network) continue
    socials.push({ network, url: canonicalizeSocialUrl(link.href) })
  }
  return dedupeBy(socials, (item) => item.url)
}

function extractEmails(text = '') {
  return uniqueValues(
    [
      ...String(text).matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi),
    ].map((match) => String(match[0]).toLowerCase()),
  )
}

function normalizePhone(value = '') {
  const digits = String(value).replace(/\D+/g, '')
  if (digits.length < 8 || digits.length > 15) return ''
  return trimCandidate(String(value).replace(/\s+/g, ' '))
}

function extractPhones(text = '') {
  const phones = []
  for (const match of String(text).matchAll(/(?:\+?\d[\d\s().-]{7,}\d)/g)) {
    const phone = normalizePhone(match[0] || '')
    if (!phone) continue
    phones.push(phone)
  }
  return uniqueValues(phones)
}

function chooseBestLogo(
  images = [],
  organizations = [],
  meta = {},
  baseUrl = '',
) {
  for (const org of organizations) {
    const logoUrl = toUrl(
      org.logo?.url || org.logo || org.image?.url || org.image || '',
      baseUrl,
    )
    if (logoUrl) return logoUrl
  }

  for (const image of images) {
    const signals = `${image.alt} ${image.className} ${image.id}`
    if (/logo|brand|wordmark|header/i.test(signals)) return image.src
  }

  const ogImage = toUrl(
    meta['og:image'] || meta['twitter:image'] || '',
    baseUrl,
  )
  if (ogImage) return ogImage

  return ''
}

function chooseBestName(
  brandName = '',
  organizations = [],
  meta = {},
  title = '',
) {
  const candidates = [
    ...organizations.map((item) => trimCandidate(item.name || '')),
    trimCandidate(meta['og:site_name'] || ''),
    trimCandidate(title.replace(/\s*[-|–|:]\s*.+$/, '')),
    trimCandidate(brandName),
  ].filter(Boolean)

  return candidates[0] || brandName
}

function chooseBestDescription(organizations = [], meta = {}, paragraphs = []) {
  const orgDescription = organizations.find(
    (item) => item.description,
  )?.description
  return (
    trimCandidate(orgDescription || '') ||
    trimCandidate(meta.description || meta['og:description'] || '') ||
    paragraphs[0] ||
    ''
  )
}

function collectPageSignals(page, brandName = '') {
  const html = page?.html || ''
  const meta = extractMetaMap(html)
  const jsonLdItems = extractJsonLdItems(html)
  const organizations = jsonLdItems.filter(isOrganizationLike)
  const images = extractImages(html, page.url)
  const links = extractAnchors(html, page.url)
  const paragraphs = extractParagraphs(html)
  const plainText = stripTags(html)
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = stripTags(titleMatch?.[1] || '')

  const jsonLdSocials = organizations.flatMap((item) => {
    const sameAs = Array.isArray(item.sameAs) ? item.sameAs : [item.sameAs]
    return sameAs
      .map((entry) => toUrl(entry || ''))
      .filter(Boolean)
      .map((url) => ({ network: inferSocialNetwork(url), url }))
      .filter((item) => item.network)
  })

  return {
    url: page.url,
    title,
    name: chooseBestName(brandName, organizations, meta, title),
    description: chooseBestDescription(organizations, meta, paragraphs),
    logoUrl: chooseBestLogo(images, organizations, meta, page.url),
    faviconUrl: extractIcons(html, page.url)[0] || '',
    emails: uniqueValues([
      ...organizations.map((item) => String(item.email || '').toLowerCase()),
      ...extractEmails(plainText),
      ...links
        .filter((item) => item.href.startsWith('mailto:'))
        .map((item) =>
          item.href
            .replace(/^mailto:/i, '')
            .trim()
            .toLowerCase(),
        ),
    ]).filter(Boolean),
    phones: uniqueValues([
      ...organizations.map((item) => normalizePhone(item.telephone || '')),
      ...extractPhones(plainText),
      ...links
        .filter((item) => item.href.startsWith('tel:'))
        .map((item) => normalizePhone(item.href.replace(/^tel:/i, ''))),
    ]).filter(Boolean),
    addresses: uniqueValues([
      ...organizations.map((item) => formatAddress(item.address)),
      ...jsonLdItems
        .map((item) =>
          item?.['@type'] === 'PostalAddress' ? formatAddress(item) : '',
        )
        .filter(Boolean),
    ]).filter(Boolean),
    socials: dedupeBy(
      [...extractSocialLinks(links), ...jsonLdSocials],
      (item) => item.url,
    ),
    relatedLinks: links
      .map((item) => item.href)
      .filter((href) => getOrigin(href) === getOrigin(page.url)),
  }
}

function collectRelevantSourceUrls(homepage, searchResults = []) {
  const candidates = []
  const homepageOrigin = getOrigin(homepage.url)
  const linkKeywords =
    /(about|story|legacy|contact|visit|store|location|reach|bridal|collections?)/i
  const fallbackPaths = [
    '/pages/about-us',
    '/pages/contact',
    '/pages/contact-us',
    '/about',
    '/contact',
  ]

  for (const href of homepage.relatedLinks || []) {
    if (candidates.length >= MAX_SOURCE_PAGES) break
    if (!linkKeywords.test(href)) continue
    candidates.push(href)
  }

  for (const result of searchResults) {
    if (candidates.length >= MAX_SOURCE_PAGES) break
    if (getOrigin(result.url) !== homepageOrigin) continue
    if (!linkKeywords.test(result.url)) continue
    candidates.push(result.url)
  }

  for (const path of fallbackPaths) {
    if (candidates.length >= MAX_SOURCE_PAGES) break
    candidates.push(`${homepageOrigin}${path}`)
  }

  return dedupeBy(candidates, (value) => value).slice(0, MAX_SOURCE_PAGES)
}

function buildBrandProfile({
  brandName,
  officialUrl,
  selectedResult,
  homepageSignals,
  pageSignals = [],
  searchResults = [],
  logo = null,
  palette = null,
  verified = false,
}) {
  const allSignals = [homepageSignals, ...pageSignals].filter(Boolean)
  const socialsFromSearch = searchResults
    .filter((result) => SOCIAL_HOST_RE.test(`${getHostname(result.url)}.`))
    .map((result) => ({
      network: inferSocialNetwork(result.url),
      url: canonicalizeSocialUrl(result.url),
    }))
    .filter((item) => item.network)

  const officialName =
    allSignals.find((item) => item.name && item.name.toLowerCase() !== 'home')
      ?.name || brandName
  const description =
    allSignals.find((item) => item.description)?.description || ''
  const logoUrl = allSignals.find((item) => item.logoUrl)?.logoUrl || ''
  const faviconUrl =
    allSignals.find((item) => item.faviconUrl)?.faviconUrl || ''
  const emails = uniqueValues(allSignals.flatMap((item) => item.emails || []))
  const phones = uniqueValues(allSignals.flatMap((item) => item.phones || []))
  const addresses = uniqueValues(
    allSignals.flatMap((item) => item.addresses || []),
  )
  const socials = dedupeBy(
    [...allSignals.flatMap((item) => item.socials || []), ...socialsFromSearch],
    (item) => item.url,
  )
  const sourceUrls = dedupeBy(
    [
      officialUrl,
      selectedResult?.url || '',
      ...allSignals.map((item) => item.url),
    ].filter(Boolean),
    (value) => value,
  )

  const confidence = Math.min(
    1,
    0.25 +
      (selectedResult ? 0.15 : 0) +
      (logoUrl ? 0.2 : 0) +
      (emails.length || phones.length || addresses.length ? 0.2 : 0) +
      (socials.length ? 0.1 : 0) +
      (description ? 0.1 : 0),
  )

  return {
    requestedName: brandName,
    officialName,
    officialUrl,
    logoUrl,
    faviconUrl,
    logo,
    palette,
    description,
    emails,
    phones,
    addresses,
    socials,
    sourceUrls,
    confidence: Number(confidence.toFixed(2)),
    verified,
    retrievedAt: new Date().toISOString(),
  }
}

export async function enrichBrandProfile(prompt, workspace, log = () => {}) {
  if (!promptLooksBrandDriven(prompt)) return null

  const explicitUrl = extractPromptUrl(prompt)
  const brandName = extractOrganizationCandidate(prompt) || explicitUrl
  if (!brandName && !explicitUrl) return null

  log(
    `  brand-profile: resolving ${explicitUrl || `"${brandName}"`} from the web`,
  )

  const brandfetch = await resolveBrandfetchBrandProfile({
    query: brandName,
    timeoutMs: 5500,
  }).catch(() => null)
  if (brandfetch?.ok && brandfetch.logo?.src) {
    const profile = buildBrandProfile({
      brandName,
      officialUrl: brandfetch.match?.officialUrl || '',
      selectedResult: null,
      homepageSignals: {
        url: brandfetch.match?.officialUrl || '',
        title: brandfetch.match?.name || '',
        name: brandfetch.match?.name || brandName,
        description: '',
        logoUrl: brandfetch.logo.src,
        faviconUrl: '',
        emails: [],
        phones: [],
        addresses: [],
        socials: [],
        relatedLinks: [],
      },
      pageSignals: [],
      searchResults: [],
      logo: brandfetch.logo,
      palette: brandfetch.palette || null,
      verified: true,
    })
    writeFile(workspace, 'brand-profile.json', JSON.stringify(profile, null, 2))
    log(
      `  brand-profile.json: ${profile.officialName || brandName} | logo=yes | contacts=${profile.emails.length + profile.phones.length + profile.addresses.length} | socials=${profile.socials.length}`,
    )
    return profile
  }

  let searchResults = []
  let selectedResult = null
  let officialUrl = explicitUrl

  if (!officialUrl) {
    searchResults = await searchBrave(brandName)
    selectedResult = selectOfficialResult(brandName, searchResults)
    officialUrl = selectedResult
      ? getOrigin(selectedResult.url) || selectedResult.url
      : ''
  }

  if (!officialUrl) {
    log('  brand-profile: no confident official site match found')
    const profile = buildFallbackBrandProfile(brandName)
    writeFile(workspace, 'brand-profile.json', JSON.stringify(profile, null, 2))
    return profile
  }

  const homepagePage = await fetchText(officialUrl)
  if (!homepagePage?.html) {
    log(`  brand-profile: failed to fetch ${officialUrl}`)
    const profile = buildFallbackBrandProfile(brandName)
    writeFile(workspace, 'brand-profile.json', JSON.stringify(profile, null, 2))
    return profile
  }

  const homepageSignals = collectPageSignals(homepagePage, brandName)
  const sourceUrls = collectRelevantSourceUrls(homepageSignals, searchResults)
  const extraPages = (
    await Promise.all(sourceUrls.map((url) => fetchText(url)))
  ).filter(Boolean)
  const extraSignals = extraPages.map((page) =>
    collectPageSignals(page, brandName),
  )

  const profile = buildBrandProfile({
    brandName,
    officialUrl: homepagePage.url,
    selectedResult,
    homepageSignals,
    pageSignals: extraSignals,
    searchResults,
    logo: profileFromSignals(homepageSignals, extraSignals, brandName),
    verified: true,
  })

  if (!profile.logoUrl) {
    const fallback = buildFallbackSvgLogo(profile.officialName || brandName)
    profile.logo = fallback
  }

  writeFile(workspace, 'brand-profile.json', JSON.stringify(profile, null, 2))
  log(
    `  brand-profile.json: ${profile.officialName || brandName} | logo=${profile.logoUrl ? 'yes' : 'no'} | contacts=${profile.emails.length + profile.phones.length + profile.addresses.length} | socials=${profile.socials.length}`,
  )

  return profile
}

function buildFallbackBrandProfile(brandName) {
  const fallback = buildFallbackSvgLogo(brandName)
  return {
    requestedName: brandName,
    officialName: brandName,
    officialUrl: '',
    logoUrl: '',
    faviconUrl: '',
    logo: fallback,
    description: '',
    emails: [],
    phones: [],
    addresses: [],
    socials: [],
    sourceUrls: [],
    confidence: 0.2,
    verified: false,
    retrievedAt: new Date().toISOString(),
  }
}

function profileFromSignals(homepageSignals, extraSignals, brandName) {
  const all = [homepageSignals, ...(extraSignals || [])].filter(Boolean)
  const logoUrl = all.find((item) => item.logoUrl)?.logoUrl || ''
  const officialName =
    all.find((item) => item.name && item.name.toLowerCase() !== 'home')?.name ||
    brandName
  if (!logoUrl) return null
  return {
    kind: 'remote',
    src: logoUrl,
    provider: 'scrape',
    confidence: 0.6,
    alt: officialName ? `${officialName} logo` : 'Company logo',
  }
}

function buildFallbackSvgLogo(name = '') {
  const safeName = String(name || '').trim() || 'Brand'
  const parts = safeName.split(/\s+/).filter(Boolean)
  const initialsRaw = parts
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
  const initials = (initialsRaw || safeName.slice(0, 2)).toUpperCase()
  const hash = Array.from(safeName).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
    7,
  )
  const hue = hash % 360
  const bg = `hsl(${hue} 78% 46%)`
  const fg = 'white'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" role="img" aria-label="${escapeXml(
    safeName,
  )} logo"><rect x="0" y="0" width="160" height="48" rx="14" fill="${bg}"/><text x="80" y="31" text-anchor="middle" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="20" font-weight="800" fill="${fg}" letter-spacing="-0.02em">${escapeXml(
    initials,
  )}</text></svg>`
  return {
    kind: 'svg',
    svg,
    provider: 'fallback',
    confidence: 0.2,
    alt: `${safeName} logo`,
    dominantColor: bg,
  }
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
