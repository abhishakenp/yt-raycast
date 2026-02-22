export function designBriefPrompt(prompt) {
  return {
    system:
      'You are a senior design system architect. Create clean, professional design systems. Output ONLY markdown. No preamble.',
    user: `Create a design system for this project:
${prompt}

Output a concise design.md with these sections:
### Colors — primary, secondary, accent, background, text (hex values)
### Typography — heading + body font pairing, Google Fonts import, size scale
### Tailwind Config — provide a valid JSON block for tailwind.config.theme.extend that defines these colors and fonts
### Style — key Tailwind classes for the overall look
### Sections — homepage sections in order (what each section contains)
### Component Patterns — semantic Tailwind classes for: nav, hero, cards, buttons, footer

MANDATORY RULES:
- Clean, professional, production-grade. Think Vercel, Linear, Stripe, Notion.
- Dark mode by default (dark background, light text)
- NO neon, NO glassmorphism, NO gradients, NO teal, NO glow effects
- Muted, sophisticated palette — one primary accent, neutral grays
- Inter or similar clean sans-serif. No decorative fonts unless creative/luxury project
- Subtle shadows (shadow-sm), rounded-lg, border-gray-200
- Use semantic names in the Tailwind Config: primary, secondary, accent, background, surface, text-primary, text-secondary
Max 80 lines. Output ONLY markdown.`,
    model: 'moonshotai/kimi-k2-instruct-0905',
    temperature: 0.4,
    maxTokens: 3000,
  }
}
