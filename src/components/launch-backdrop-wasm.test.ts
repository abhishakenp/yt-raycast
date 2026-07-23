import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

type LaunchBackdropWasmExports = {
  memory: WebAssembly.Memory
  backdrop_init: (width: number, height: number) => number
  backdrop_step: (deltaMs: number) => number
  backdrop_count: () => number
}

describe('launch backdrop wasm simulation', () => {
  it('exports a dense particle simulation buffer', async () => {
    const bytes = await readFile('src/components/launch-backdrop-sim.wasm')
    const { instance } = await WebAssembly.instantiate(bytes, {})
    const wasmExports = instance.exports as LaunchBackdropWasmExports

    const count = wasmExports.backdrop_init(1440, 900)
    const pointer = wasmExports.backdrop_step(16.7)
    const frame = new Float32Array(
      wasmExports.memory.buffer,
      pointer,
      count * 7,
    )

    expect(count).toBeGreaterThanOrEqual(96)
    expect(count).toBeLessThanOrEqual(210)
    expect(wasmExports.backdrop_count()).toBe(count)
    expect(frame.length).toBe(count * 7)
    expect(frame[6]).toBeGreaterThan(0)
  })

  it('does not emit long reset streaks as straight paths', async () => {
    const bytes = await readFile('src/components/launch-backdrop-sim.wasm')
    const { instance } = await WebAssembly.instantiate(bytes, {})
    const wasmExports = instance.exports as LaunchBackdropWasmExports

    const count = wasmExports.backdrop_init(320, 240)
    let pointer = wasmExports.backdrop_step(16.7)
    for (let frameIndex = 0; frameIndex < 700; frameIndex += 1) {
      pointer = wasmExports.backdrop_step(48)
    }
    const frame = new Float32Array(
      wasmExports.memory.buffer,
      pointer,
      count * 7,
    )
    const segmentLengths = []
    for (let offset = 0; offset < frame.length; offset += 7) {
      segmentLengths.push(
        Math.hypot(
          frame[offset + 2] - frame[offset],
          frame[offset + 3] - frame[offset + 1],
        ),
      )
    }

    expect(Math.max(...segmentLengths)).toBeLessThan(12)
  })

  it('keeps rockets slower and weighted away from the left edge', async () => {
    const bytes = await readFile('src/components/launch-backdrop-sim.wasm')
    const { instance } = await WebAssembly.instantiate(bytes, {})
    const wasmExports = instance.exports as LaunchBackdropWasmExports

    const width = 1440
    const count = wasmExports.backdrop_init(width, 900)
    let maxSegmentLength = 0
    let leftSamples = 0
    let centerAndRightSamples = 0

    for (let frameIndex = 0; frameIndex < 240; frameIndex += 1) {
      const pointer = wasmExports.backdrop_step(16.7)
      const frame = new Float32Array(
        wasmExports.memory.buffer,
        pointer,
        count * 7,
      )

      for (let offset = 0; offset < frame.length; offset += 7) {
        maxSegmentLength = Math.max(
          maxSegmentLength,
          Math.hypot(
            frame[offset + 2] - frame[offset],
            frame[offset + 3] - frame[offset + 1],
          ),
        )

        if (frame[offset + 6] <= 0.02) continue
        if (frame[offset + 2] < width / 3) {
          leftSamples += 1
        } else {
          centerAndRightSamples += 1
        }
      }
    }

    expect(maxSegmentLength).toBeLessThan(2.5)
    expect(centerAndRightSamples).toBeGreaterThan(leftSamples)
  })
})
