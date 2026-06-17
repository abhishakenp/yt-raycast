import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readViteConfig = () =>
  readFileSync(join(process.cwd(), 'vite.config.ts'), 'utf8')

describe('Vite OpenUI chunk boundaries', () => {
  it('keeps generated metadata out of the browser runtime chunk group', () => {
    const source = readViteConfig()

    expect(source).toContain("name: 'openui-generated-metadata'")
    expect(source).toContain('test: isOpenUIGeneratedMetadataModule')
    expect(source).toContain('const isOpenUIRuntimeModule')
    expect(source).toMatch(
      /isOpenUIBlocksSourceModule\(moduleId\)\s*&&\s*!\s*isOpenUIGeneratedMetadataModule\(moduleId\)/,
    )
  })

  it('splits OpenUI runtime components by primitive, section, capsule, and core groups', () => {
    const source = readViteConfig()

    expect(source).toContain('const getOpenUIRuntimeChunkName')
    expect(source).toContain(
      'openui-primitive-${getOpenUIFileBaseName(moduleId)}',
    )
    expect(source).toContain('openui-section-${sanitizeChunkName(vertical ??')
    expect(source).toContain(
      'openui-capsule-${getOpenUIFileBaseName(moduleId)}',
    )
    expect(source).toContain("return 'openui-runtime-core'")
    expect(source).toContain('name: getOpenUIRuntimeChunkName')
    expect(source).toContain(
      'test: (moduleId) => getOpenUIRuntimeChunkName(moduleId) !== null',
    )
  })

  it('keeps generated engine prompt specs in a separate server-oriented chunk group', () => {
    const source = readViteConfig()

    expect(source).toContain('const isOpenUIPromptSpecModule')
    expect(source).toContain('/packages/ship-fast-engine/src/genui/generated/')
    expect(source).toContain('/packages/ship-fast-engine/src/generated/')
    expect(source).toContain("name: 'openui-prompt-spec'")
    expect(source).toContain('test: isOpenUIPromptSpecModule')
  })
})
