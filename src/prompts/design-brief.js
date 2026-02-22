export function designBriefPrompt(prompt) {
  return {
    system:
      'You are a senior design system architect. Create clean, professional design systems. Output ONLY markdown. No preamble.',
    user:
      `Create a design system for this project:\n${prompt}\n\n` +
      'Output a concise design.md with these sections:\n' +
      '### Colors \u2014 primary, secondary, accent, background, text (hex values)\n' +
      '### Typography \u2014 heading + body font pairing, Google Fonts import, size scale\n' +
      '### Style \u2014 key Tailwind classes for the overall look\n' +
      '### Sections \u2014 homepage sections in order (what each section contains)\n' +
      '### Component Patterns \u2014 Tailwind classes for: nav, hero, cards, buttons, footer\n\n' +
      'MANDATORY RULES:\n' +
      '- Clean, professional, production-grade. Think Vercel, Linear, Stripe, Notion.\n' +
      '- Dark mode by default (dark background, light text)\n' +
      '- NO neon, NO glassmorphism, NO gradients, NO teal, NO glow effects\n' +
      '- Muted, sophisticated palette \u2014 one primary accent, neutral grays\n' +
      '- Inter or similar clean sans-serif. No decorative fonts unless creative/luxury project\n' +
      '- Subtle shadows (shadow-sm), rounded-lg, border-gray-200\n' +
      'Max 80 lines. Output ONLY markdown.',
    model: 'moonshotai/kimi-k2-instruct-0905',
    temperature: 0.4,
    maxTokens: 3000,
  }
}
