import { VALID_SITE_TYPES } from '../config.js'
import { loadDesignRef, readDesignRefFromWorkspace } from './design-refs.js'
import {
  DESIGN_REF_ENTRIES,
  GLOBAL_DEFAULT_REF_ID,
  sortEntriesByPriority,
} from './design-refs/registry.js'
import { getArchetypePresetAppendix } from './archetype-presets.js'

function buildResult(entry, designRef, reason) {
  const presetKey = entry.defaultPreset || 'marketingDark'
  return {
    refId: entry.id,
    stashName: entry.file,
    designRef,
    presetKey,
    presetAppendix: getArchetypePresetAppendix(presetKey),
    injectAuroraLiquid: Boolean(entry.injectAuroraLiquid),
    reason,
  }
}

function findMetaByStashName(name) {
  return DESIGN_REF_ENTRIES.find((e) => e.file === name || e.id === name)
}

export function resolveDesignRef({
  prompt = '',
  siteType = 'landing',
  businessProfile = null,
  workspace = null,
  respectWorkspaceOverride = false,
} = {}) {
  const haystack = `${String(prompt).toLowerCase()} ${String(businessProfile?.industry || '').toLowerCase()}`

  if (respectWorkspaceOverride && workspace) {
    const override = readDesignRefFromWorkspace(workspace)
    if (override?.name) {
      const loaded = loadDesignRef(override.name)
      if (loaded?.content) {
        const meta = findMetaByStashName(override.name)
        if (meta) return buildResult(meta, loaded, 'workspace')
        return {
          refId: override.name,
          stashName: loaded.name,
          designRef: loaded,
          presetKey: 'marketingDark',
          presetAppendix: getArchetypePresetAppendix('marketingDark'),
          injectAuroraLiquid: loaded.name === 'aurora',
          reason: 'workspace',
        }
      }
    }
  }

  const st = VALID_SITE_TYPES.includes(siteType) ? siteType : 'landing'

  const specialized = sortEntriesByPriority(DESIGN_REF_ENTRIES).filter(
    (e) => e.keywordPatterns?.length && e.siteTypes?.includes(st),
  )
  for (const entry of specialized) {
    const hit = entry.keywordPatterns.some((p) => p.test(haystack))
    if (hit) {
      const loaded = loadDesignRef(entry.file)
      if (loaded?.content) return buildResult(entry, loaded, 'keyword')
    }
  }

  const baseId = `${st}-base`
  const baseEntry = DESIGN_REF_ENTRIES.find((e) => e.id === baseId)
  if (baseEntry) {
    const loaded = loadDesignRef(baseEntry.file)
    if (loaded?.content) return buildResult(baseEntry, loaded, 'site-base')
  }

  const fb = DESIGN_REF_ENTRIES.find((e) => e.id === GLOBAL_DEFAULT_REF_ID)
  const fallbackEntry = fb || baseEntry
  if (fallbackEntry) {
    const loaded = loadDesignRef(fallbackEntry.file)
    if (loaded?.content) return buildResult(fallbackEntry, loaded, 'fallback')
  }

  const last = loadDesignRef('landing-base')
  return {
    refId: GLOBAL_DEFAULT_REF_ID,
    stashName: 'landing-base',
    designRef: last,
    presetKey: 'marketingDark',
    presetAppendix: getArchetypePresetAppendix('marketingDark'),
    injectAuroraLiquid: false,
    reason: 'empty',
  }
}
