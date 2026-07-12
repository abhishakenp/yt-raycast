export const examplePrompts = [
  {
    label: 'Image studio',
    prompt:
      'A dark image generation studio where creators compare multiple AI models, tune prompts, and export polished visual sets.',
  },
  {
    label: 'Pet wellness',
    prompt:
      'A premium pet wellness landing page with appointments, member plans, warm testimonials, and a calm editorial feel.',
  },
  {
    label: 'SaaS dashboard',
    prompt:
      'A focused SaaS homepage for a remote team analytics platform with charts, pricing, and a sharp product walkthrough.',
  },
  {
    label: 'Local gym',
    prompt:
      'A powerful modern gym website with membership plans, class schedules, coach profiles, and high-energy visuals.',
  },
] as const

export function normalizePromptDraft(value: string): string {
  return value.trim()
}
