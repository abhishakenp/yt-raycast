import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  extractOpenUIRuntimeComponentNames,
  getOpenUIRuntimeLibraryCacheKey,
} from './runtime-library'

describe('OpenUI runtime library loading', () => {
  it('extracts only known component calls and always includes the Stack root', () => {
    const names = extractOpenUIRuntimeComponentNames(`
      root = PageSwitch(routes=["Home"], pages=[home])
      home = SaasKimiPage(title="Launch")
      body = Text("Ignore UnknownWidget(")
      missing = UnknownWidget()
    `)

    expect(names).toEqual(['PageSwitch', 'SaasKimiPage', 'Stack', 'Text'])
  })

  it('uses a stable cache key for equivalent component sets', () => {
    expect(
      getOpenUIRuntimeLibraryCacheKey('root = Text("Hi")\npage = Stack([])'),
    ).toBe(
      getOpenUIRuntimeLibraryCacheKey('page = Stack([])\nroot = Text("Hi")'),
    )
  })

  it('keeps runtime loaders dynamic and independent from generated source manifests', () => {
    const runtimeLibrarySource = readFileSync(
      join(process.cwd(), 'packages/ship-fast-blocks/src/runtime-library.ts'),
      'utf8',
    )
    const runtimeLoadersSource = readFileSync(
      join(
        process.cwd(),
        'packages/ship-fast-blocks/src/generated/runtime-component-loaders.ts',
      ),
      'utf8',
    )

    expect(runtimeLibrarySource).toContain(
      './generated/runtime-component-loaders.ts',
    )
    expect(runtimeLibrarySource).not.toContain('./library')
    expect(runtimeLibrarySource).not.toContain('./generated/index')
    expect(runtimeLibrarySource).not.toContain('react-export-sources')
    expect(runtimeLibrarySource).not.toContain('component-spec')
    expect(runtimeLoadersSource).toMatch(/\(\(\)\s*=>\s*import\(/)
    expect(runtimeLoadersSource).toContain('../registry/')
    expect(runtimeLoadersSource).toContain('../capsules/')
    expect(runtimeLoadersSource).not.toContain('../index')
    expect(runtimeLoadersSource).not.toContain('../library')
    expect(runtimeLoadersSource).not.toMatch(
      /(?:from|import\()\s*['"][^'"]*react-export-sources/,
    )
    expect(runtimeLoadersSource).not.toContain('component-spec')
  })
})
