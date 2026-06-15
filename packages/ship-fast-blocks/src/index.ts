export { library, componentNames, openUIComponentOpenPatternSource } from "./library.ts"
// Re-export the Renderer from the SAME @openuidev/react-lang instance the
// library + contract components are built with, so server-side rendering shares
// one React context (avoids the dual-instance "useOpenUI must be used within a
// <Renderer />" error when the engine renders home.openui to HTML).
export { Renderer } from "@openuidev/react-lang"
export { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
export { ImageContextProvider, type ImageContext } from "./lib/img.tsx"
export { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import componentSpec from "./generated/component-spec.json"
export { componentSpec }
import reactExportSources from "./generated/react-export-sources.json"
export { reactExportSources }

export {
  IntegrationProvider,
  OpenUIIntegrationProviders,
  withMedusa,
  withSanity,
  type OpenUIIntegrationConfig,
  type OpenUIIntegrationPayload,
  type OpenUILibraryComponent,
  type OpenUISanityContextValue,
  type OpenUIMedusaContextValue,
  OpenUISanityContext,
  OpenUIMedusaContext,
} from "./integrations.tsx"

export * from "./theme-presets.ts"
export * from "./theme-apply.ts"

export * as registry from "./registry/all.ts"
export * from "./registry/all.ts"
export * from "./registry/taxonomy.ts"
