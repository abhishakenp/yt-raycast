import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createWarpController } from './useWarpCanvas'

const gradient = () => ({
  addColorStop: vi.fn(),
})

const context2d = () =>
  ({
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    closePath: vi.fn(),
    createLinearGradient: vi.fn(() => gradient()),
    createRadialGradient: vi.fn(() => gradient()),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    lineTo: vi.fn(),
    moveTo: vi.fn(),
  }) as unknown as CanvasRenderingContext2D

const canvasWithContext = (ctx: CanvasRenderingContext2D | null) =>
  ({
    clientHeight: 80,
    clientWidth: 120,
    getContext: vi.fn(() => ctx),
    height: 0,
    parentElement: {
      clientHeight: 180,
      clientWidth: 320,
    },
    style: {
      height: '',
      width: '',
    },
    width: 0,
  }) as unknown as HTMLCanvasElement

describe('createWarpController', () => {
  const originalWindow = globalThis.window
  const originalResizeObserver = globalThis.ResizeObserver
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame

  const resizeObserve = vi.fn()
  const resizeDisconnect = vi.fn()
  const addEventListener = vi.fn()
  const removeEventListener = vi.fn()
  const cancelAnimationFrameMock = vi.fn()
  const rafCallbacks = new Map<number, FrameRequestCallback>()
  let nextRafId = 1

  beforeEach(() => {
    resizeObserve.mockClear()
    resizeDisconnect.mockClear()
    addEventListener.mockClear()
    removeEventListener.mockClear()
    cancelAnimationFrameMock.mockClear()
    rafCallbacks.clear()
    nextRafId = 1

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        addEventListener,
        devicePixelRatio: 1.5,
        removeEventListener,
      },
    })

    globalThis.ResizeObserver = class {
      disconnect = resizeDisconnect
      observe = resizeObserve
      unobserve = vi.fn()
    } as unknown as typeof ResizeObserver

    globalThis.requestAnimationFrame = vi.fn((callback) => {
      const id = nextRafId
      nextRafId += 1
      rafCallbacks.set(id, callback)
      return id
    })
    globalThis.cancelAnimationFrame = cancelAnimationFrameMock
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    })
    globalThis.ResizeObserver = originalResizeObserver
    globalThis.requestAnimationFrame = originalRequestAnimationFrame
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame
  })

  it('starts, sizes, draws, and stops a canvas animation loop', () => {
    const ctx = context2d()
    const canvas = canvasWithContext(ctx)
    const controller = createWarpController(canvas)

    controller.start()

    expect(canvas.width).toBe(480)
    expect(canvas.height).toBe(270)
    expect(canvas.style.width).toBe('320px')
    expect(canvas.style.height).toBe('180px')
    expect(addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
    expect(resizeObserve).toHaveBeenCalledWith(canvas.parentElement)
    expect(rafCallbacks.size).toBe(1)

    rafCallbacks.get(1)?.(100)

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 480, 270)
    expect(ctx.beginPath).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
    expect(rafCallbacks.size).toBe(2)

    controller.stop()

    expect(cancelAnimationFrameMock).toHaveBeenCalledWith(2)
    expect(removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
    expect(resizeDisconnect).toHaveBeenCalled()
    expect(ctx.clearRect).toHaveBeenLastCalledWith(0, 0, 480, 270)
  })

  it('does not start animation work when a 2d context is unavailable', () => {
    const canvas = canvasWithContext(null)
    const controller = createWarpController(canvas)

    expect(() => controller.start()).not.toThrow()
    expect(rafCallbacks.size).toBe(0)
    expect(addEventListener).not.toHaveBeenCalled()

    expect(() => controller.stop()).not.toThrow()
    expect(cancelAnimationFrameMock).not.toHaveBeenCalled()
  })
})
