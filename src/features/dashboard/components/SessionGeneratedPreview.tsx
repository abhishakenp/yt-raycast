import type { PreviewSelection } from '@/components/GenUI/DirectPreview'
import type { CapsuleTextChange } from '@/features/editing/hooks/useCapsulePropResolver'
import type { InspectorSelection } from '@/features/editing/element-path'
import type { ThemeStyles } from '@/genui/theme-presets'
import { GeneratedModulePreview } from '@/features/generation/components/GeneratedModulePreview'
import type { CommerceRuntimeMode } from '@/features/commerce/contracts'

type BrandLogoSelection = {
  name: string
  domain: string | null
  brandId: string | null
  icon: string | null
  logo: string | null
}

export type SessionGeneratedPreviewProps = {
  commerceMode?: CommerceRuntimeMode
  source: string
  sourceUrl?: string | null
  sessionId?: string
  siteSpecJson?: string
  locale?: string
  prompt?: string
  selectedBrandLogo?: BrandLogoSelection | null
  imageOverrides?: Record<string, string>
  styleOverrides?: Array<{
    classAnchor: string
    occurrenceIndex: number
    style: string
  }>
  textOverrides?: Array<{
    beforeText: string
    afterText: string
    occurrenceIndex?: number
  }>
  isDark?: boolean
  themeStyles?: ThemeStyles | null
  deviceMode?: 'desktop' | 'tablet' | 'mobile'
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

export const SessionGeneratedPreview = ({
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
  onPreviewSelect,
  editMode = false,
  onTextChange,
  onImageChange,
  onElementActivate,
  onCommitText,
  onSectionSelect,
}: SessionGeneratedPreviewProps) => (
  <GeneratedModulePreview
    commerceMode={commerceMode}
    source={source}
    sourceUrl={sourceUrl}
    sessionId={sessionId}
    siteSpecJson={siteSpecJson}
    locale={locale}
    prompt={prompt}
    selectedBrandLogo={selectedBrandLogo}
    imageOverrides={imageOverrides}
    styleOverrides={styleOverrides}
    textOverrides={textOverrides}
    isDark={isDark}
    themeStyles={themeStyles}
    deviceMode={deviceMode}
    onPreviewSelect={onPreviewSelect}
    editMode={editMode}
    onTextChange={onTextChange}
    onImageChange={onImageChange}
    onElementActivate={onElementActivate}
    onCommitText={onCommitText}
    onSectionSelect={onSectionSelect}
  />
)
