import { VALID_SITE_TYPES } from '../config'
import {
  loadContentPlanRef,
  readContentPlanRefFromWorkspace,
} from './content-refs'
import {
  DESIGN_REF_ENTRIES,
  GLOBAL_DEFAULT_REF_ID,
  sortEntriesByPriority,
} from './design-refs/registry'

interface DesignRefEntry {
  id: string
  file: string
  contentPlanFile?: string
  siteTypes?: string[]
  keywordPatterns?: RegExp[]
  priority?: number
}

interface ContentPlanRef {
  name: string
  content: string
}

interface ResolveResult {
  refId: string
  stashName: string
  contentPlanRef: ContentPlanRef | null
  reason: string
}

function contentPlanFileForEntry(entry: DesignRefEntry): string {
  return entry.contentPlanFile || entry.file
}

function mergePlanContent(
  _entry: DesignRefEntry,
  siteType: string,
  primaryLoaded: ContentPlanRef | null,
): ContentPlanRef | null {
  if (!primaryLoaded?.content) return primaryLoaded
  const st = VALID_SITE_TYPES.includes(siteType) ? siteType : 'landing'
  const baseEntry = DESIGN_REF_ENTRIES.find((e) => e.id === `${st}-base`)
  if (!baseEntry) return primaryLoaded
  const baseName = contentPlanFileForEntry(baseEntry)
  if (baseName === primaryLoaded.name) return primaryLoaded
  const baseLoaded = loadContentPlanRef(baseName)
  if (!baseLoaded?.content) return primaryLoaded
  return {
    name: `${baseName}+${primaryLoaded.name}`,
    content: `${baseLoaded.content}\n\n--- Overlay (${primaryLoaded.name}) ---\n\n${primaryLoaded.content}`,
  }
}

function buildResult(
  entry: DesignRefEntry,
  contentPlanRef: ContentPlanRef | null,
  reason: string,
  siteType: string | null = null,
  merge = false,
): ResolveResult {
  const merged =
    merge && siteType && contentPlanRef
      ? mergePlanContent(entry, siteType, contentPlanRef)
      : contentPlanRef
  return {
    refId: entry.id,
    stashName: contentPlanFileForEntry(entry),
    contentPlanRef: merged,
    reason,
  }
}

function findMetaByStashName(name: string): DesignRefEntry | undefined {
  return DESIGN_REF_ENTRIES.find(
    (e) =>
      contentPlanFileForEntry(e) === name || e.file === name || e.id === name,
  )
}

export function resolveContentPlanRef({
  prompt = '',
  siteType = 'landing',
  businessProfile = null,
  workspace = null,
  respectWorkspaceOverride = false,
}: {
  prompt?: string
  siteType?: string
  businessProfile?: { industry?: string } | null
  workspace?: string | null
  respectWorkspaceOverride?: boolean
} = {}): ResolveResult {
  const st = VALID_SITE_TYPES.includes(siteType) ? siteType : 'landing'
  const haystack = `${String(prompt).toLowerCase()} ${String(businessProfile?.industry || '').toLowerCase()}`

  if (respectWorkspaceOverride && workspace) {
    const override = readContentPlanRefFromWorkspace(workspace)
    if (override?.name) {
      const loaded = loadContentPlanRef(override.name)
      if (loaded?.content) {
        const meta = findMetaByStashName(override.name)
        if (meta) return buildResult(meta, loaded, 'workspace', st, false)
        return {
          refId: override.name,
          stashName: loaded.name,
          contentPlanRef: loaded,
          reason: 'workspace',
        }
      }
    }
  }

  const specialized = sortEntriesByPriority(DESIGN_REF_ENTRIES).filter(
    (e) => e.keywordPatterns?.length && e.siteTypes?.includes(st),
  )
  for (const entry of specialized) {
    const hit = entry.keywordPatterns.some((p) => p.test(haystack))
    if (hit) {
      const planName = contentPlanFileForEntry(entry)
      const loaded = loadContentPlanRef(planName)
      if (loaded?.content)
        return buildResult(entry, loaded, 'keyword', st, true)
    }
  }

  const baseId = `${st}-base`
  const baseEntry = DESIGN_REF_ENTRIES.find((e) => e.id === baseId)
  if (baseEntry) {
    const loaded = loadContentPlanRef(contentPlanFileForEntry(baseEntry))
    if (loaded?.content)
      return buildResult(baseEntry, loaded, 'site-base', st, false)
  }

  const fb = DESIGN_REF_ENTRIES.find((e) => e.id === GLOBAL_DEFAULT_REF_ID)
  const fallbackEntry = fb || baseEntry
  if (fallbackEntry) {
    const loaded = loadContentPlanRef(contentPlanFileForEntry(fallbackEntry))
    if (loaded?.content)
      return buildResult(fallbackEntry, loaded, 'fallback', st, false)
  }

  const last = loadContentPlanRef('landing-base')
  return {
    refId: GLOBAL_DEFAULT_REF_ID,
    stashName: 'landing-base',
    contentPlanRef: last,
    reason: 'empty',
  }
}
