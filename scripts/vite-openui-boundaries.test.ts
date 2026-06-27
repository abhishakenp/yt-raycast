import { describe, expect, it } from 'vitest'

import viteConfig from '../vite.config.ts'

type CodeSplittingGroup = {
  name: string | ((moduleId: string) => string | null)
  test: (moduleId: string) => boolean
  priority: number
}

type RolldownOutputOptions = {
  codeSplitting?: { groups: CodeSplittingGroup[] }
}

const rolldownOutput = viteConfig.build?.rolldownOptions?.output as unknown as
  | RolldownOutputOptions
  | RolldownOutputOptions[]
  | undefined

const codeSplitting = Array.isArray(rolldownOutput)
  ? rolldownOutput[0]?.codeSplitting
  : rolldownOutput?.codeSplitting

const groups = (codeSplitting?.groups ?? []) as CodeSplittingGroup[]

const findGroup = (name: string) => groups.find((g) => g.name === name) ?? null

const runtimeGroup = groups.find((g) => typeof g.name === 'function') as
  | CodeSplittingGroup
  | undefined

const runtimeChunkName = (moduleId: string) =>
  (runtimeGroup?.name as (moduleId: string) => string | null)(moduleId)

const runtimeTest = (moduleId: string) => runtimeGroup?.test(moduleId) ?? false

describe('Vite OpenUI chunk boundaries', () => {
  it('keeps generated metadata out of the browser runtime chunk group', () => {
    const metadataGroup = findGroup('openui-generated-metadata')
    expect(metadataGroup).not.toBeNull()
    expect(metadataGroup?.priority).toBe(30)

    const generatedModule =
      '/packages/ship-fast-blocks/src/generated/metadata.json'
    expect(metadataGroup?.test(generatedModule)).toBe(true)

    // Generated metadata must not be classified as a runtime chunk.
    expect(runtimeChunkName(generatedModule)).toBeNull()
    expect(runtimeTest(generatedModule)).toBe(false)
  })

  it('splits OpenUI runtime components by primitive, section, capsule, and core groups', () => {
    expect(runtimeGroup).toBeDefined()
    expect(runtimeGroup?.priority).toBe(10)

    const primitiveModule =
      '/packages/ship-fast-blocks/src/registry/primitives/Button.tsx'
    expect(runtimeTest(primitiveModule)).toBe(true)
    expect(runtimeChunkName(primitiveModule)).toBe('openui-primitive-button')

    const sectionModule =
      '/packages/ship-fast-blocks/src/registry/sections/blog/Hero.tsx'
    expect(runtimeTest(sectionModule)).toBe(true)
    expect(runtimeChunkName(sectionModule)).toBe('openui-section-blog')

    const capsuleModule = '/packages/ship-fast-blocks/src/capsules/Card.tsx'
    expect(runtimeTest(capsuleModule)).toBe(true)
    expect(runtimeChunkName(capsuleModule)).toBe('openui-capsule-card')

    const coreModule = '/packages/ship-fast-blocks/src/index.ts'
    expect(runtimeTest(coreModule)).toBe(true)
    expect(runtimeChunkName(coreModule)).toBe('openui-runtime-core')
  })

  it('keeps generated engine prompt specs in a separate server-oriented chunk group', () => {
    const promptSpecGroup = findGroup('openui-prompt-spec')
    expect(promptSpecGroup).not.toBeNull()
    expect(promptSpecGroup?.priority).toBe(20)

    const genuiModule = '/packages/ship-fast-engine/src/genui/generated/spec.ts'
    expect(promptSpecGroup?.test(genuiModule)).toBe(true)

    const generatedModule = '/packages/ship-fast-engine/src/generated/spec.ts'
    expect(promptSpecGroup?.test(generatedModule)).toBe(true)

    // Prompt specs must not be classified as runtime chunks.
    expect(runtimeChunkName(genuiModule)).toBeNull()
    expect(runtimeTest(genuiModule)).toBe(false)
  })

  it('leaves unrelated modules outside every OpenUI chunk group', () => {
    const unrelatedModule = '/src/app/unrelated.ts'
    expect(runtimeTest(unrelatedModule)).toBe(false)
    expect(runtimeChunkName(unrelatedModule)).toBeNull()
    for (const group of groups) {
      expect(group.test(unrelatedModule)).toBe(false)
    }
  })
})
