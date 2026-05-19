import { createClient } from '@sanity/client'
import {
  isSanityConfigured,
  SANITY_API_VERSION,
  SANITY_DATASET,
  SANITY_PROJECT_ID,
  SANITY_READ_TOKEN,
  SANITY_WRITE_TOKEN,
} from '../config.js'

let _client = null

const resolveClientConfig = (config = {}, tokenFallback = '', preferKey = '') => {
  const projectId = String(config.projectId ?? SANITY_PROJECT_ID ?? '').trim()
  const dataset = String(config.dataset ?? SANITY_DATASET ?? '').trim()
  const apiVersion =
    String(config.apiVersion ?? SANITY_API_VERSION ?? '').trim() || SANITY_API_VERSION
  const preferredTenantToken = preferKey ? config[preferKey] : ''
  const token = String(preferredTenantToken ?? config.token ?? tokenFallback ?? '').trim()
  if (!projectId || !dataset) return null
  return {
    projectId,
    dataset,
    apiVersion,
    ...(token ? { token } : {}),
  }
}

const hasOverrideConfig = (config) =>
  Boolean(
    config &&
    (config.projectId ||
      config.dataset ||
      config.token ||
      config.readToken ||
      config.writeToken ||
      config.apiVersion),
  )

export const createSanityReadClient = (config = {}) => {
  if (!hasOverrideConfig(config) && !isSanityConfigured()) return null
  const resolved = resolveClientConfig(config, SANITY_READ_TOKEN, 'readToken')
  if (!resolved) return null
  return createClient({
    ...resolved,
    useCdn: true,
  })
}

export const createSanityWriteClient = (config = {}) => {
  if (!hasOverrideConfig(config) && !isSanityConfigured()) return null
  const resolved = resolveClientConfig(config, SANITY_WRITE_TOKEN, 'writeToken')
  if (!resolved) return null
  return createClient({
    ...resolved,
    useCdn: false,
  })
}

export const getSanityClient = () => {
  if (!isSanityConfigured()) return null
  if (!_client) {
    _client = createSanityReadClient()
  }
  return _client
}

export async function fetchSiteSettings(sanityConfig) {
  const client = sanityConfig ? createSanityReadClient(sanityConfig) : getSanityClient()
  if (!client) return null
  const query = `*[_type == "siteSettings"][0]{
    homeTitle,
    homeDescription,
    pricingPageTitle,
    pricingPageDescription,
    pricingHeroHeadline,
    shipChatHeadline,
    shipChatSubheadline,
    shipChatSyncedAt,
    "ogImageAssetId": ogImage.asset._ref,
    "ogImageAlt": ogImage.alt,
    "homeHeroImageAssetId": homeHeroImage.asset._ref,
    "homeHeroImageAlt": homeHeroImage.alt,
    "ogImageUrl": coalesce(ogImage.asset->url, ogImageUrl),
    "homeHeroImageUrl": coalesce(homeHeroImage.asset->url, homeHeroImageUrl),
    "seoTitle": seo.metaTitle,
    "seoDescription": seo.metaDescription
  }`
  try {
    const fresh = client.withConfig({ useCdn: false })
    return await fresh.fetch(query)
  } catch {
    return null
  }
}

export async function fetchSanityImageAssets(limit = 24, sanityConfig) {
  const client = sanityConfig ? createSanityReadClient(sanityConfig) : getSanityClient()
  if (!client) return []
  const n = Math.min(60, Math.max(1, Number(limit) || 24))
  const query = `*[_type == "sanity.imageAsset"] | order(_createdAt desc) [0...${n}] { _id, url }`
  try {
    const fresh = client.withConfig({ useCdn: false })
    const rows = await fresh.fetch(query)
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

export async function fetchPosts(sanityConfig) {
  const client = sanityConfig ? createSanityReadClient(sanityConfig) : getSanityClient()
  if (!client) return []
  const query = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    "slug": slug.current,
    title,
    publishedAt,
    excerpt,
    "authorName": author->name,
    "categories": categories[]->title,
    "seoTitle": seo.metaTitle,
    "seoDescription": seo.metaDescription
  }`
  try {
    const rows = await client.fetch(query)
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

export async function fetchPostBySlug(slug, sanityConfig) {
  const client = sanityConfig ? createSanityReadClient(sanityConfig) : getSanityClient()
  if (!client || !slug) return null
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    excerpt,
    body,
    "authorName": author->name,
    "categories": categories[]->title,
    seo {
      metaTitle,
      metaDescription,
      nofollowAttributes,
      seoKeywords,
      openGraph {
        title,
        description,
        url
      }
    }
  }`
  try {
    return await client.fetch(query, { slug })
  } catch {
    return null
  }
}

export async function fetchOfficialNotices(options = {}, sanityConfig) {
  const client = sanityConfig ? createSanityReadClient(sanityConfig) : getSanityClient()
  if (!client) return []
  const noticeKind = String(options.noticeKind || '').trim()
  const limit = Math.min(200, Math.max(1, Number(options.limit) || 100))
  const params = {}
  let filter = `_type == "officialNotice" && defined(slug.current)`
  if (noticeKind) {
    filter += ' && noticeKind == $noticeKind'
    params.noticeKind = noticeKind
  }
  const query = `*[${filter}] | order(coalesce(publishedAt, _createdAt) desc) [0...${limit}] {
    "slug": slug.current,
    noticeKind,
    title { en, hi, ta, te, kn, ml, bn, mr, gu },
    summary { en, hi, ta, te, kn, ml, bn, mr, gu },
    publishedAt,
    validUntil,
    "attachmentUrl": attachment.asset->url,
    "attachmentFilename": attachment.asset->originalFilename,
    "categoryTitle": documentCategory->title { en, hi, ta, te, kn, ml, bn, mr, gu },
    body,
    seo { metaTitle, metaDescription }
  }`
  try {
    const rows = await client.fetch(query, params)
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

export async function fetchOfficialNoticeBySlug(slug, sanityConfig) {
  const client = sanityConfig ? createSanityReadClient(sanityConfig) : getSanityClient()
  if (!client || !slug) return null
  const query = `*[_type == "officialNotice" && slug.current == $slug][0]{
    noticeKind,
    title { en, hi, ta, te, kn, ml, bn, mr, gu },
    summary { en, hi, ta, te, kn, ml, bn, mr, gu },
    publishedAt,
    validUntil,
    body,
    "attachmentUrl": attachment.asset->url,
    "attachmentFilename": attachment.asset->originalFilename,
    "categoryTitle": documentCategory->title { en, hi, ta, te, kn, ml, bn, mr, gu },
    seo { metaTitle, metaDescription }
  }`
  try {
    return await client.fetch(query, { slug })
  } catch {
    return null
  }
}

export async function fetchJobOpenings(options = {}, sanityConfig) {
  const client = sanityConfig ? createSanityReadClient(sanityConfig) : getSanityClient()
  if (!client) return []
  const openOnly = options.openOnly !== false
  const limit = Math.min(200, Math.max(1, Number(options.limit) || 100))
  let filter = `_type == "jobOpening"`
  if (openOnly) filter += ' && status == "open"'
  const query = `*[${filter}] | order(coalesce(postedAt, _createdAt) desc) [0...${limit}] {
    title { en, hi, ta, te, kn, ml, bn, mr, gu },
    department { en, hi, ta, te, kn, ml, bn, mr, gu },
    location { en, hi, ta, te, kn, ml, bn, mr, gu },
    description { en, hi, ta, te, kn, ml, bn, mr, gu },
    postedAt,
    closingAt,
    applyUrl,
    applyEmail,
    status
  }`
  try {
    const rows = await client.fetch(query)
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}
