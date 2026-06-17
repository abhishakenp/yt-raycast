import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { preprocessOpenUIRuntimeResponse } from './openui-runtime-preprocess'

describe('preprocessOpenUIRuntimeResponse', () => {
  it('repairs streaming syntax without resolving spec-aware section labels', () => {
    const source = [
      '```openui',
      'hero = Hero("Ship Fast", [Image("https://images.example.com/',
      'root = Page([hero, Action("click")',
    ].join('\n')

    const result = preprocessOpenUIRuntimeResponse(source)

    expect(result).not.toContain('```')
    expect(result).not.toContain('Action(')
    expect(result).toContain('hero = Hero(')
    expect(result).toContain('root = Page(')
    expect(result).toContain('Image("https://images.example.com/")')
  })

  it('keeps OpenUIViewer independent from engine preprocessing metadata', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/island/openui/OpenUIViewer.tsx'),
      'utf8',
    )

    expect(source).not.toContain(
      'packages/ship-fast-engine/src/lib/openui-preprocess',
    )
    expect(source).not.toContain('@ship-fast/engine')
    expect(source).toContain('@ship-fast/blocks/runtime')
    expect(source).not.toContain("@ship-fast/blocks'")
    expect(source).not.toContain('shipFastOpenUILibrary')
  })

  it('keeps OpenUI island providers off the eager blocks root export', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/island/openui/_providers/translation.tsx'),
      'utf8',
    )

    expect(source).toContain('@ship-fast/blocks/runtime')
    expect(source).not.toContain('@ship-fast/blocks";')
  })
})
