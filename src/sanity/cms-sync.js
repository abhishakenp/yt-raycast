import { getSanityWriteClient } from './chat-sync.js'

const findHomeHero = (siteSpec) => {
  const pages = siteSpec?.pages
  if (!Array.isArray(pages)) return { headline: '', subheadline: '', description: '' }
  const home =
    pages.find((p) => p.route === '/' || p.route === '') || pages[0] || null
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

export async function syncSiteSettingsFromSiteSpec(siteSpec) {
  const client = getSanityWriteClient()
  if (!client || !siteSpec) return
  const { headline, subheadline, description } = findHomeHero(siteSpec)
  const syncedAt = new Date().toISOString()
  const patch = {
    shipChatHeadline: headline || '',
    shipChatSubheadline: subheadline || '',
    shipChatSyncedAt: syncedAt,
  }
  if (headline || siteSpec.projectName) patch.homeTitle = headline || siteSpec.projectName
  if (description) patch.homeDescription = description
  try {
    const existing = await client.fetch(`*[_type == "siteSettings"] | order(_updatedAt desc) [0]{ _id }`)
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
