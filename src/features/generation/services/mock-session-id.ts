import { normalizePromptDraft } from '@/features/home/services/home-prompts'

export const createMockSessionId = (prompt: string): string => {
  const normalized = normalizePromptDraft(prompt).toLowerCase()
  const slug = normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)

  return `mock-${slug || 'session'}`
}
