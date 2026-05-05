import { build } from 'esbuild'
import { copyFileSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'

const srcDir = 'src/scripts'
const outDir = 'public/scripts'

// CSS pass: copy src/styles/*.css → public/styles/. Express SSR home page
// links /styles/index.css from public/, but the source-of-truth files live
// in src/styles/. Without this, /styles/index.css 404s and the dashboard
// renders unstyled.
const cssSrcDir = 'src/styles'
const cssOutDir = 'public/styles'
mkdirSync(cssOutDir, { recursive: true })
for (const f of readdirSync(cssSrcDir)) {
  if (!f.endsWith('.css')) continue
  copyFileSync(join(cssSrcDir, f), join(cssOutDir, f))
}

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
