import DirectPreview from '@/components/GenUI/DirectPreview'
import type { PreviewSelection, PreviewToolMode } from '@/components/GenUI/DirectPreview'
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
  /** User's original build prompt — biases generated stock images toward the business. */
  prompt?: string
  isDark?: boolean
  themeStyles?: ThemeStyles | null
  deviceMode?: 'desktop' | 'tablet' | 'mobile'
  previewToolMode?: PreviewToolMode
  agentationEnabled?: boolean
  onPreviewSelect?: (selection: PreviewSelection) => void
  editMode?: boolean
  onTextChange?: (change: { oldText: string; newText: string; element: HTMLElement }) => void
  onImageChange?: (change: { oldSrc: string; newSrc: string; element: HTMLImageElement; alt: string }) => void
  onElementActivate?: (element: HTMLElement, rect: DOMRect) => void
}

export const isHtmlDocumentSource = (source: string): boolean => {
  const trimmed = source.trim()
  return /^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)
}

/** Best-effort brand/tagline descriptor from the persisted site spec, used as
 *  extra image-search context alongside the prompt. */
const parseSiteSpecBrand = (siteSpecJson: string | undefined): string | undefined => {
  if (!siteSpecJson) return undefined
  try {
    const parsed = JSON.parse(siteSpecJson) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return undefined
    const parts = [parsed.brand, parsed.brandName, parsed.name, parsed.tagline]
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .map((v) => v.trim())
    const descriptor = [...new Set(parts)].join(' ').trim()
    return descriptor.length > 0 ? descriptor : undefined
  } catch {
    return undefined
  }
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

export function HtmlModuleRenderer({ source }: Pick<GeneratedModulePreviewProps, 'source'>) {
  return (
    <iframe
      title="Generated website preview"
      className="size-full border-0 bg-white"
      sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts"
      srcDoc={source}
    />
  )
}

export function OpenUIModuleRenderer({
  source,
  sessionId,
  siteSpecJson,
  locale,
  prompt,
}: GeneratedModulePreviewProps) {
  const brandContext = parseSiteSpecBrand(siteSpecJson)
  const imageContext =
    prompt || brandContext ? { prompt, brandContext } : null
  return (
    <OpenUIViewer
      response={source}
      theme={parseSiteSpecTheme(siteSpecJson)}
      locale={locale}
      embed
      sessionId={sessionId}
      imageContext={imageContext}
    />
  )
}

export function GeneratedModulePreview({
  source,
  sessionId,
  siteSpecJson,
  locale,
  prompt,
  isDark = true,
  themeStyles = null,
  deviceMode = 'desktop',
  previewToolMode = null,
  agentationEnabled = false,
  onPreviewSelect,
  editMode = false,
  onTextChange,
  onImageChange,
  onElementActivate,
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
        onPreviewSelect={onPreviewSelect}
        editMode={editMode}
        onTextChange={onTextChange}
        onImageChange={onImageChange}
        onElementActivate={onElementActivate}
      >
        {isHtmlDocumentSource(source) ? (
          <HtmlModuleRenderer source={source} />
        ) : (
          <OpenUIModuleRenderer
            source={source}
            sessionId={sessionId}
            siteSpecJson={siteSpecJson}
            locale={locale}
            prompt={prompt}
          />
        )}
        <AgentationSessionBridge
          enabled={agentationEnabled}
          sessionId={sessionId}
        />
      </DirectPreview>
    </LakebedSessionProvider>
  )
}
