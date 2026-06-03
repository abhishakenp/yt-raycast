import { build } from 'esbuild'
import { readdirSync } from 'fs'
import { join } from 'path'

const srcDir = 'src/scripts'
const outDir = 'public/scripts'

// Get all .ts files in src/scripts/
const entryPoints = Array.from(
  new Set([
    ...readdirSync(srcDir)
      .filter((f) => f.endsWith('.ts'))
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
  minify: false,
  external: ['franc-min'],
  // Keep .js extension for output
  outExtension: { '.js': '.js' },
  // Match React's NODE_ENV: dev/undefined builds get dev affordances; production build must not.
  define: {
    __SF_DEV_SCRIPTS__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
})

await build({
  entryPoints: ['src/island/openui/entry.tsx'],
  bundle: true,
  outfile: 'public/scripts/openui-island.js',
  format: 'esm',
  target: ['es2020'],
  platform: 'browser',
  jsx: 'automatic',
  sourcemap: false,
  minify: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env': '{}',
  },
})

console.log(`Built ${entryPoints.length + 1} scripts to ${outDir}/`)
