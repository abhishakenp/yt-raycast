import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const STUDIO_ROOT = join(REPO_ROOT, 'studio')

const SKIP_DIRS = new Set(['node_modules', 'dist', '.sanity', '.git'])

export function collectShipFastStudioFiles() {
  const out = {}
  if (!existsSync(STUDIO_ROOT)) return out
  const walk = (dir) => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, name.name)
      if (name.isDirectory()) {
        if (SKIP_DIRS.has(name.name)) continue
        walk(p)
      } else {
        const rel = relative(STUDIO_ROOT, p).replace(/\\/g, '/')
        out[`studio/${rel}`] = readFileSync(p)
      }
    }
  }
  walk(STUDIO_ROOT)
  return out
}
