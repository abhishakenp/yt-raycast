/**
 * Server-side rendering for OpenUI components.
 * Renders OpenUI source to HTML using React's renderToString,
 * eliminating the need for client-side React runtime for generated content.
 */

import './openui-message-channel-polyfill.js'
import { createElement, type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import {
  Renderer,
  ImageContextProvider,
  BrandLogoProvider,
  DesignSystemProvider,
  DEFAULT_DESIGN,
  extractOpenUIRuntimeComponentNames,
  loadOpenUIRuntimeLibrary,
  type ImageContext,
  type BrandLogoSelection,
  type DesignIntent,
} from '@ship-fast/blocks/runtime'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { LakebedSessionProvider } from '@ship-fast/lakebed/react'
import { preprocessOpenUIResponse } from './lib/openui-preprocess'

/**
 * Inert Convex client for server-side rendering. Data-backed capsules (e.g. the
 * ecommerce page) call lakebed hooks that require a ConvexProvider +
 * LakebedSessionProvider; without them the hooks throw and blank the WHOLE page
 * during SSR (the `openui-error` panel). The real providers only exist in the
 * live client preview, so for SSR we supply this stub: every query resolves to
 * "no data yet" (undefined), which capsules treat as "use built-in defaults",
 * and mutations are harmless no-ops (they're only invoked from effects/handlers
 * that never run during renderToString). The client then hydrates with the real
 * providers and live data. Subscriptions/effects do not run during
 * renderToString, so `watchQuery` is the only method touched here.
 */
const emptyWatch = {
  localQueryResult: () => undefined,
  onUpdate: () => () => {},
  journal: () => undefined,
}
const ssrConvexStub = new ConvexReactClient('http://localhost:0')
Object.defineProperty(ssrConvexStub, 'watchQuery', {
  value: () => emptyWatch,
  writable: true,
  configurable: true,
})
Object.defineProperty(ssrConvexStub, 'connectionState', {
  value: () => ({
    hasInflightRequests: false,
    isWebSocketConnected: false,
    timeOfOldestInflightRequest: null,
  }),
  writable: true,
  configurable: true,
})

/**
 * Wrap a render tree with the SSR-safe providers (image context + design
 * system + inert lakebed/convex stubs) so any capsule renders without
 * throwing on the server.
 *
 * `DesignSystemProvider` is included so the SSR output carries the same
 * `data-density`/`data-typography`/`data-gradient`/`data-motion` wrapper
 * attributes and `--d-radius`/`--d-shadow`/... CSS custom properties that the
 * dashboard's live preview sets. Without it, the 416-line `design-presets.css`
 * (imported via `src/styles.css`) matches zero DOM nodes and the entire
 * @design axis system is dead CSS — causing visual disparity between the
 * dashboard preview and gallery/export SSR output.
 */
function withSSRProviders(
  tree: ReactNode,
  imageContext: ImageContext | null | undefined,
  brandLogo: BrandLogoSelection | null | undefined,
  designIntent: DesignIntent | null | undefined,
) {
  const withImage = createElement(
    ImageContextProvider,
    { value: imageContext },
    tree,
  )
  const withBrandLogo =
    brandLogo && typeof brandLogo === 'object'
      ? createElement(BrandLogoProvider, { value: brandLogo }, withImage)
      : withImage
  const withDesign = createElement(DesignSystemProvider, {
    intent: designIntent ?? DEFAULT_DESIGN,
    children: withBrandLogo,
  })
  return createElement(
    ConvexProvider,
    { client: ssrConvexStub },
    createElement(LakebedSessionProvider, {
      sessionId: 'ssr-preview',
      children: withDesign,
    }),
  )
}

function openUiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function openUiErrorStack(error: unknown) {
  return error instanceof Error && typeof error.stack === 'string'
    ? error.stack
    : undefined
}

function openUiRenderDiagnostics(source: string, preprocessed: string | null) {
  try {
    return {
      sourceLength: source.length,
      preprocessedLength:
        typeof preprocessed === 'string' ? preprocessed.length : null,
      components: extractOpenUIRuntimeComponentNames(
        typeof preprocessed === 'string' ? preprocessed : source,
      ).slice(0, 40),
    }
  } catch (diagnosticError) {
    return {
      sourceLength: source.length,
      diagnosticError: openUiErrorMessage(diagnosticError),
    }
  }
}

/**
 * Render OpenUI source to HTML string.
 * @param {string} source - OpenUI source code
 * @param {object} theme - Theme tokens (primary, accent, background, etc.)
 * @param {string} locale - Locale code for translations
 * @param {object} integrations - Integration configs (medusa)
 * @param {object} imageContext - Page-level prompt/brand context for relevant stock images
 * @param {any} brandLogo - Selected brand logo selection for SSR
 * @param {DesignIntent} designIntent - @design axis intent (defaults to DEFAULT_DESIGN for parity with dashboard)
 * @returns {string} Rendered HTML
 */
export async function renderOpenUIToHTML(
  source: string,
  _theme: Record<string, unknown> | null = null,
  _locale: string = 'en',
  _integrations: Record<string, unknown> | null = null,
  imageContext: ImageContext | null | undefined = null,
  brandLogo: BrandLogoSelection | null | undefined = null,
  designIntent: DesignIntent | null | undefined = null,
) {
  let preprocessed = null
  try {
    preprocessed = preprocessOpenUIResponse(source, {
      resolveRefs: false,
    })
    const library = await loadOpenUIRuntimeLibrary(preprocessed)

    const html = renderToString(
      withSSRProviders(
        createElement(Renderer, {
          response: preprocessed,
          library,
          isStreaming: false,
        }),
        imageContext,
        brandLogo,
        designIntent,
      ),
    )

    return html
  } catch (error) {
    console.error('[OpenUI SSR] Rendering error', {
      error: openUiErrorMessage(error),
      stack: openUiErrorStack(error),
      ...openUiRenderDiagnostics(source, preprocessed),
    })
    return `<div class="openui-error">Failed to render: ${openUiErrorMessage(error)}</div>`
  }
}

/**
 * Render OpenUI with theme tokens applied as CSS variables.
 * @param {string} source - OpenUI source code
 * @param {object} theme - Theme tokens
 * @param {string} locale - Locale code
 * @param {object} integrations - Integration configs
 * @param {object} imageContext - Page-level prompt/brand context for relevant stock images
 * @param {DesignIntent} designIntent - @design axis intent (defaults to DEFAULT_DESIGN for parity with dashboard)
 * @returns {object} { html: string, cssVars: string }
 */
export async function renderOpenUIToHTMLWithTheme(
  source: string,
  theme: Record<string, unknown> | null = null,
  locale: string = 'en',
  integrations: Record<string, unknown> | null = null,
  imageContext: ImageContext | null | undefined = null,
  brandLogo: BrandLogoSelection | null | undefined = null,
  designIntent: DesignIntent | null | undefined = null,
) {
  const html = await renderOpenUIToHTML(
    source,
    theme,
    locale,
    integrations,
    imageContext,
    brandLogo,
    designIntent,
  )

  // Convert theme tokens to CSS variables
  const cssVars = theme ? generateThemeCSSVars(theme) : ''

  return { html, cssVars }
}

/**
 * Generate CSS variables from theme tokens.
 * @param {object} theme - Theme tokens
 * @returns {string} CSS variable declarations
 */
function generateThemeCSSVars(theme: Record<string, unknown>) {
  const vars = []

  const tokenMap = {
    primary: '--primary',
    secondary: '--secondary',
    accent: '--accent',
    background: '--background',
    foreground: '--foreground',
    muted: '--muted',
    'muted-foreground': '--muted-foreground',
    border: '--border',
    input: '--input',
    ring: '--ring',
  }

  for (const [key, cssVar] of Object.entries(tokenMap)) {
    if (theme[key]) {
      vars.push(`${cssVar}: ${theme[key]};`)
    }
  }

  return vars.join('\n  ')
}
