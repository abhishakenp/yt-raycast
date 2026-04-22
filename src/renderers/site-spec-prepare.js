import { htmlDocumentPassesPreviewQuality } from '../pipeline/homepage-substance.js'
import { buildFallbackSiteSpec } from '../spec/defaults.js'
import { applyGeneratedSitePseoGuardrails } from './pseo-guardrails.js'
import { pageUsesExactClone } from './shared.js'

function countNonChromeSections(sections) {
  return (sections || []).filter((s) => s && !['navbar', 'footer'].includes(s.type)).length
}

function mergeMinimalHomeBodyFromFallback(siteSpec) {
  const home = siteSpec.pages?.find((p) => p.route === '/') || siteSpec.pages?.[0]
  if (!home || countNonChromeSections(home.sections) >= 2) return
  const pageNames = (siteSpec.pages || []).map((p) => p.name).filter(Boolean)
  const fb = buildFallbackSiteSpec({
    prompt: siteSpec.userPrompt || siteSpec.projectName || 'Generated',
    ctx: {
      project_name: siteSpec.projectName,
      site_type: siteSpec.siteType,
      pages: pageNames.length ? pageNames : undefined,
      tagline: siteSpec.seo?.description || '',
      features: siteSpec.backendFeatureHints || [],
    },
    siteType: siteSpec.siteType,
  })
  const fbHome = fb.pages?.[0]
  if (!fbHome?.sections?.length) return
  const existing = home.sections || []
  const nav = existing.find((s) => s.type === 'navbar') || fbHome.sections.find((s) => s.type === 'navbar')
  const foot = existing.find((s) => s.type === 'footer') || fbHome.sections.find((s) => s.type === 'footer')
  const core = fbHome.sections.filter((s) => s.type !== 'navbar' && s.type !== 'footer')
  home.sections = [nav, ...core, foot].filter(Boolean)
}

function repairEmptyHeroSections(siteSpec) {
  const fallbackTitle = siteSpec.projectName || siteSpec.seo?.title || 'Welcome'
  const fallbackBody = String(siteSpec.seo?.description || '').trim().slice(0, 280)
  for (const page of siteSpec.pages || []) {
    for (const sec of page.sections || []) {
      if (sec.type !== 'hero') continue
      const h = String(sec.headline || '').trim()
      const b = String(sec.body || '').trim()
      if (!h && !b) {
        sec.headline = fallbackTitle
        if (fallbackBody) sec.body = fallbackBody
      }
    }
  }
}

function stripUnstableExactClones(siteSpec) {
  for (const page of siteSpec.pages || []) {
    if (!pageUsesExactClone(page)) continue
    if (page.renderBlueprint?.exactClone === true) continue
    const rb = page.renderBlueprint
    const doc =
      (rb?.originalHtmlDocument && String(rb.originalHtmlDocument)) ||
      (rb?.bodyHtml ? `<!doctype html><html><body>${rb.bodyHtml}</body></html>` : '')
    if (!htmlDocumentPassesPreviewQuality(doc, siteSpec)) page.renderBlueprint = null
  }
}

export function prepareSiteSpecForReliableRender(siteSpec) {
  if (!siteSpec?.pages?.length) return siteSpec
  applyGeneratedSitePseoGuardrails(siteSpec)
  stripUnstableExactClones(siteSpec)
  mergeMinimalHomeBodyFromFallback(siteSpec)
  repairEmptyHeroSections(siteSpec)
  return siteSpec
}
