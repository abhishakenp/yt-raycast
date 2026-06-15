/**
 * Server-side rendering for OpenUI components.
 * Renders OpenUI source to HTML using React's renderToString,
 * eliminating the need for client-side React runtime for generated content.
 */

import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { Renderer, library, ImageContextProvider } from '@ship-fast/blocks'
import { preprocessOpenUIResponse } from './lib/openui-preprocess.js'

/**
 * Render OpenUI source to HTML string.
 * @param {string} source - OpenUI source code
 * @param {object} theme - Theme tokens (primary, accent, background, etc.)
 * @param {string} locale - Locale code for translations
 * @param {object} integrations - Integration configs (sanity, medusa)
 * @param {object} imageContext - Page-level prompt/brand context for relevant stock images
 * @returns {string} Rendered HTML
 */
export function renderOpenUIToHTML(source, theme = null, locale = 'en', integrations = null, imageContext = null) {
  try {
    const preprocessed = preprocessOpenUIResponse(source, { resolveRefs: false })

    const html = renderToString(
      createElement(
        ImageContextProvider,
        { value: imageContext },
        createElement(Renderer, {
          response: preprocessed,
          library,
          isStreaming: false,
        }),
      )
    )

    return html
  } catch (error) {
    console.error('[OpenUI SSR] Rendering error:', error)
    return `<div class="openui-error">Failed to render: ${error.message}</div>`
  }
}

/**
 * Render OpenUI with theme tokens applied as CSS variables.
 * @param {string} source - OpenUI source code
 * @param {object} theme - Theme tokens
 * @param {string} locale - Locale code
 * @param {object} integrations - Integration configs
 * @param {object} imageContext - Page-level prompt/brand context for relevant stock images
 * @returns {object} { html: string, cssVars: string }
 */
export function renderOpenUIToHTMLWithTheme(source, theme = null, locale = 'en', integrations = null, imageContext = null) {
  const html = renderOpenUIToHTML(source, theme, locale, integrations, imageContext)
  
  // Convert theme tokens to CSS variables
  const cssVars = theme ? generateThemeCSSVars(theme) : ''
  
  return { html, cssVars }
}

/**
 * Generate CSS variables from theme tokens.
 * @param {object} theme - Theme tokens
 * @returns {string} CSS variable declarations
 */
function generateThemeCSSVars(theme) {
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