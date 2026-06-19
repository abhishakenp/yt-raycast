import { Buffer } from 'node:buffer'
import { dirname, join } from 'node:path'
import { brotliDecompressSync } from 'node:zlib'
import {
  blockSourceFilesBase64,
  blockSourceFilesEncoding,
} from '@ship-fast/blocks/generated'

let blockSourceFileIndex: Record<string, string | undefined> | null = null

export const toPosixPath = (value: string): string => value.replaceAll('\\', '/')

export const sourcePathCandidates = (base: string): string[] => [
  base,
  `${base}.ts`,
  `${base}.tsx`,
  `${base}.js`,
  `${base}.jsx`,
  `${base}.mjs`,
  `${base}.cjs`,
  `${base}.json`,
  `${base}.css`,
  `${base}/index.ts`,
  `${base}/index.tsx`,
  `${base}/index.js`,
  `${base}/index.jsx`,
  `${base}/index.mjs`,
  `${base}/index.cjs`,
  `${base}/package.json`,
]

const parseJson = (source: string): unknown => JSON.parse(source)

const isStringRecord = (value: unknown): value is Record<string, string> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  return Object.keys(value).every(
    (key) =>
      typeof Object.getOwnPropertyDescriptor(value, key)?.value === 'string',
  )
}

export const getBlockSourceFileIndex = (): Record<
  string,
  string | undefined
> => {
  if (blockSourceFileIndex) return blockSourceFileIndex
  if (blockSourceFilesEncoding !== 'br+base64') {
    throw new Error(
      `Unsupported block source file manifest encoding: ${blockSourceFilesEncoding}`,
    )
  }
  const manifestJson = brotliDecompressSync(
    Buffer.from(blockSourceFilesBase64, 'base64'),
  ).toString('utf8')
  const parsed = parseJson(manifestJson)
  if (!isStringRecord(parsed)) {
    throw new Error('Block source file manifest must be a string record')
  }
  blockSourceFileIndex = parsed
  return blockSourceFileIndex
}

export const getBlockSourceFile = (sourcePath: string): string => {
  const source = getBlockSourceFileIndex()[sourcePath]
  if (source === undefined) {
    throw new Error(`Cannot find block dependency source: ${sourcePath}`)
  }
  return source
}

export const normalizeBlockSourceRelPath = (sourceRelPath: string): string =>
  toPosixPath(sourceRelPath)
    .replace(/^packages\/ship-fast-blocks\//, '')
    .replace(/^src\//, '')
    .replace(/\.(ts|tsx|js|jsx|mjs|json|css)$/, '')

export const resolveBlockSourceManifestPath = (
  sourceRelPath: string,
): string | null => {
  const normalizedRel = normalizeBlockSourceRelPath(sourceRelPath)
  const sourceFiles = getBlockSourceFileIndex()
  const candidates = sourcePathCandidates(`src/${normalizedRel}`)
  return (
    candidates.find((candidate) => sourceFiles[candidate] !== undefined) ?? null
  )
}

export const resolveRelativeBlockSourcePath = (
  sourcePath: string,
  moduleName: string,
): string | null => {
  const normalizedSourcePath = toPosixPath(sourcePath).replace(
    /^packages\/ship-fast-blocks\//,
    '',
  )
  return resolveBlockSourceManifestPath(
    toPosixPath(join(dirname(normalizedSourcePath), moduleName)),
  )
}
