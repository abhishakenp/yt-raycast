import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const temporaryDirectories: string[] = []
const scriptDirectory = dirname(fileURLToPath(import.meta.url))

const loadBootstrap = async () => {
  const moduleUrl = pathToFileURL(
    join(scriptDirectory, 'generated-entrypoint-bootstrap.mjs'),
  ).href
  try {
    const loaded: unknown = await import(/* @vite-ignore */ moduleUrl)
    if (!loaded || typeof loaded !== 'object') return null
    if (
      !('createGeneratedIndexSource' in loaded) ||
      typeof loaded.createGeneratedIndexSource !== 'function' ||
      !('ensureLakebedBootstrapArtifacts' in loaded) ||
      typeof loaded.ensureLakebedBootstrapArtifacts !== 'function'
    ) {
      return null
    }
    return {
      createGeneratedIndexSource: loaded.createGeneratedIndexSource,
      ensureLakebedBootstrapArtifacts: loaded.ensureLakebedBootstrapArtifacts,
    }
  } catch {
    return null
  }
}

describe('generated entrypoint bootstrap', () => {
  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('defines the generated package entrypoint used by clean builds', async () => {
    const bootstrap = await loadBootstrap()

    expect(bootstrap).not.toBeNull()
    if (!bootstrap) return

    expect(bootstrap.createGeneratedIndexSource()).toContain(
      "from './lakebed-export-deps.compressed'",
    )
    expect(bootstrap.createGeneratedIndexSource()).toContain(
      "from './react-export-sources.compressed'",
    )
    expect(bootstrap.createGeneratedIndexSource()).toContain(
      "from './capsule-categories'",
    )
    expect(bootstrap.createGeneratedIndexSource()).toContain(
      "from './component-spec.json'",
    )
  })

  it('creates importable Lakebed placeholders without overwriting generated output', async () => {
    const bootstrap = await loadBootstrap()
    expect(bootstrap).not.toBeNull()
    if (!bootstrap) return

    const directory = mkdtempSync(join(tmpdir(), 'ship-fast-generated-'))
    temporaryDirectories.push(directory)
    bootstrap.ensureLakebedBootstrapArtifacts(directory)

    const dependenciesPath = join(
      directory,
      'lakebed-export-deps.compressed.ts',
    )
    const appCssPath = join(directory, 'lakebed-app-css-sources.compressed.ts')
    expect(readFileSync(dependenciesPath, 'utf8')).toContain(
      'lakebedExportComponentChunks',
    )
    expect(readFileSync(appCssPath, 'utf8')).toContain(
      'lakebedAppCssSourcesBase64',
    )

    writeFileSync(dependenciesPath, 'preserve-generated-dependencies')
    bootstrap.ensureLakebedBootstrapArtifacts(directory)
    expect(readFileSync(dependenciesPath, 'utf8')).toBe(
      'preserve-generated-dependencies',
    )
  })
})
