import DirectPreview from '@/components/GenUI/DirectPreview'
import OpenUIViewer from '@/island/openui/OpenUIViewer'
import type { ThemeStyles } from '@/genui/theme-presets'

type GeneratedModulePreviewProps = {
  source: string
  sessionId: string
  siteSpecJson?: string
  locale?: string
  isDark?: boolean
  themeStyles?: ThemeStyles | null
  deviceMode?: 'desktop' | 'tablet' | 'mobile'
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
}: GeneratedModulePreviewProps) {
  return (
    <DirectPreview themeStyles={themeStyles} isDark={isDark} deviceMode={deviceMode}>
      <OpenUIModuleRenderer
        source={source}
        sessionId={sessionId}
        siteSpecJson={siteSpecJson}
        locale={locale}
      />
    </DirectPreview>
  )
}
