import { describe, expect, it } from 'vitest'

import {
  buildLakebedClientBundleForTest,
  duplicatedPreactPackagesFromMetafile,
} from '@/features/deployments/server/lakebed-deploy-service'

/**
 * Regression coverage for the Lakebed "renders twice + dead event handlers" bug.
 *
 * The client mounts via `preact/compat`, generated components import
 * `preact/compat` (the React shim) + `preact/hooks`, and lakebed/client's Router
 * imports from `preact`. Without pinning, esbuild resolves the CJS build for a
 * `require("preact/hooks")` (from preact/compat's CJS build) and the ESM build
 * for an `import ... from "preact/hooks"` → the SAME preact subpackage is
 * bundled twice with independent module state (the hooks dispatcher, the core's
 * `options`). Hooks/events then bind to one copy while the tree is diffed by the
 * other, so the whole app renders twice and click handlers (dark-mode, language
 * switcher) silently do nothing.
 *
 * createSourcePlugin pins every preact specifier to one physical module. The
 * esbuild metafile is the reliable signal: no preact subpackage may appear as
 * more than one build in the bundle inputs.
 */

// Mirrors a real generated export: mount → preact/compat (added by the builder),
// a component using the `preact/compat` React shim + `preact/hooks`, and the
// Router from lakebed/client (which imports from `preact`). This exact mix is
// what splits preact into CJS + ESM copies without the pin.
const CLIENT_INDEX = `import { Router } from 'lakebed/client'
import * as React from 'preact/compat'
import { useState } from 'preact/hooks'

const Toggle = React.forwardRef<HTMLButtonElement, Record<string, never>>(
  (_props, ref) => {
    const [on, setOn] = useState(false)
    return (
      <button id="toggle" ref={ref} onClick={() => setOn((value) => !value)}>
        {on ? 'ON' : 'OFF'}
      </button>
    )
  },
)

export const App = () => (
  <Router>
    <div className="app-root">
      <Toggle />
    </div>
  </Router>
)
`

describe('lakebed client bundle uses a single preact core', () => {
  it('bundles every preact subpackage exactly once (no CJS/ESM duplication)', async () => {
    const { metafile } = await buildLakebedClientBundleForTest(
      { 'client/index.tsx': CLIENT_INDEX },
      { format: 'esm' },
    )
    const duplicated = duplicatedPreactPackagesFromMetafile(metafile)
    // Any duplicated subpackage → split module state → double render + dead
    // handlers. The contract is a single build per preact subpackage.
    expect(duplicated).toEqual({})
  }, 60000)
})
