import { createSanityReadClient, createSanityWriteClient } from './client.js'

const SITE_SETTINGS_STRING_KEYS = [
  'homeTitle',
  'homeDescription',
  'pricingPageTitle',
  'pricingPageDescription',
  'pricingHeroHeadline',
  'shipChatHeadline',
  'shipChatSubheadline',
  'ogImageUrl',
  'homeHeroImageUrl',
]

const buildSanityImageField = (assetRef, alt) => {
  const ref = String(assetRef ?? '').trim()
  if (!ref) return null
  const o = {
    _type: 'image',
    asset: { _type: 'reference', _ref: ref },
  }
  const a = String(alt ?? '').trim()
  if (a) o.alt = a
  return o
}

export function pickSiteSettingsPatch(body) {
  if (!body || typeof body !== 'object') return {}
  const out = {}
  for (const k of SITE_SETTINGS_STRING_KEYS) {
    if (body[k] === undefined) continue
    const v = body[k]
    out[k] = typeof v === 'string' ? v : String(v ?? '')
  }
  return out
}

const getReadClient = (sanityConfig) =>
  sanityConfig ? createSanityReadClient(sanityConfig) : createSanityReadClient()

const getWriteClient = (sanityConfig) =>
  sanityConfig ? createSanityWriteClient(sanityConfig) : createSanityWriteClient()

const fetchSiteSettingsWithClient = async (client) => {
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

const URL_FIELD_KEYS = new Set(['ogImageUrl', 'homeHeroImageUrl'])

function splitStringPatch(patch) {
  const setFields = {}
  const unsetFields = []
  for (const [k, v] of Object.entries(patch)) {
    if (URL_FIELD_KEYS.has(k)) {
      const t = typeof v === 'string' ? v.trim() : ''
      if (!t) unsetFields.push(k)
      else setFields[k] = t
    } else {
      setFields[k] = v
    }
  }
  return { setFields, unsetFields }
}

export async function patchSiteSettings(body, sanityConfig) {
  const client = getWriteClient(sanityConfig)
  if (!client) return { ok: false, error: 'Sanity write not configured' }
  const stringPatch = pickSiteSettingsPatch(body)
  const touchOg = body && 'ogImageAssetId' in body
  const touchHero = body && 'homeHeroImageAssetId' in body
  const ogAsset = touchOg ? String(body.ogImageAssetId ?? '').trim() : null
  const heroAsset = touchHero ? String(body.homeHeroImageAssetId ?? '').trim() : null

  if (!Object.keys(stringPatch).length && !touchOg && !touchHero) {
    return { ok: false, error: 'No valid fields' }
  }

  const { setFields, unsetFields: uf } = splitStringPatch(stringPatch)
  let unsetFields = uf

  if (touchOg) {
    if (ogAsset) {
      const img = buildSanityImageField(ogAsset, body?.ogImageAlt)
      if (img) {
        setFields.ogImage = img
        delete setFields.ogImageUrl
        unsetFields.push('ogImageUrl')
      }
    } else {
      unsetFields.push('ogImage')
    }
  }

  if (touchHero) {
    if (heroAsset) {
      const img = buildSanityImageField(heroAsset, body?.homeHeroImageAlt)
      if (img) {
        setFields.homeHeroImage = img
        delete setFields.homeHeroImageUrl
        unsetFields.push('homeHeroImageUrl')
      }
    } else {
      unsetFields.push('homeHeroImage')
    }
  }

  unsetFields = [...new Set(unsetFields)]

  if (!Object.keys(setFields).length && !unsetFields.length) {
    return { ok: false, error: 'No valid fields' }
  }

  try {
    const existing = await client.fetch(
      `*[_type == "siteSettings"] | order(_updatedAt desc) [0]{ _id }`,
    )
    const id = existing?._id
    if (!id) {
      if (!Object.keys(setFields).length) return { ok: false, error: 'No valid fields' }
      await client.create({ _type: 'siteSettings', ...setFields })
    } else {
      let builder = client.patch(id)
      if (Object.keys(setFields).length) builder = builder.set(setFields)
      if (unsetFields.length) builder = builder.unset(unsetFields)
      await builder.commit()
    }
    const siteSettings = await fetchSiteSettingsWithClient(getReadClient(sanityConfig))
    return { ok: true, siteSettings }
  } catch (e) {
    return { ok: false, error: e?.message ? String(e.message) : 'Patch failed' }
  }
}

const findHomeHero = (siteSpec) => {
  const pages = siteSpec?.pages
  if (!Array.isArray(pages)) return { headline: '', subheadline: '', description: '' }
  const home = pages.find((p) => p.route === '/' || p.route === '') || pages[0] || null
  if (!home) return { headline: '', subheadline: '', description: '' }
  const seo = home.seo || {}
  const sections = home.sections || []
  const hero = sections.find((s) => s.type === 'hero')
  return {
    headline: hero?.headline || seo.title || siteSpec.projectName || '',
    subheadline: hero?.subheadline || hero?.body || '',
    description: seo.description || '',
  }
}

export function mergeSanitySiteSettingsIntoSiteSpec(siteSpec, siteSettings) {
  if (!siteSpec || !siteSettings) return siteSpec
  const spec = structuredClone(siteSpec)
  const pages = spec.pages
  if (!Array.isArray(pages)) return spec

  const seoTitle = String(siteSettings.homeTitle ?? siteSettings.seoTitle ?? '').trim()
  const seoDesc = String(siteSettings.homeDescription ?? siteSettings.seoDescription ?? '').trim()
  const heroHeadline = String(siteSettings.shipChatHeadline ?? '').trim() || seoTitle
  const heroSub = String(siteSettings.shipChatSubheadline ?? '').trim() || seoDesc
  const home = pages.find((p) => p.route === '/' || p.route === '') || pages[0]
  if (home && (seoTitle || seoDesc || heroHeadline || heroSub)) {
    home.seo = { ...(home.seo || {}) }
    if (seoTitle) home.seo.title = seoTitle
    else if (heroHeadline) home.seo.title = heroHeadline
    if (seoDesc) home.seo.description = seoDesc
    else if (heroSub) home.seo.description = heroSub
    const sections = home.sections || (home.sections = [])
    const hi = sections.findIndex((s) => s.type === 'hero')
    if (hi >= 0) {
      if (heroHeadline) sections[hi].headline = heroHeadline
      if (heroSub) {
        sections[hi].subheadline = heroSub
        sections[hi].body = heroSub
      }
    }
  }

  const pricingPage = pages.find((p) => p.route === '/pricing' || p.route === '/pricing/')
  if (pricingPage) {
    const pt = String(siteSettings.pricingPageTitle ?? '').trim()
    const pd = String(siteSettings.pricingPageDescription ?? '').trim()
    const ph = String(siteSettings.pricingHeroHeadline ?? '').trim()
    if (pt || pd || ph) {
      pricingPage.seo = { ...(pricingPage.seo || {}) }
      if (pt) pricingPage.seo.title = pt
      if (pd) pricingPage.seo.description = pd
      const psections = pricingPage.sections || (pricingPage.sections = [])
      const phi = psections.findIndex((s) => s.type === 'hero')
      if (phi >= 0 && ph) psections[phi].headline = ph
    }
  }

  return spec
}

export async function syncSiteSettingsToSanity(siteSpec, sanityConfig) {
  const client = getWriteClient(sanityConfig)
  if (!client || !siteSpec) return
  const { headline, subheadline, description } = findHomeHero(siteSpec)
  const syncedAt = new Date().toISOString()
  const projectTitle = String(siteSpec?.projectName ?? '').trim() || headline || ''
  const patch = {
    shipChatHeadline: headline || '',
    shipChatSubheadline: subheadline || '',
    shipChatSyncedAt: syncedAt,
    homeTitle: projectTitle,
    homeDescription: description || '',
  }
  try {
    const existing = await client.fetch(
      `*[_type == "siteSettings"] | order(_updatedAt desc) [0]{ _id }`,
    )
    const id = existing?._id
    if (!id) {
      await client.create({
        _type: 'siteSettings',
        ...patch,
      })
      return
    }
    await client.patch(id).set(patch).commit()
  } catch {
    void 0
  }
}

export const applySiteSettingsPatch = patchSiteSettings
export const syncSiteSettingsFromSiteSpec = syncSiteSettingsToSanity
export async function mergeFromSanity(siteSpec, sanityConfig) {
  if (!sanityConfig) return mergeSanitySiteSettingsIntoSiteSpec(siteSpec, null)
  const siteSettings = await fetchSiteSettingsWithClient(getReadClient(sanityConfig))
  return mergeSanitySiteSettingsIntoSiteSpec(siteSpec, siteSettings)
}
