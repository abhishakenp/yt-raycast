/**
 * Bundled by `scripts/build-openui-island.ts` into `public/scripts/openui-island.js`.
 * The Express `/preview/:id` shell loads this script and it mounts onto `#openui-root`.
 */
import { createRoot } from 'react-dom/client'
import React, { StrictMode } from 'react'
import { OpenUIPreviewClient } from './OpenUIPreviewClient'
// CSS is loaded via <link> in the preview HTML shell (public/styles/openui-preview-launch-loading.css)

const root = document.getElementById('openui-root')
if (!root) {
  throw new Error('[openui-island] missing #openui-root mount point')
}

class PreviewRootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[openui-island] preview root error:', error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <pre style={{ color: '#fca5a5', padding: 24, whiteSpace: 'pre-wrap' }}>
        {this.state.error.stack || this.state.error.message}
      </pre>
    )
  }
}

createRoot(root).render(
  <StrictMode>
    <PreviewRootErrorBoundary>
      <OpenUIPreviewClient />
    </PreviewRootErrorBoundary>
  </StrictMode>,
)
