import {
  classifyDeterministicModeration,
  normalizePolicyText,
} from '../../convex/lib/content_moderation_policy'

export { normalizePolicyText }

export const CONTENT_POLICY_CLIENT_MESSAGE =
  '🚫 Not shipping that. Ship Fast blocks harmful, hateful, explicit, or exploitative content. This request was flagged—try a safe idea instead.'

export const checkPromptContentPolicy = (raw: unknown) =>
  classifyDeterministicModeration({ prompt: raw }).decision === 'blocked'
    ? { ok: false as const, code: 'CONTENT_POLICY' as const }
    : { ok: true as const }
