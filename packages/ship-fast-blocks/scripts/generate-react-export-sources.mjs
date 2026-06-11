import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('..', import.meta.url)))
const registryRoot = join(root, 'src', 'registry')
const capsulesRoot = join(root, 'src', 'capsules')
const outFile = join(root, 'src', 'generated', 'react-export-sources.json')

const walk = (dir, files = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(path, files)
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      files.push(path)
    }
  }
  return files
}

const componentRe = /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*define(?:Component|Capsule)\s*\(/g
const manifest = {}

for (const sourceRoot of [registryRoot, capsulesRoot]) {
  for (const file of walk(sourceRoot)) {
    const source = readFileSync(file, 'utf8')
    componentRe.lastIndex = 0
    for (const match of source.matchAll(componentRe)) {
      const name = match[1]
      manifest[name] = {
        file: relative(root, file).replaceAll('\\', '/'),
        source,
      }
    }
  }
}

writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Wrote ${Object.keys(manifest).length} component sources to ${relative(root, outFile)}`)
