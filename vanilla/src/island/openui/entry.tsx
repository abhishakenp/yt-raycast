/**
 * Bundled by `scripts/build-openui-island.ts` into `public/scripts/openui-island.js`.
 * The Express `/preview/:id` shell loads this script and it mounts onto `#openui-root`.
 */
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { OpenUIPreviewClient } from './OpenUIPreviewClient'
// CSS is loaded via <link> in the preview HTML shell (public/styles/openui-preview-launch-loading.css)

const root = document.getElementById('openui-root')
if (!root) {
  throw new Error('[openui-island] missing #openui-root mount point')
}

createRoot(root).render(
  <StrictMode>
    <OpenUIPreviewClient />
  </StrictMode>,
)
