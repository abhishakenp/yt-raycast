import type { ComponentType, Context, ReactNode } from 'react'

declare module '@ship-fast/blocks' {
  export const allCapsules: any[]
  export const library: any
  export const componentNames: string[]
  export const openUIComponentOpenPatternSource: string
  export const Renderer: ComponentType<any>
  export const QueryClient: any
  export const QueryClientProvider: ComponentType<any>
  export const useQuery: any
  export const ImageContextProvider: ComponentType<any>
  export type ImageContext = any
  export function buildImageSearchQuery(
    alt: string,
    baseQuery: string,
    context?: ImageContext,
  ): string
  export function sanitizeProps<T>(props: T, schema: unknown): T
  export const BrandLogoProvider: ComponentType<any>
  export const Logo: ComponentType<any>
  export function getBrandLogoImageSrc(value: any): string | null
  export function useBrandLogo(): any
  export type BrandLogoSelection = {
    name: string
    domain?: string | null
    brandId?: string | null
    icon?: string | null
    logo?: string | null
  }
  export const PersistQueryClientProvider: ComponentType<any>
  export const IntegrationProvider: ComponentType<any>
  export const OpenUIIntegrationProviders: ComponentType<any>
  export const withMedusa: any
  export const withSanity: any
  export type OpenUIIntegrationConfig = any
  export type OpenUIIntegrationPayload = any
  export type OpenUILibraryComponent = any
  export type OpenUISanityContextValue = any
  export type OpenUIMedusaContextValue = any
  export const OpenUISanityContext: Context<any>
  export const OpenUIMedusaContext: Context<any>
  export type CommerceRuntimeMode = 'demo' | 'disabled' | 'hosted' | 'sdk'
  export type CommerceScope = 'deployments' | 'sessions'
  export const CommerceProvider: ComponentType<{
    adapter?: {
      catalog: () => Promise<{ products: unknown[] }>
    }
    children?: ReactNode
    fallbackProducts: unknown[]
    mode: CommerceRuntimeMode
    regionId?: string
    scope: CommerceScope
    tenant: string
  }>
  export const PreviewUrlBridgeContext: Context<PreviewUrlBridgeValue>
  export type PreviewUrlBridgeValue = {
    navigateToPage: ((pageSlug: string | null) => void) | null
    pageFromUrl: string | null
  }
  export const Image: ComponentType<any>
  export const BaseImage: ComponentType<any>
  export function picsum(alt: unknown, w?: number, h?: number): string
  export function defineCapsule(input: any): any
}

declare module '@ship-fast/blocks/runtime' {
  export const Renderer: ComponentType<any>
  export type Library = any
  export type RendererProps = any
  export const QueryClient: any
  export const QueryClientProvider: ComponentType<any>
  export const useQuery: any
  export const ImageContextProvider: ComponentType<any>
  export type ImageContext = any
  export const BrandLogoProvider: ComponentType<any>
  export const Logo: ComponentType<any>
  export function getBrandLogoImageSrc(value: any): string | null
  export function useBrandLogo(): any
  export type BrandLogoSelection = {
    name: string
    domain?: string | null
    brandId?: string | null
    icon?: string | null
    logo?: string | null
  }
  export const PersistQueryClientProvider: ComponentType<any>
  export const IntegrationProvider: ComponentType<any>
  export const OpenUIIntegrationProviders: ComponentType<any>
  export const withMedusa: any
  export const withSanity: any
  export type OpenUIIntegrationConfig = any
  export type OpenUIIntegrationPayload = any
  export type OpenUILibraryComponent = any
  export type OpenUISanityContextValue = any
  export type OpenUIMedusaContextValue = any
  export const OpenUISanityContext: Context<any>
  export const OpenUIMedusaContext: Context<any>
  export type CommerceRuntimeMode = 'demo' | 'disabled' | 'hosted' | 'sdk'
  export type CommerceScope = 'deployments' | 'sessions'
  export const CommerceProvider: ComponentType<{
    adapter?: {
      catalog: () => Promise<{ products: unknown[] }>
    }
    children?: ReactNode
    fallbackProducts: unknown[]
    mode: CommerceRuntimeMode
    regionId?: string
    scope: CommerceScope
    tenant: string
  }>
  export const PreviewUrlBridgeContext: Context<PreviewUrlBridgeValue>
  export type PreviewUrlBridgeValue = {
    navigateToPage: ((pageSlug: string | null) => void) | null
    pageFromUrl: string | null
  }
  export function extractOpenUIRuntimeComponentNames(source: string): string[]
  export function isRuntimeComponentName(name: string): boolean
  export type AiCapsuleRecord = {
    capsuleName: string
    parentCapsule: string
    compiledJs: string
    description: string
  }
  export function getOpenUIRuntimeLibraryCacheKey(
    source: string,
    aiCapsules?: AiCapsuleRecord[],
  ): string
  export function loadOpenUIRuntimeComponent(
    name: string,
  ): Promise<{ client: any }>
  export function loadOpenUIRuntimeLibrary(
    source: string,
    aiCapsules?: AiCapsuleRecord[],
  ): Promise<any>
}

declare module '@ship-fast/blocks/generated' {
  export const blockSourceFilesBase64: string
  export const blockSourceFilesEncoding: string
  export const capsuleCategories: Record<
    string,
    {
      category: string
      functionalType: string
    }
  >
  export const componentSpecBase64: string
  export const componentSpecEncoding: string
  export function findSimilarCapsules(name: string, limit?: number): string[]
  export const lakebedExportComponentChunks: Record<string, string>
  export const lakebedExportDepsBase64: string
  export const lakebedExportDepsChunkEncoding: string
  export const lakebedExportDepsEncoding: string
  export const lakebedExportFileChunks: Record<string, string>
  export const lakebedAppCssSourcesBase64: string
  export const lakebedAppCssSourcesEncoding: string
  export const reactExportSourcesBase64: string
  export const reactExportSourcesEncoding: string
  export const vendorSourceFilesBase64: string
  export const vendorSourceFilesEncoding: string
}

declare module '@ship-fast/blocks/generated/lakebed-app-css-sources.compressed' {
  export const lakebedAppCssSourcesBase64: string
  export const lakebedAppCssSourcesEncoding: string
}

declare module '@ship-fast/blocks/theme' {
  export const THEME_CATALOG: any[]
  export const THEME_VAR_KEYS: readonly string[]
  export function resolveThemeStyles(theme: any): any
}

declare module '@ship-fast/blocks/component-names' {
  export const componentNames: string[]
  export const openUIComponentOpenPatternSource: string
}

declare module '@ship-fast/blocks/portal' {
  export const PortalContainerProvider: ComponentType<any>
  export function usePortalContainer(): HTMLElement | null
}

declare module '@ship-fast/blocks/capsules' {
  export type CollectionFieldType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'array-string'
    | 'unknown'

  export type CollectionField = {
    key: string
    type: CollectionFieldType
    optional: boolean
  }

  export type CollectionProp = {
    key: string
    itemFields: CollectionField[]
  }

  export type VariantOption = {
    value: string | number | boolean
    label: string
  }

  export type VariantProp = {
    key: string
    options: VariantOption[]
  }

  export type ScalarProp = {
    key: string
    type: 'string' | 'number' | 'boolean'
    optional: boolean
  }

  export type CapsuleSchemaInfo = {
    collections: CollectionProp[]
    variants: VariantProp[]
    scalars: ScalarProp[]
  }

  export type CapsulePropContext = {
    lakebedKey: string
    capsuleName: string
    statementId: string
    propKey: string
    index?: number
    fieldKey?: string
    kind: 'scalar' | 'collection'
  }

  export function introspectCapsuleSchema(
    propsSchema: unknown,
  ): CapsuleSchemaInfo
  export function createDefaultItem(
    collection: CollectionProp,
  ): Record<string, unknown>
  export function hasContextInfo(info: CapsuleSchemaInfo): boolean
  export function matchElementToProp(
    element: HTMLElement,
    capsuleName: string,
    statementId: string,
    mergedProps: Record<string, unknown>,
  ): CapsulePropContext | null
  export function buildPropPatch(
    context: CapsulePropContext,
    newValue: string,
    currentData: Record<string, unknown>,
  ): Partial<Record<string, unknown>>
  export function defineCapsule(input: any): any
}

declare module '@ship-fast/blocks/multi-image-src' {
  export function encodeMultiImageSrc(urls: string[]): string
  export function decodeMultiImageSrc(
    value: string | null | undefined,
  ): string[] | null
  export function firstImageSrc(value: string | null | undefined): string | null
}
