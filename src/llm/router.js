import { groq, groqParallel } from './groq.js'
import { hex1, hex1Parallel } from './hex1.js'

/**
 * Returns the right single-call LLM function for content phases.
 * Structural phases (spec, design, detect, navfix) always use Groq directly.
 */
export function getContentLLM(indiaMode) {
  return indiaMode?.isIndian ? hex1 : groq
}

/**
 * Returns the right parallel LLM function for content phases.
 */
export function getContentParallelLLM(indiaMode) {
  return indiaMode?.isIndian ? hex1Parallel : groqParallel
}
