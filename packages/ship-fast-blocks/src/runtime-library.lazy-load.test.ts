import { describe, expect, it, vi } from 'vitest'

const loaderModuleFactory = vi.hoisted(() =>
  vi.fn(() => ({
    runtimeComponentLoaders: {
      Stack: vi.fn(),
    },
  })),
)

vi.mock('./generated/runtime-component-loaders.ts', () => loaderModuleFactory())

describe('OpenUI runtime library lazy loading', () => {
  it('extracts component names without evaluating the generated loader table', async () => {
    const { extractOpenUIRuntimeComponentNames } =
      await import('./runtime-library.ts')

    expect(
      extractOpenUIRuntimeComponentNames('root = Stack(children=[Text("Hi")])'),
    ).toEqual(['Stack', 'Text'])
    expect(loaderModuleFactory).not.toHaveBeenCalled()
  })
})
