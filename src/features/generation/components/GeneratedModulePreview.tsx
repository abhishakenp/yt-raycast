import DirectPreview from '@/components/GenUI/DirectPreview'
import type {
  PreviewSelection,
  PreviewToolMode,
} from '@/components/GenUI/DirectPreview'
import type { InspectorSelection } from '@/features/editing/element-path'
import type { CapsuleTextChange } from '@/features/editing/hooks/useCapsulePropResolver'
import type { ThemeStyles } from '@/genui/theme-presets'
import { LakebedSessionProvider } from '@ship-fast/lakebed/react'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'
import { lazy, Suspense } from 'react'
import type { CommerceRuntimeMode } from '@ship-fast/blocks/commerce'

type BrandLogoSelection = {
  name: string
  domain?: string | null
  brandId?: string | null
  icon?: string | null
  logo?: string | null
}

type GeneratedModulePreviewProps = {
  commerceMode?: CommerceRuntimeMode
  source: string
  sourceUrl?: string | null
  sessionId?: string
  siteSpecJson?: string
  locale?: string
  /** User's original build prompt — biases generated stock images toward the business. */
  prompt?: string
  /** Dashboard-selected logo used to replace generated brand marks in OpenUI blocks. */
  selectedBrandLogo?: BrandLogoSelection | null
  /** Inline image swaps to re-apply on render, keyed by image alt -> new src. */
  imageOverrides?: Record<string, string>
  /** Anonymous owner secret forwarded to /api/translate for the same-user guard. */
  anonymousOwnerSecret?: string
  /** Inline style/align edits to re-apply on render (class + occurrence -> style). */
  styleOverrides?: Array<{
    classAnchor: string
    occurrenceIndex: number
    style: string
  }>
  /** Inline text edits to re-apply on render (beforeText -> afterText). */
  textOverrides?: Array<{
    beforeText: string
    afterText: string
    occurrenceIndex?: number
  }>
  isDark?: boolean
  themeStyles?: ThemeStyles | null
  deviceMode?: 'desktop' | 'tablet' | 'mobile'
  previewToolMode?: PreviewToolMode
  onPreviewSelect?: (selection: PreviewSelection) => void
  editMode?: boolean
  onTextChange?: (change: CapsuleTextChange) => void
  onImageChange?: (change: {
    oldSrc: string
    newSrc: string
    element: HTMLImageElement
    alt: string
  }) => void
  onElementActivate?: (element: HTMLElement, rect: DOMRect) => void
  onCommitText?: (commitEdit: () => void, cancelEdit: () => void) => void
  onSectionSelect?: (selection: InspectorSelection | null) => void
}

const LazyOpenUIViewer = lazy(() => import('@/island/openui/OpenUIViewer'))

/** Best-effort brand/tagline descriptor from the persisted site spec, used as
 *  extra image-search context alongside the prompt. */
function parseSiteSpecBrand(
  siteSpecJson: string | undefined,
): string | undefined {
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

function parseSiteSpecTheme(
  siteSpecJson: string | undefined,
): Record<string, string> | null {
  if (!siteSpecJson) return null

  try {
    const parsed = JSON.parse(siteSpecJson) as unknown

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return null

    const candidate = parsed as {
      theme?: unknown
      palette?: unknown
      dark?: unknown
    }
    const theme = candidate.theme ?? candidate.palette ?? candidate.dark

    if (!theme || typeof theme !== 'object' || Array.isArray(theme)) return null

    return Object.fromEntries(
      Object.entries(theme).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    )
  } catch {
    return null
  }
}

export function OpenUIModuleRenderer({
  commerceMode = 'disabled',
  source,
  sessionId,
  siteSpecJson,
  locale,
  prompt,
  selectedBrandLogo,
  imageOverrides,
  anonymousOwnerSecret,
}: GeneratedModulePreviewProps) {
  const brandContext = parseSiteSpecBrand(siteSpecJson)
  const hasOverrides =
    !!imageOverrides && Object.keys(imageOverrides).length > 0
  const imageContext =
    prompt || brandContext || hasOverrides
      ? { prompt, brandContext, overrides: imageOverrides }
      : null
  return (
    <Suspense
      fallback={<div className="size-full bg-background" aria-hidden="true" />}
    >
      <LazyOpenUIViewer
        commerce={{
          ...(anonymousOwnerSecret === undefined
            ? {}
            : { anonymousOwnerSecret }),
          mode: commerceMode,
          scope: 'sessions',
          tenant: sessionId ?? 'preview',
        }}
        response={source}
        theme={parseSiteSpecTheme(siteSpecJson)}
        locale={locale}
        embed
        sessionId={sessionId}
        imageContext={imageContext}
        selectedBrandLogo={selectedBrandLogo}
        anonymousOwnerSecret={anonymousOwnerSecret}
      />
    </Suspense>
  )
}

export function GeneratedModulePreview({
  commerceMode = 'disabled',
  source,
  sourceUrl = null,
  sessionId,
  siteSpecJson,
  locale,
  prompt,
  selectedBrandLogo,
  imageOverrides,
  styleOverrides,
  textOverrides,
  isDark = true,
  themeStyles = null,
  deviceMode = 'desktop',
  previewToolMode = null,
  onPreviewSelect,
  editMode = false,
  onTextChange,
  onImageChange,
  onElementActivate,
  onCommitText,
  onSectionSelect,
}: GeneratedModulePreviewProps) {
  const anonymousOwnerSecret =
    typeof window === 'undefined' || !sessionId
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
        onCommitText={onCommitText}
        onSectionSelect={onSectionSelect}
        styleOverrides={styleOverrides}
        textOverrides={textOverrides}
      >
        {sourceUrl ? (
          <iframe
            title="Generated website preview"
            className="size-full border-0 bg-white"
            sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts"
            src={sourceUrl}
          />
        ) : source && source.trim().length > 0 ? (
          <OpenUIModuleRenderer
            anonymousOwnerSecret={anonymousOwnerSecret}
            commerceMode={commerceMode}
            source={source}
            sessionId={sessionId}
            siteSpecJson={siteSpecJson}
            locale={locale}
            prompt={prompt}
            selectedBrandLogo={selectedBrandLogo}
            imageOverrides={imageOverrides}
          />
        ) : (
          <div
            role="status"
            className="flex size-full items-center justify-center bg-background p-8 text-center text-sm text-muted-foreground"
          >
            Generating preview…
          </div>
        )}
      </DirectPreview>
    </LakebedSessionProvider>
  )
}
