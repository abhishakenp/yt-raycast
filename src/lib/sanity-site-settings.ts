import { createClient, type SanityClient } from "@sanity/client"
import { cache } from "react"
import { SITE_URL } from "./site-config"

export type SiteSettings = {
  homeTitle?: string | null
  homeDescription?: string | null
  pricingPageTitle?: string | null
  pricingPageDescription?: string | null
  pricingHeroHeadline?: string | null
  ogImageUrl?: string | null
  homeHeroImageUrl?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
} | null

let _client: SanityClient | null = null

const sanityReadClient = (): SanityClient | null => {
  const projectId = (process.env.SANITY_PROJECT_ID ?? "").trim()
  const dataset = (process.env.SANITY_DATASET ?? "production").trim()
  if (!projectId || !dataset) return null
  if (!_client) {
    _client = createClient({
      projectId,
      dataset,
      apiVersion: process.env.SANITY_API_VERSION ?? "2024-01-01",
      useCdn: true,
      ...(process.env.SANITY_READ_TOKEN ? { token: process.env.SANITY_READ_TOKEN } : {}),
    })
  }
  return _client
}

const fetchSiteSettingsInner = async (): Promise<SiteSettings> => {
  const client = sanityReadClient()
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

export const fetchSiteSettings = cache(fetchSiteSettingsInner)

export const resolveSiteImageUrl = (raw: string | null | undefined) => {
  const t = String(raw ?? "").trim()
  if (!t) return ""
  if (/^https?:\/\//i.test(t)) return t
  return `${SITE_URL.replace(/\/+$/, "")}/${t.replace(/^\/+/, "")}`
}
