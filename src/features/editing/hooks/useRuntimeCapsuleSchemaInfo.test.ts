import { describe, expect, it, vi } from 'vitest'

const runtimeMocks = vi.hoisted(() => ({
  hasContextInfo: vi.fn<(info: { editable: boolean }) => boolean>(),
  introspectCapsuleSchema: vi.fn<(schema: unknown) => { editable: boolean }>(),
  isRuntimeComponentName: vi.fn<(name: string) => boolean>(),
  loadOpenUIRuntimeComponent:
    vi.fn<(name: string) => Promise<{ client: { props?: unknown } }>>(),
}))

vi.mock('@ship-fast/blocks/runtime', () => ({
  isRuntimeComponentName: runtimeMocks.isRuntimeComponentName,
  loadOpenUIRuntimeComponent: runtimeMocks.loadOpenUIRuntimeComponent,
}))

vi.mock('@ship-fast/blocks/capsules', () => ({
  hasContextInfo: runtimeMocks.hasContextInfo,
  introspectCapsuleSchema: runtimeMocks.introspectCapsuleSchema,
}))

describe('loadRuntimeCapsuleSchemaInfo', () => {
  it('does not load a runtime component for an unknown capsule name', async () => {
    runtimeMocks.isRuntimeComponentName.mockReturnValue(false)
    const { loadRuntimeCapsuleSchemaInfo } =
      await import('./useRuntimeCapsuleSchemaInfo')

    await expect(loadRuntimeCapsuleSchemaInfo('UnknownCapsule')).resolves.toBe(
      null,
    )
    expect(runtimeMocks.loadOpenUIRuntimeComponent).not.toHaveBeenCalled()
  })

  it('loads only the requested runtime component schema', async () => {
    runtimeMocks.isRuntimeComponentName.mockReturnValue(true)
    runtimeMocks.loadOpenUIRuntimeComponent.mockResolvedValue({
      client: { props: { shape: 'schema' } },
    })
    runtimeMocks.introspectCapsuleSchema.mockReturnValue({ editable: true })
    runtimeMocks.hasContextInfo.mockReturnValue(true)
    const { loadRuntimeCapsuleSchemaInfo } =
      await import('./useRuntimeCapsuleSchemaInfo')

    await expect(
      loadRuntimeCapsuleSchemaInfo('EcommerceHero'),
    ).resolves.toEqual({
      editable: true,
    })
    expect(runtimeMocks.loadOpenUIRuntimeComponent).toHaveBeenCalledTimes(1)
    expect(runtimeMocks.loadOpenUIRuntimeComponent).toHaveBeenCalledWith(
      'EcommerceHero',
    )
  })
})
