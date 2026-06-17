import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import prettier from 'prettier'

export const capsuleClassificationPath =
  'packages/ship-fast-blocks/src/capsules/source-classification.json'

const capsuleRoot = 'packages/ship-fast-blocks/src/capsules'
const generatorPath = 'scripts/verify-capsule-source-classification.ts'
const generatedPortPattern =
  /(?:Kimi-generated|generated Kimi HTML|converted from generated Kimi HTML)/i
const capsuleExportPattern =
  /export\s+const\s+([A-Za-z_$][\w$]*)\s*=\s*defineCapsule\s*\(/g

export type CapsuleSourceOrigin = 'generated-kimi-port' | 'unmarked-source'

export type CapsuleSourceClassificationEntry = {
  exports: string[]
  file: string
  large: boolean
  lines: number
  origin: CapsuleSourceOrigin
}

export type CapsuleSourceClassification = {
  generatedBy: string
  largeFileThreshold: number
  sourceRoot: string
  summary: {
    generatedKimiPortFiles: number
    largeFiles: number
    maxLines: number
    totalFiles: number
    totalLines: number
    unmarkedSourceFiles: number
  }
  files: CapsuleSourceClassificationEntry[]
}

export function classifyCapsuleSourceOrigin(
  source: string,
): CapsuleSourceOrigin {
  return generatedPortPattern.test(source)
    ? 'generated-kimi-port'
    : 'unmarked-source'
}

export function extractCapsuleExports(source: string): string[] {
  capsuleExportPattern.lastIndex = 0
  return [...source.matchAll(capsuleExportPattern)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b))
}

export function countSourceLines(source: string): number {
  if (source.length === 0) return 0
  return source.endsWith('\n')
    ? source.slice(0, -1).split('\n').length
    : source.split('\n').length
}

export function buildCapsuleSourceClassification(
  root = process.cwd(),
): CapsuleSourceClassification {
  const absoluteCapsuleRoot = join(root, capsuleRoot)
  const files = readdirSync(absoluteCapsuleRoot)
    .filter((file) => file.endsWith('.tsx') && !file.endsWith('.test.tsx'))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const path = join(absoluteCapsuleRoot, file)
      const source = readFileSync(path, 'utf8')
      const lines = countSourceLines(source)

      return {
        exports: extractCapsuleExports(source),
        file: relative(root, path).replaceAll('\\', '/'),
        large: lines > 1_000,
        lines,
        origin: classifyCapsuleSourceOrigin(source),
      }
    })

  const generatedKimiPortFiles = files.filter(
    ({ origin }) => origin === 'generated-kimi-port',
  ).length
  const unmarkedSourceFiles = files.length - generatedKimiPortFiles
  const largeFiles = files.filter(({ large }) => large).length

  return {
    generatedBy: generatorPath,
    largeFileThreshold: 1_000,
    sourceRoot: capsuleRoot,
    summary: {
      generatedKimiPortFiles,
      largeFiles,
      maxLines: Math.max(0, ...files.map(({ lines }) => lines)),
      totalFiles: files.length,
      totalLines: files.reduce((total, { lines }) => total + lines, 0),
      unmarkedSourceFiles,
    },
    files,
  }
}

export function renderCapsuleSourceClassificationSource(
  classification: CapsuleSourceClassification,
) {
  return `${JSON.stringify(classification, null, 2)}\n`
}

export function renderCapsuleSourceClassification(
  classification: CapsuleSourceClassification,
) {
  return prettier.format(
    renderCapsuleSourceClassificationSource(classification),
    { parser: 'json' },
  )
}

export async function verifyCapsuleSourceClassification(root = process.cwd()) {
  const path = join(root, capsuleClassificationPath)
  const expected = await renderCapsuleSourceClassification(
    buildCapsuleSourceClassification(root),
  )

  if (process.argv.includes('--write')) {
    writeFileSync(path, expected)
    console.log(`Wrote ${capsuleClassificationPath}`)
    return
  }

  if (!existsSync(path) || readFileSync(path, 'utf8') !== expected) {
    throw new Error(
      `${capsuleClassificationPath} is out of date. Run bun scripts/verify-capsule-source-classification.ts --write.`,
    )
  }

  console.log('Capsule source classification is current')
}

if (process.argv[1]?.endsWith('verify-capsule-source-classification.ts')) {
  await verifyCapsuleSourceClassification()
}
