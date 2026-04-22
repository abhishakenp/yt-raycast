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
  // Keep .js extension for output
  outExtension: { '.js': '.js' },
})

console.log(`Built ${entryPoints.length} scripts to ${outDir}/`)
