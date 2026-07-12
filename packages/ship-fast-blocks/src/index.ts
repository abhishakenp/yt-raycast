export {
  allCapsules,
  library,
  componentNames,
  openUIComponentOpenPatternSource,
} from './library.ts'
// Re-export the Renderer from the SAME @openuidev/react-lang instance the
// library + contract components are built with, so server-side rendering shares
// one React context (avoids the dual-instance "useOpenUI must be used within a
// <Renderer />" error when the engine renders home.openui to HTML).
export { Renderer } from '@openuidev/react-lang'
export {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
export { ImageContextProvider, type ImageContext } from './lib/img.tsx'
export { buildImageSearchQuery } from './lib/image-search-query.ts'
export {
  matchElementToProp,
  buildPropPatch,
  type CapsulePropContext,
} from './capsules/prop-text-matcher.ts'
export {
  BrandLogoProvider,
  Logo,
  getBrandLogoImageSrc,
  useBrandLogo,
  type BrandLogoSelection,
} from './section-kit/Logo.tsx'
export { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

export {
  IntegrationProvider,
  OpenUIIntegrationProviders,
  withMedusa,
  type OpenUIIntegrationConfig,
  type OpenUIIntegrationPayload,
  type OpenUILibraryComponent,
  type OpenUIMedusaContextValue,
  OpenUIMedusaContext,
} from './integrations.tsx'

export * from './theme-presets.ts'
export * from './theme-apply.ts'

export * as registry from './registry/all.ts'
export * from './registry/all.ts'
