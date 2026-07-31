import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { build } from 'esbuild'
import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'

import { buildOpenUIExport } from './openui-export-builder'

const htmlFragmentSource =
  '<main><h1>PurrSpecs</h1><p>Subscribers value Satisfaction Readers cat lovers choose perfect toys.</p></main>'

function unzipTextFiles(body: Uint8Array): Record<string, string> {
  return Object.fromEntries(
    Object.entries(unzipSync(body)).map(([name, value]) => [
      name,
      strFromU8(value),
    ]),
  )
}

describe('static HTML fragment exports', () => {
  it('packages rendered HTML fragments as static ZIPs instead of parsing page text as OpenUI', async () => {
    const result = await buildOpenUIExport({
      source: htmlFragmentSource,
      siteSpecJson: JSON.stringify({ projectName: 'PurrSpecs' }),
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipTextFiles(result.body as Uint8Array)

    expect(result.contentType).toBe('application/zip')
    expect(files['index.html']).toBe(htmlFragmentSource)
    expect(Object.values(files).join('\n')).not.toContain(
      'OpenUI source has unresolved references',
    )
  })

  it('bundles generated commerce React exports with copied shared helpers', async () => {
    const result = await buildOpenUIExport({
      source:
        'root = ProductGrid("Featured Products", [{name:"Hydrating Serum", price:"$28", imageAlt:"Hydrating serum bottle"}])',
      siteSpecJson: JSON.stringify({ projectName: 'React Commerce' }),
      sessionId: 'demo',
      target: 'react',
    })
    const files = unzipTextFiles(result.body as Uint8Array)
    const directory = mkdtempSync(join(tmpdir(), 'react-commerce-export-'))

    try {
      for (const [path, source] of Object.entries(files)) {
        const absolutePath = join(directory, path)
        mkdirSync(join(absolutePath, '..'), { recursive: true })
        writeFileSync(absolutePath, source)
      }

      const bundled = await build({
        bundle: true,
        define: {
          'import.meta.env.VITE_SERVER_URL': JSON.stringify(
            'https://ship-fast.test',
          ),
        },
        entryPoints: [join(directory, 'src/main.tsx')],
        format: 'iife',
        jsx: 'automatic',
        logLevel: 'silent',
        nodePaths: [join(process.cwd(), 'node_modules')],
        platform: 'browser',
        plugins: [
          {
            name: 'empty-css',
            setup(pluginBuild) {
              pluginBuild.onLoad({ filter: /\.css$/ }, () => ({
                contents: '',
                loader: 'js',
              }))
            },
          },
          {
            name: 'react-router-dom-stub',
            setup(pluginBuild) {
              pluginBuild.onResolve({ filter: /^react-router-dom$/ }, () => ({
                namespace: 'react-router-dom-stub',
                path: 'react-router-dom',
              }))
              pluginBuild.onLoad(
                {
                  filter: /^react-router-dom$/,
                  namespace: 'react-router-dom-stub',
                },
                () => ({
                  contents: `export function BrowserRouter({ children }) { return children; }
export function Routes({ children }) { return children; }
export function Route({ element }) { return element ?? null; }
export function Navigate() { return null; }
`,
                  loader: 'tsx',
                }),
              )
              pluginBuild.onResolve({ filter: /^@shoojs\/react$/ }, () => ({
                namespace: 'shoojs-stub',
                path: '@shoojs/react',
              }))
              pluginBuild.onResolve(
                { filter: /^react$/, namespace: 'shoojs-stub' },
                () => ({
                  path: join(process.cwd(), 'node_modules/react/index.js'),
                }),
              )
              pluginBuild.onLoad(
                { filter: /^@shoojs\/react$/, namespace: 'shoojs-stub' },
                () => ({
                  contents: `import React from "react";
const AuthContext = React.createContext({ identity: { userId: 'guest', email: null, name: null, picture: null }, signIn: () => {}, clearIdentity: () => {} });
export function useShooAuth() { return React.useContext(AuthContext); }
export function AuthProvider({ children }) { return React.createElement(React.Fragment, null, children); }
`,
                  loader: 'tsx',
                }),
              )
            },
          },
        ],
        write: false,
      })
      expect(bundled.outputFiles[0]?.text.length).toBeGreaterThan(1000)
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  })
})
