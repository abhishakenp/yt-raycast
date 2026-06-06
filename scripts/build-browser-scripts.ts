import { build } from 'esbuild'
import { execFile } from 'node:child_process'
import { readdirSync } from 'fs'
import { join } from 'path'
import { promisify } from 'node:util'

const srcDir = 'src/scripts'
const outDir = 'public/scripts'
const execFileAsync = promisify(execFile)

// Get all .ts files in src/scripts/
const entryPoints = Array.from(
  new Set([
    ...readdirSync(srcDir)
      .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
      .map((f) => join(srcDir, f)),
    'src/scripts/dashboard-main.ts',
  ]),
)

await build({
  entryPoints,
  bundle: true,
  outdir: outDir,
  format: 'esm',
  target: ['es2020'],
  platform: 'browser',
  jsx: 'automatic',
  sourcemap: false,
  minify: true,
  external: ['franc-min'],
  // Keep .js extension for output
  outExtension: { '.js': '.js' },
  // Match React's NODE_ENV: dev/undefined builds get dev affordances; production build must not.
  define: {
    __SF_DEV_SCRIPTS__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
})

// Build openui-island bundle for client-side React rendering
await build({
  entryPoints: [{ in: 'src/island/openui/entry.tsx', out: 'openui-island' }],
  bundle: true,
  outdir: 'public/scripts',
  format: 'esm',
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
  target: ['es2020'],
  platform: 'browser',
  jsx: 'automatic',
  sourcemap: false,
  minify: true,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env': '{}',
  },
})

// Tailwind v4 moved the CLI out of the `tailwindcss` package into
// `@tailwindcss/cli` (the base package no longer ships a bin), so `bunx
// tailwindcss` only resolves when @tailwindcss/cli happens to have installed a
// `tailwindcss` shim. Invoke the v4 CLI package directly so the CSS build never
// depends on that shim being present.
await execFileAsync('bunx', [
  '@tailwindcss/cli',
  '-i',
  'src/styles/openui-preview-tailwind.css',
  '-o',
  'public/styles/openui-preview-tailwind.css',
  '--minify',
])

console.log(`Built ${entryPoints.length + 1} scripts to ${outDir}/ and OpenUI preview CSS`)
