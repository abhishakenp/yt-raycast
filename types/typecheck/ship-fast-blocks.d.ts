import type { ComponentType, Context } from 'react'

declare module '@ship-fast/blocks' {
  export const library: any
  export const componentNames: string[]
  export const openUIComponentOpenPatternSource: string
  export const Renderer: ComponentType<any>
  export const QueryClient: any
  export const QueryClientProvider: ComponentType<any>
  export const useQuery: any
  export const ImageContextProvider: ComponentType<any>
  export type ImageContext = any
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
  export function extractOpenUIRuntimeComponentNames(source: string): string[]
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
  export const reactExportSourcesBase64: string
  export const reactExportSourcesEncoding: string
  export const vendorSourceFilesBase64: string
  export const vendorSourceFilesEncoding: string
}

declare module '@ship-fast/blocks/theme' {
  export const THEME_CATALOG: any[]
  export function resolveThemeStyles(theme: any): any
}

declare module '@ship-fast/blocks/component-names' {
  export const componentNames: string[]
  export const openUIComponentOpenPatternSource: string
}

declare module '@ship-fast/blocks/portal' {
  export const PortalContainerProvider: ComponentType<any>
}
