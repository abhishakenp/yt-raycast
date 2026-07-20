/* @ts-self-types="./wasm_particles.d.ts" */
// Browser-compatible WASM loader
let wasmModule = null;

export async function init(wasmBytes) {
    const wasm = await WebAssembly.instantiate(wasmBytes, {});
    wasmModule = wasm.instance.exports;
    return wasmModule;
}

export function getWasm() {
    return wasmModule;
}
