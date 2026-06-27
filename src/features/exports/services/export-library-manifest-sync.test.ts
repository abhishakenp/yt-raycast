import { Buffer } from 'node:buffer'
import { brotliDecompressSync } from 'node:zlib'

import { library } from '@ship-fast/blocks'
import {
  reactExportSourcesBase64,
  reactExportSourcesEncoding,
} from '@ship-fast/blocks/generated'

import { describe, expect, it } from 'vitest'

/**
 * Regression guard for the *KimiPage export breakage (commit a1920e59 deleted
 * registry components without keeping the export manifest in sync). The export
 * pipeline resolves component source from the react-export-sources manifest,
 * while the OpenUI parser validates against the runtime library schema. If the
 * two drift, exports fail with "unknown component" or "React export does not
 * support unknown component" for sources the parser accepts.
 *
 * This test asserts the two stay in lockstep: every manifest entry must exist
 * in the library schema, and every library component must have a manifest
 * source. It runs in milliseconds (no parsing, no model) and fails the moment
 * a component is added/removed from one but not the other.
 */
describe('library ↔ export-manifest sync', () => {
  const libraryComponentNames = (): Set<string> => {
    const schema = library.toJSONSchema()
    const defs = (schema.$defs ?? {}) as Record<string, unknown>
    return new Set(Object.keys(defs))
  }

  const manifestComponentNames = (): Set<string> => {
    if (reactExportSourcesEncoding !== 'br+base64') {
      throw new Error(
        `Unexpected manifest encoding: ${reactExportSourcesEncoding}`,
      )
    }
    const json = brotliDecompressSync(
      Buffer.from(reactExportSourcesBase64, 'base64'),
    ).toString('utf8')
    const manifest = JSON.parse(json) as Record<
      string,
      { source?: unknown } | undefined
    >
    return new Set(
      Object.entries(manifest)
        .filter(([, entry]) => entry && typeof entry.source === 'string')
        .map(([name]) => name),
    )
  }

  it('every manifest component exists in the runtime library schema', () => {
    const lib = libraryComponentNames()
    const manifest = manifestComponentNames()
    const missing = [...manifest].filter((name) => !lib.has(name))
    expect(missing).toEqual([])
  })

  it('every library component has a manifest source entry', () => {
    const lib = libraryComponentNames()
    const manifest = manifestComponentNames()
    const missing = [...lib].filter((name) => !manifest.has(name))
    expect(missing).toEqual([])
  })

  it('library and manifest component counts match', () => {
    const lib = libraryComponentNames()
    const manifest = manifestComponentNames()
    expect(manifest.size).toBe(lib.size)
  })
})
