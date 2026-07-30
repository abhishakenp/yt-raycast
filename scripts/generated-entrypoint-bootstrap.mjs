import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const createGeneratedIndexSource =
  () => `import componentSpec from './component-spec.json'
export {
  reactExportSourcesBase64,
  reactExportSourcesEncoding,
} from './react-export-sources.compressed'
export {
  blockSourceFilesBase64,
  blockSourceFilesEncoding,
} from './block-source-files.compressed'
export {
  vendorSourceFilesBase64,
  vendorSourceFilesEncoding,
} from './vendor-source-files.compressed'
export {
  lakebedExportComponentChunks,
  lakebedExportDepsBase64,
  lakebedExportDepsChunkEncoding,
  lakebedExportDepsEncoding,
  lakebedExportFileChunks,
} from './lakebed-export-deps.compressed'
export {
  lakebedAppCssSourcesBase64,
  lakebedAppCssSourcesEncoding,
} from './lakebed-app-css-sources.compressed'
export { capsuleCategories, findSimilarCapsules } from './capsule-categories'

export { componentSpec }
`

const lakebedDependenciesBootstrapSource = `export const lakebedExportDepsEncoding = 'br+base64' as const
export const lakebedExportDepsBase64 = '' as const
export const lakebedExportDepsChunkEncoding = 'br+base64-json' as const
export const lakebedExportComponentChunks = {} as const
export const lakebedExportFileChunks = {} as const
`

const lakebedAppCssBootstrapSource = `export const lakebedAppCssSourcesEncoding = 'br+base64' as const
export const lakebedAppCssSourcesBase64 = '' as const
`

const writeWhenMissing = (path, source) => {
  if (!existsSync(path)) writeFileSync(path, source)
}

export const ensureLakebedBootstrapArtifacts = (generatedDirectory) => {
  mkdirSync(generatedDirectory, { recursive: true })
  writeWhenMissing(
    join(generatedDirectory, 'lakebed-export-deps.compressed.ts'),
    lakebedDependenciesBootstrapSource,
  )
  writeWhenMissing(
    join(generatedDirectory, 'lakebed-app-css-sources.compressed.ts'),
    lakebedAppCssBootstrapSource,
  )
}
