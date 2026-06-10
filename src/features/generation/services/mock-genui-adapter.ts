import type { GenerationEvent } from '@/features/generation/services/generation-state'

export type MockGenUIInput = {
  prompt: string
}

export const createMockGenUIEvents = async (
  input: MockGenUIInput,
): Promise<GenerationEvent[]> => [
  { type: 'queued' },
  { type: 'validating' },
  { type: 'streaming', taskKey: 'homepage', title: `Generate homepage for ${input.prompt}` },
  { type: 'homepage_ready', html: '<main><h1>Generated homepage</h1></main>' },
  { type: 'site_spec_ready', specJson: JSON.stringify({ pages: ['home'] }) },
  { type: 'preview_ready', html: '<main><h1>Generated homepage</h1></main>' },
]
