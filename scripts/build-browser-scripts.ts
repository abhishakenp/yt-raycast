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
  sourcemap: false,
  minify: false,
  external: ['firebase/app', 'firebase/auth', 'franc-min'],
  // Keep .js extension for output
  outExtension: { '.js': '.js' },
  // Match React's NODE_ENV: dev/undefined builds get dev affordances; production build must not.
  define: {
    __SF_DEV_SCRIPTS__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
})

console.log(`Built ${entryPoints.length} scripts to ${outDir}/`)
