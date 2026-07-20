export {
  Renderer,
  type Library,
  type RendererProps,
} from '@openuidev/react-lang'
export {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
export { ImageContextProvider, type ImageContext } from './lib/img.tsx'
export {
  BrandLogoProvider,
  Logo,
  getBrandLogoImageSrc,
  useBrandLogo,
  type BrandLogoSelection,
} from './section-kit/Logo.tsx'
export { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
export {
  PreviewUrlBridgeContext,
  type PreviewUrlBridgeValue,
} from './lib/preview-url-bridge.tsx'

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
export {
  CommerceProvider,
  useCommerce,
  type CommerceController,
  type CommerceRuntimeStatus,
} from './registry/sections/commerce/commerce-provider.tsx'
export type {
  CommerceCatalogAdapter,
  CommerceCatalogEnvelope,
  CommerceCatalogProduct,
  CommerceProduct,
  CommerceProductSlot,
  CommerceRuntimeMode,
  CommerceScope,
} from './registry/sections/commerce/commerce-contracts.ts'

export {
  extractAllComponentNames,
  extractOpenUIRuntimeComponentNames,
  getOpenUIRuntimeLibraryCacheKey,
  isRuntimeComponentName,
  loadAiCapsule,
  loadOpenUIRuntimeComponent,
  loadOpenUIRuntimeLibrary,
  type AiCapsuleRecord,
} from './runtime-library.ts'
