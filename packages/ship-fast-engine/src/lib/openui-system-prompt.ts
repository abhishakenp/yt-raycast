import { getShipFastOpenUISystemPrompt } from '../../../../src/openui/library/contract.ts'

/**
 * Canonical OpenUI system prompt.
 *
 * This is intentionally generated from the active component library so the LLM
 * contract, parser schema, and renderer stay aligned. Context wrappers may add
 * factual session/brand facts, but UI taste belongs in typed components.
 */
export const OPENUI_SYSTEM_PROMPT = getShipFastOpenUISystemPrompt()
