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
    const exports = instance.exports as LaunchBackdropWasmExports

    const count = exports.backdrop_init(1440, 900)
    const pointer = exports.backdrop_step(16.7)
    const frame = new Float32Array(exports.memory.buffer, pointer, count * 7)

    expect(count).toBeGreaterThanOrEqual(96)
    expect(count).toBeLessThanOrEqual(210)
    expect(exports.backdrop_count()).toBe(count)
    expect(frame.length).toBe(count * 7)
    expect(frame[6]).toBeGreaterThan(0)
  })

  it('does not emit long reset streaks as straight paths', async () => {
    const bytes = await readFile('src/components/launch-backdrop-sim.wasm')
    const { instance } = await WebAssembly.instantiate(bytes, {})
    const exports = instance.exports as LaunchBackdropWasmExports

    const count = exports.backdrop_init(320, 240)
    let pointer = exports.backdrop_step(16.7)
    for (let frameIndex = 0; frameIndex < 700; frameIndex += 1) {
      pointer = exports.backdrop_step(48)
    }
    const frame = new Float32Array(exports.memory.buffer, pointer, count * 7)
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
})
