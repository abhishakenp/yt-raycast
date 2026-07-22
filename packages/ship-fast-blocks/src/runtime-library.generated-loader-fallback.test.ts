import { describe, expect, it, vi } from 'vitest'

import type { RuntimeComponentName } from './generated/runtime-component-names'

vi.mock('./generated/runtime-component-loaders.ts', () => {
  throw new TypeError('(intermediate value).glob is not a function')
})

describe('OpenUI runtime generated loader fallback', () => {
  it('loads static registry capsules when generated loaders cannot run', async () => {
    const { loadOpenUIRuntimeComponent, loadOpenUIRuntimeLibrary } =
      await import('./runtime-library.ts')
    const stackName = 'Stack' satisfies RuntimeComponentName

    const capsule = await loadOpenUIRuntimeComponent(stackName)
    const library = await loadOpenUIRuntimeLibrary(`
      root = Stack(children=[heading])
      heading = Heading(text="Portable export")
    `)

    expect(capsule.name).toBe(stackName)
    expect(library.components.Stack).toBeTruthy()
    expect(library.components.Heading).toBeTruthy()
  })
})
