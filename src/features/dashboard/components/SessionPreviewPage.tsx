import { useQuery } from 'convex/react'
import { useMemo } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { useClonePageNav } from '@/features/clone/hooks/useClonePageNav'
import { useEditController } from '@/features/editing/hooks/useEditController'
import { resolveThemeStyles } from '@/genui/theme-apply'
import { SessionGeneratedPreview } from '@/features/dashboard/components/SessionGeneratedPreview'

type BrandLogoSelection = {
  name: string
  domain: string | null
  brandId: string | null
  icon: string | null
  logo: string | null
}

type SessionPreviewGenerationView = {
  homeModule?: {
    source: string
    status: string
    updatedAt: number
  }
  latestPreview?: {
    html?: string
    siteSpecJson?: string
    version?: number
  }
  session: {
    sessionId: Id<'sessions'>
    status: string
    previewVersion?: number
    prompt: string
    preferredLanguage?: string
    themeOverride?: string | null
    themeMode?: 'light' | 'dark' | null
    selectedBrandLogo?: BrandLogoSelection | null
  }
  siteSpec?: {
    specJson?: string
  }
}

const editAppliesToLocale = (edit: object, locale: string): boolean => {
  const normalizedLocale = locale.trim().toLowerCase()
  return (
    !('locale' in edit) ||
    typeof edit.locale !== 'string' ||
    edit.locale.trim().toLowerCase() === normalizedLocale
  )
}

const readSiteThemeName = (specJson: string | undefined): string | null => {
  if (!specJson) return null
  try {
    const parsed = JSON.parse(specJson) as {
      theme?: unknown
      themeName?: unknown
      genuiTheme?: unknown
    }
    const theme = parsed.themeName ?? parsed.genuiTheme ?? parsed.theme
    return typeof theme === 'string' ? theme : null
  } catch {
    return null
  }
}

export const SessionPreviewPage = ({ sessionId }: { sessionId: string }) => {
  const generationView = useQuery(api.sessions.getGenerationView, {
    lookup: sessionId,
  }) as SessionPreviewGenerationView | null | undefined
  const resolvedSessionId = generationView?.session.sessionId
  const activeSessionId = resolvedSessionId ?? sessionId
  const clonePageNav = useClonePageNav(activeSessionId)
  const editController = useEditController(activeSessionId)
  const homeModule = generationView?.homeModule
  const hasRenderableClonePage = Boolean(
    clonePageNav.currentHtml || clonePageNav.currentUrl,
  )
  const hasRenderableHomeSource =
    (typeof homeModule?.source === 'string' &&
      homeModule.source.trim().length > 0) ||
    hasRenderableClonePage
  const isPreviewReady =
    generationView?.session.status === 'preview_ready' &&
    hasRenderableHomeSource
  const isPreviewRenderable =
    hasRenderableHomeSource &&
    (isPreviewReady || homeModule?.status === 'running')
  const activePreviewLocale =
    generationView?.session.preferredLanguage?.trim().toLowerCase() || 'en'
  const cloneHomePage =
    clonePageNav.pages.find((page) => page.isHome) ?? clonePageNav.pages[0]
  const activePreviewPage = clonePageNav.isClone
    ? clonePageNav.currentPath || cloneHomePage?.pathname || '/'
    : '/'
  const shouldApplyPersistedHomeEdits =
    !clonePageNav.isClone || activePreviewPage === cloneHomePage?.pathname

  const imageOverrides = useMemo(() => {
    const map: Record<string, string> = {}
    if (!shouldApplyPersistedHomeEdits) return map
    for (const edit of editController.edits ?? []) {
      if (
        edit.editType === 'image' &&
        typeof edit.beforeText === 'string' &&
        typeof edit.afterText === 'string' &&
        !(edit.beforeText in map)
      ) {
        map[edit.beforeText] = edit.afterText
      }
    }
    return map
  }, [editController.edits, shouldApplyPersistedHomeEdits])

  const styleOverrides = useMemo(() => {
    const seen = new Set<string>()
    const overrides: Array<{
      classAnchor: string
      occurrenceIndex: number
      style: string
    }> = []
    if (!shouldApplyPersistedHomeEdits) return overrides
    for (const edit of editController.edits ?? []) {
      if (
        edit.editType === 'style' &&
        typeof edit.beforeText === 'string' &&
        typeof edit.afterText === 'string'
      ) {
        const occurrenceIndex = edit.occurrenceIndex ?? 0
        const key = `${edit.beforeText}#${occurrenceIndex}`
        if (seen.has(key)) continue
        seen.add(key)
        overrides.push({
          classAnchor: edit.beforeText,
          occurrenceIndex,
          style: edit.afterText,
        })
      }
    }
    return overrides
  }, [editController.edits, shouldApplyPersistedHomeEdits])

  const textOverrides = useMemo(() => {
    const overrides: Array<{
      beforeText: string
      afterText: string
      occurrenceIndex?: number
    }> = []
    if (!shouldApplyPersistedHomeEdits) return overrides
    for (const edit of editController.edits ?? []) {
      if (
        edit.editType === 'text' &&
        typeof edit.beforeText === 'string' &&
        typeof edit.afterText === 'string' &&
        editAppliesToLocale(edit, activePreviewLocale)
      ) {
        overrides.push({
          beforeText: edit.beforeText,
          afterText: edit.afterText,
          occurrenceIndex: edit.occurrenceIndex,
        })
      }
    }
    return overrides
  }, [activePreviewLocale, editController.edits, shouldApplyPersistedHomeEdits])

  if (!generationView || !isPreviewRenderable) {
    return <main className="fixed inset-0 bg-background" />
  }

  const renderedPreviewSource =
    clonePageNav.isClone && clonePageNav.currentHtml
      ? clonePageNav.currentHtml
      : (homeModule?.source ?? '')
  const renderedPreviewRevision = `${homeModule?.updatedAt ?? generationView.session.previewVersion}`
  const renderedPreviewKey = `${renderedPreviewRevision}:${JSON.stringify([
    activeSessionId,
    activePreviewPage,
  ])}`
  const effectiveTheme =
    generationView.session.themeOverride ??
    readSiteThemeName(generationView.siteSpec?.specJson)

  return (
    <main className="fixed inset-0 overflow-hidden bg-background">
      <SessionGeneratedPreview
        key={renderedPreviewKey}
        source={renderedPreviewSource}
        sourceUrl={clonePageNav.isClone ? clonePageNav.currentUrl : null}
        sessionId={activeSessionId}
        siteSpecJson={generationView.siteSpec?.specJson}
        locale={activePreviewLocale}
        prompt={generationView.session.prompt}
        selectedBrandLogo={generationView.session.selectedBrandLogo ?? null}
        imageOverrides={imageOverrides}
        styleOverrides={styleOverrides}
        textOverrides={textOverrides}
        isDark={generationView.session.themeMode !== 'light'}
        themeStyles={resolveThemeStyles(effectiveTheme)}
        deviceMode="desktop"
      />
    </main>
  )
}
