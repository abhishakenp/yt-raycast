import { createClient } from '@sanity/client'
import {
  isSanityConfigured,
  SANITY_API_VERSION,
  SANITY_DATASET,
  SANITY_PROJECT_ID,
  SANITY_READ_TOKEN,
} from '../config.js'

let _client = null

export const getSanityClient = () => {
  if (!isSanityConfigured()) return null
  if (!_client) {
    _client = createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: true,
      ...(SANITY_READ_TOKEN ? { token: SANITY_READ_TOKEN } : {}),
    })
  }
  return _client
}

export async function fetchSiteSettings() {
  const client = getSanityClient()
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
    "homeHeroImageUrl": coalesce(homeHeroImage.asset->url, homeHeroImageUrl)
  }`
  try {
    const fresh = client.withConfig({ useCdn: false })
    return await fresh.fetch(query)
  } catch {
    return null
  }
}

export async function fetchSanityImageAssets(limit = 24) {
  const client = getSanityClient()
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

export async function fetchPosts() {
  const client = getSanityClient()
  if (!client) return []
  const query = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    "slug": slug.current,
    title,
    publishedAt,
    excerpt,
    "authorName": author->name,
    "categories": categories[]->title
  }`
  try {
    const rows = await client.fetch(query)
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

export async function fetchPostBySlug(slug) {
  const client = getSanityClient()
  if (!client || !slug) return null
  const query = `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    excerpt,
    body,
    "authorName": author->name,
    "categories": categories[]->title
  }`
  try {
    return await client.fetch(query, { slug })
  } catch {
    return null
  }
}
