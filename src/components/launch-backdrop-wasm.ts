import wasmUrl from './launch-backdrop-sim.wasm?url'

export const LAUNCH_BACKDROP_PARTICLE_STRIDE = 7

export type LaunchBackdropWasmExports = {
  memory: WebAssembly.Memory
  backdrop_init: (width: number, height: number) => number
  backdrop_resize: (width: number, height: number) => number
  backdrop_step: (deltaMs: number) => number
  backdrop_count: () => number
}

let wasmExportsPromise: Promise<LaunchBackdropWasmExports> | undefined

const instantiateLaunchBackdropWasm = async () => {
  const response = await fetch(wasmUrl)
  if (WebAssembly.instantiateStreaming) {
    try {
      const { instance } = await WebAssembly.instantiateStreaming(response, {})
      return instance.exports as LaunchBackdropWasmExports
    } catch {
      const fallbackResponse = await fetch(wasmUrl)
      const bytes = await fallbackResponse.arrayBuffer()
      const { instance } = await WebAssembly.instantiate(bytes, {})
      return instance.exports as LaunchBackdropWasmExports
    }
  }

  const bytes = await response.arrayBuffer()
  const { instance } = await WebAssembly.instantiate(bytes, {})
  return instance.exports as LaunchBackdropWasmExports
}

export const loadLaunchBackdropWasm = () => {
  wasmExportsPromise ??= instantiateLaunchBackdropWasm()
  return wasmExportsPromise
}
