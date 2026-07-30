import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, relative, resolve } from 'node:path'
import { brotliCompressSync, brotliDecompressSync, constants } from 'node:zlib'
import { fileURLToPath, pathToFileURL } from 'node:url'
import prettier from 'prettier'
import { ensureLakebedBootstrapArtifacts } from '../../../scripts/generated-entrypoint-bootstrap.mjs'

const blocksRoot = join(fileURLToPath(new URL('..', import.meta.url)))
const repoRoot = join(blocksRoot, '..', '..')
const outFile = join(
  blocksRoot,
  'src',
  'generated',
  'lakebed-export-deps.compressed.ts',
)
const outAppCssFile = join(
  blocksRoot,
  'src',
  'generated',
  'lakebed-app-css-sources.compressed.ts',
)
const reactExportSourcesFile = join(
  blocksRoot,
  'src',
  'generated',
  'react-export-sources.json',
)
const generatorPath =
  'packages/ship-fast-blocks/scripts/generate-lakebed-export-deps.ts'
const generatorVersion = 2
const isCheckMode = process.argv.includes('--check')
const inputSignatureFiles = [
  join(blocksRoot, 'src', 'generated', 'react-export-sources.compressed.ts'),
  join(blocksRoot, 'src', 'generated', 'block-source-files.compressed.ts'),
  join(blocksRoot, 'src', 'generated', 'vendor-source-files.compressed.ts'),
  join(
    repoRoot,
    'src',
    'features',
    'exports',
    'services',
    'openui-lakebed-export-builder.ts',
  ),
  fileURLToPath(import.meta.url),
]
const localCssImportPattern =
  /@import\s+(?:url\()?['"]([^'"]+\.css)['"]\)?\s*;/g

const toPosixPath = (value: string) => value.replaceAll('\\', '/')

const readAppCssSourceFiles = () => {
  const files: Record<string, string> = {}
  const seen = new Set<string>()
  const visit = (path: string) => {
    const absolutePath = resolve(path)
    if (seen.has(absolutePath) || !existsSync(absolutePath)) return
    seen.add(absolutePath)

    const source = readFileSync(absolutePath, 'utf8')
    files[toPosixPath(relative(repoRoot, absolutePath))] = source

    for (const match of source.matchAll(localCssImportPattern)) {
      const specifier = match[1]
      if (!specifier?.startsWith('.')) continue
      visit(join(dirname(absolutePath), specifier))
    }
  }

  visit(join(repoRoot, 'src', 'styles.css'))
  return Object.fromEntries(
    Object.entries(files).sort(([a], [b]) => a.localeCompare(b)),
  )
}

const formatGeneratedSource = async (path: string, source: string) => {
  const config = await prettier.resolveConfig(path)
  return await prettier.format(source, { ...config, filepath: path })
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const readInputSignature = () => {
  const hash = createHash('sha256')
  hash.update(`lakebed-export-deps-v${generatorVersion}\n`)
  for (const path of inputSignatureFiles) {
    hash.update(`${relative(repoRoot, path)}\n`)
    hash.update(readFileSync(path))
    hash.update('\n')
  }
  for (const [path, source] of Object.entries(readAppCssSourceFiles())) {
    hash.update(`${path}\n`)
    hash.update(source)
    hash.update('\n')
  }
  return hash.digest('hex')
}

const loadManifest = async () => {
  const modulePath = join(
    repoRoot,
    'src',
    'features',
    'exports',
    'services',
    'openui-lakebed-export-builder.ts',
  )
  const module = await import(pathToFileURL(modulePath).href)
  const buildManifest = module.buildLakebedExportDependencyManifestForGenerator
  if (typeof buildManifest !== 'function') {
    throw new Error('Lakebed dependency manifest generator API is missing')
  }
  return buildManifest(readDefaultComponentNames())
}

const readDefaultComponentNames = () => {
  const source: unknown = JSON.parse(
    readFileSync(reactExportSourcesFile, 'utf8'),
  )
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error('React export source manifest is missing or invalid')
  }
  return Object.entries(source)
    .flatMap(([componentName, entry]) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return []
      const componentSource = 'source' in entry ? entry.source : null
      if (typeof componentSource !== 'string') return []
      return [componentName]
    })
    .sort()
}

const readGeneratedManifestJson = (): string | null => {
  if (!existsSync(outFile)) return null
  const source = readFileSync(outFile, 'utf8')
  const match = source.match(/lakebedExportDepsBase64\s*=\s*'([^']+)'/s)
  if (!match) return null
  return brotliDecompressSync(Buffer.from(match[1], 'base64')).toString('utf8')
}

const readGeneratedInputSignature = (): string | null => {
  const json = readGeneratedManifestJson()
  if (!json) return null
  const parsed: unknown = JSON.parse(json)
  if (!isRecord(parsed) || !isRecord(parsed.metadata)) return null
  if (parsed.metadata.generatorVersion !== generatorVersion) return null
  const inputSignature = parsed.metadata.inputSignature
  return typeof inputSignature === 'string' ? inputSignature : null
}

const writeGeneratedFile = async () => {
  const inputSignature = readInputSignature()

  if (isCheckMode) {
    if (readGeneratedInputSignature() !== inputSignature) {
      throw new Error(
        `Generated Lakebed export dependency manifest is out of date. Run bun run generate:lakebed-export-deps.\n- ${relative(blocksRoot, outFile)}`,
      )
    }
    console.log('Generated Lakebed export dependency manifest is current')
    return
  }

  const manifest = await loadManifest()
  const appCssFiles = readAppCssSourceFiles()
  const compressChunk = (value: unknown) =>
    brotliCompressSync(Buffer.from(JSON.stringify(value)), {
      params: { [constants.BROTLI_PARAM_QUALITY]: 4 },
    }).toString('base64')
  const componentChunks = Object.fromEntries(
    Object.entries(manifest.components).map(([name, entry]) => [
      name,
      compressChunk(entry),
    ]),
  )
  const fileChunks = Object.fromEntries(
    Object.entries(manifest.files).map(([path, source]) => [
      path,
      compressChunk(source ?? ''),
    ]),
  )
  const json = `${JSON.stringify(
    {
      metadata: {
        generatorVersion,
        inputSignature,
      },
      ...manifest,
      appCssFiles,
    },
    null,
    2,
  )}\n`
  const compressed = brotliCompressSync(Buffer.from(json), {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).toString('base64')
  const source = await formatGeneratedSource(
    outFile,
    `// This file is generated by ${generatorPath}.
export const lakebedExportDepsEncoding = 'br+base64' as const
export const lakebedExportDepsBase64 = '${compressed}' as const
export const lakebedExportDepsChunkEncoding = 'br+base64-json' as const
export const lakebedExportComponentChunks = ${JSON.stringify(componentChunks, null, 2)} as const
export const lakebedExportFileChunks = ${JSON.stringify(fileChunks, null, 2)} as const
`,
  )
  const appCssCompressed = brotliCompressSync(
    Buffer.from(`${JSON.stringify(appCssFiles, null, 2)}\n`),
    {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    },
  ).toString('base64')
  const appCssSource = await formatGeneratedSource(
    outAppCssFile,
    `// This file is generated by ${generatorPath}.
export const lakebedAppCssSourcesEncoding = 'br+base64' as const
export const lakebedAppCssSourcesBase64 = '${appCssCompressed}' as const
`,
  )

  writeFileSync(outFile, source)
  writeFileSync(outAppCssFile, appCssSource)
  console.log(
    `lakebed-export-deps.compressed.ts regenerated: ${Object.keys(manifest.components).length} components, ${Object.keys(manifest.files).length} files`,
  )
}

if (!isCheckMode) {
  ensureLakebedBootstrapArtifacts(join(blocksRoot, 'src', 'generated'))
}
await writeGeneratedFile()
