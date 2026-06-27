import { Buffer } from 'node:buffer'
import { brotliDecompressSync } from 'node:zlib'

import { library } from '@ship-fast/blocks'
import {
  reactExportSourcesBase64,
  reactExportSourcesEncoding,
} from '@ship-fast/blocks/generated'

import { describe, expect, it } from 'vitest'

import { getComponentSignature } from './openui-signature.ts'
import { FAMILIES } from './v2-compose.ts'

/**
 * Regression guard for the *KimiPage export breakage (commit a1920e59 deleted
 * registry components the engine still emitted via family+section names). The
 * v2 composer builds component names as `${family.name}${section}` (e.g.
 * `CafeNavbar`, `CafeHero`). If a component is removed from the library, the
 * export manifest, or the component-spec signatures, the engine will emit
 * sources that fail to parse/export — the exact regression class.
 *
 * This test asserts every component the engine CAN emit (across all families
 * and their sections) is resolvable in all three places: the component-spec
 * signature, the runtime library schema, and the export source manifest. It
 * runs offline (no model) and fails the moment a family section loses its
 * component in any of the three registries.
 */
describe('engine families ↔ library + manifest + signature consistency', () => {
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

  const engineEmittedComponentNames = (): string[] => {
    const names: string[] = []
    for (const family of FAMILIES.values()) {
      for (const section of family.sections) {
        names.push(`${family.name}${section}`)
      }
    }
    return [...new Set(names)]
  }

  it('every engine-emitted family+section component has a resolvable signature', () => {
    const missing: string[] = []
    for (const name of engineEmittedComponentNames()) {
      if (getComponentSignature(name) === null) missing.push(name)
    }
    expect(missing).toEqual([])
  })

  it('every engine-emitted family+section component exists in the runtime library schema', () => {
    const lib = libraryComponentNames()
    const missing = engineEmittedComponentNames().filter((n) => !lib.has(n))
    expect(missing).toEqual([])
  })

  it('every engine-emitted family+section component has an export manifest source', () => {
    const manifest = manifestComponentNames()
    const missing = engineEmittedComponentNames().filter(
      (n) => !manifest.has(n),
    )
    expect(missing).toEqual([])
  })
})
