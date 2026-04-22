// @ts-check
/**
 * Unified LLM client with logging, latency tracking, and model visibility.
 * Wraps the low-level groq/hex1 functions with a consistent interface.
 */

import { groq, groqParallel } from './groq.js'
import { hex1, hex1Parallel } from './hex1.js'

/**
 * @typedef {Object} LLMCallOptions
 * @property {string} [model]
 * @property {string} [system]
 * @property {number} [temperature]
 * @property {number} [maxTokens]
 */

/**
 * @typedef {Object} LLMResult
 * @property {string} content
 * @property {string} [error]
 * @property {number} [tps]
 * @property {number} [inputTokens]
 * @property {number} [outputTokens]
 * @property {string} [model]
 * @property {number} [cost]
 * @property {number} [latencyMs]
 */

class LLMClient {
  /**
   * @param {{ provider: 'groq' | 'hex1', tag?: string }} config
   */
  constructor({ provider, tag = '' }) {
    this.provider = provider
    this.tag = tag
  }

  /**
   * Single completion call.
   * @param {string} prompt
   * @param {LLMCallOptions} [opts]
   * @returns {Promise<LLMResult>}
   */
  async chat(prompt, opts = {}) {
    const t0 = Date.now()
    const fn = this.provider === 'hex1' ? hex1 : groq
    const result = await fn(prompt, opts)
    const latencyMs = Date.now() - t0
    this._log(result, latencyMs, 'chat')
    return { ...result, latencyMs }
  }

  /**
   * Parallel completion calls.
   * @param {Array<{prompt: string, system?: string, temperature?: number, maxTokens?: number, model?: string}>} calls
   * @param {LLMCallOptions} [opts]
   * @returns {Promise<LLMResult[]>}
   */
  async chatParallel(calls, opts = {}) {
    const t0 = Date.now()
    const fn = this.provider === 'hex1' ? hex1Parallel : groqParallel
    const results = await fn(calls, opts)
    const latencyMs = Date.now() - t0
    const totalTokens = results.reduce((s, r) => s + (r.outputTokens ?? 0), 0)
    console.log(
      `  [llm/${this.tag || this.provider}] parallel(${calls.length}) ${latencyMs}ms ${totalTokens}tok`,
    )
    return results.map((r) => ({ ...r, latencyMs: Math.round(latencyMs / calls.length) }))
  }

  /**
   * @private
   * @param {LLMResult} result
   * @param {number} latencyMs
   * @param {string} phase
   */
  _log(result, latencyMs, phase) {
    const model = result?.model ?? this.provider
    const tokens = result?.outputTokens ?? 0
    const tps = result?.tps ?? 0
    const cost = result?.cost ? ` $${result.cost.toFixed(4)}` : ''
    const err = result?.error ? ` ⚠ ${result.error.slice(0, 60)}` : ''
    console.log(`  [llm/${this.tag || model}] ${phase} ${latencyMs}ms ${tokens}tok ${tps}tps${cost}${err}`)
  }
}

/**
 * @param {string} [tag]
 * @returns {LLMClient}
 */
export function createGroqClient(tag = 'groq') {
  return new LLMClient({ provider: 'groq', tag })
}

/**
 * @param {string} [tag]
 * @returns {LLMClient}
 */
export function createHex1Client(tag = 'hex1') {
  return new LLMClient({ provider: 'hex1', tag })
}

export { LLMClient }
