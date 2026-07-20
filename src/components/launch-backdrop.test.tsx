// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { loadLaunchBackdropWasm } from './launch-backdrop-wasm'
import { LaunchBackdrop } from './launch-backdrop'

vi.mock('./launch-backdrop-wasm', () => ({
  LAUNCH_BACKDROP_PARTICLE_STRIDE: 7,
  loadLaunchBackdropWasm: vi.fn(),
}))

type TestWasmExports = Awaited<ReturnType<typeof loadLaunchBackdropWasm>>

function installMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
}

function createTestWasmExports(): TestWasmExports {
  const memory = new WebAssembly.Memory({ initial: 1 })
  const frame = new Float32Array(memory.buffer, 0, 14)
  frame.set([0, 0, 8, 3, 0.9, 190, 0.4, 12, 4, 19, 6, 0.7, 310, 0.5])
  return {
    memory,
    backdrop_init: vi.fn(() => 2),
    backdrop_resize: vi.fn(() => 2),
    backdrop_step: vi.fn(() => 0),
    backdrop_count: vi.fn(() => 2),
  }
}

function installTestWasmExports() {
  const wasm = createTestWasmExports()
  vi.mocked(loadLaunchBackdropWasm).mockResolvedValue(wasm)
  return wasm
}

describe('LaunchBackdrop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    installMatchMedia(false)
    installTestWasmExports()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders as decorative backdrop content with a full-screen canvas', () => {
    const { container } = render(<LaunchBackdrop />)

    const backdrop = container.firstElementChild as HTMLElement
    expect(backdrop.getAttribute('aria-hidden')).toBe('true')
    expect(backdrop.className).toContain('pointer-events-none')
    expect(backdrop.querySelector('canvas')).toBeTruthy()
  })

  it('does not start the canvas renderer for reduced-motion users', async () => {
    installMatchMedia(true)
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null)

    render(<LaunchBackdrop />)

    await vi.advanceTimersByTimeAsync(2_000)

    expect(getContext).not.toHaveBeenCalled()
    expect(loadLaunchBackdropWasm).not.toHaveBeenCalled()
  })

  it('cancels delayed startup when the backdrop unmounts before idle time', async () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null)
    const { unmount } = render(<LaunchBackdrop />)

    unmount()
    await vi.advanceTimersByTimeAsync(2_000)

    expect(getContext).not.toHaveBeenCalled()
    expect(loadLaunchBackdropWasm).not.toHaveBeenCalled()
  })

  it('starts the canvas renderer after the delayed idle window', async () => {
    const context = {
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      closePath: vi.fn(),
      drawImage: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      rotate: vi.fn(),
      setTransform: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      set fillStyle(_value: string) {},
      set globalAlpha(_value: number) {},
      set globalCompositeOperation(_value: string) {},
      set lineCap(_value: CanvasLineCap) {},
      set lineJoin(_value: CanvasLineJoin) {},
      set lineWidth(_value: number) {},
      set strokeStyle(_value: string) {},
    } as unknown as CanvasRenderingContext2D
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(context)
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const { container } = render(<LaunchBackdrop />)
    await vi.advanceTimersByTimeAsync(1_750)

    expect(getContext).toHaveBeenCalledWith('2d', { alpha: true })
    expect(context.setTransform).toHaveBeenCalled()
    expect(container.querySelector('canvas')).toBeTruthy()
  })

  it('keeps the wasm canvas renderer active after the old animation window', async () => {
    const wasm = installTestWasmExports()
    const context = {
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      closePath: vi.fn(),
      drawImage: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      lineTo: vi.fn(),
      moveTo: vi.fn(),
      rotate: vi.fn(),
      setTransform: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      set fillStyle(_value: string) {},
      set globalAlpha(_value: number) {},
      set globalCompositeOperation(_value: string) {},
      set lineCap(_value: CanvasLineCap) {},
      set lineJoin(_value: CanvasLineJoin) {},
      set lineWidth(_value: number) {},
      set strokeStyle(_value: string) {},
    } as unknown as CanvasRenderingContext2D
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
    let frameCallback: FrameRequestCallback | undefined
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallback = callback
      return 7
    })
    const cancelAnimationFrame = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => {})

    render(<LaunchBackdrop />)
    await vi.advanceTimersByTimeAsync(1_750)
    frameCallback?.(10_000)

    expect(cancelAnimationFrame).not.toHaveBeenCalledWith(7)
    expect(wasm.backdrop_step).toHaveBeenCalled()
  })
})
