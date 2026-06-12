import DirectPreview from '@/components/GenUI/DirectPreview'
import type { PreviewToolMode } from '@/components/GenUI/DirectPreview'
import AgentationSessionBridge from '@/components/GenUI/AgentationSessionBridge'
import OpenUIViewer from '@/island/openui/OpenUIViewer'
import type { ThemeStyles } from '@/genui/theme-presets'
import { LakebedSessionProvider } from '@ship-fast/lakebed/react'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type GeneratedModulePreviewProps = {
  source: string
  sessionId: string
  siteSpecJson?: string
  locale?: string
  isDark?: boolean
  themeStyles?: ThemeStyles | null
  deviceMode?: 'desktop' | 'tablet' | 'mobile'
  previewToolMode?: PreviewToolMode
  agentationEnabled?: boolean
}

const parseSiteSpecTheme = (siteSpecJson: string | undefined): Record<string, string> | null => {
  if (!siteSpecJson) return null

  try {
    const parsed = JSON.parse(siteSpecJson) as unknown

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

    const candidate = parsed as {
      theme?: unknown
      palette?: unknown
      dark?: unknown
    }
    const theme = candidate.theme ?? candidate.palette ?? candidate.dark

    if (!theme || typeof theme !== 'object' || Array.isArray(theme)) return null

    return Object.fromEntries(
      Object.entries(theme).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    )
  } catch {
    return null
  }
}

export function OpenUIModuleRenderer({
  source,
  sessionId,
  siteSpecJson,
  locale,
}: GeneratedModulePreviewProps) {
  return (
    <OpenUIViewer
      response={source}
      theme={parseSiteSpecTheme(siteSpecJson)}
      locale={locale}
      embed
      sessionId={sessionId}
    />
  )
}

export function GeneratedModulePreview({
  source,
  sessionId,
  siteSpecJson,
  locale,
  isDark = true,
  themeStyles = null,
  deviceMode = 'desktop',
  previewToolMode = null,
  agentationEnabled = false,
}: GeneratedModulePreviewProps) {
  const anonymousOwnerSecret =
    typeof window === 'undefined'
      ? undefined
      : readAnonymousOwnerSecret(window.localStorage, sessionId)

  return (
    <LakebedSessionProvider
      anonymousOwnerSecret={anonymousOwnerSecret}
      sessionId={sessionId}
    >
      <DirectPreview
        themeStyles={themeStyles}
        isDark={isDark}
        deviceMode={deviceMode}
        previewToolMode={previewToolMode}
      >
        <OpenUIModuleRenderer
          source={source}
          sessionId={sessionId}
          siteSpecJson={siteSpecJson}
          locale={locale}
        />
        <AgentationSessionBridge
          enabled={agentationEnabled}
          sessionId={sessionId}
        />
      </DirectPreview>
    </LakebedSessionProvider>
  )
}
