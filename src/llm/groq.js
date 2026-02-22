import { GROQ_API_KEY, GROQ_HOST, GROQ_MODEL, HOMEPAGE_MODEL, LLM_CONFIG } from '../config.js'
import { calculateCost } from './utils.js'

async function groqFetch({
  model = GROQ_MODEL,
  system,
  prompt,
  temperature = LLM_CONFIG.default.temperature,
  maxTokens = LLM_CONFIG.default.maxTokens,
}) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set')

  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ]

  const res = await fetch(`${GROQ_HOST}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: false }),
  })

  const data = await res.json()
  if (data.error) return { content: '', error: data.error.message, tps: 0 }

  const usage = data.usage ?? {}
  const tps =
    usage.completion_tokens && usage.total_time
      ? Math.round(usage.completion_tokens / usage.total_time)
      : 0

  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0
  const cost = calculateCost(model, inputTokens, outputTokens)

  return {
    content: data.choices?.[0]?.message?.content ?? '',
    tps,
    inputTokens,
    outputTokens,
    model,
    cost,
  }
}

export async function groq(prompt, opts = {}) {
  return groqFetch({ prompt, ...opts })
}

export async function groqHomepage(prompt) {
  return groqFetch({
    model: HOMEPAGE_MODEL,
    system: `You are a world-class frontend engineer who builds premium SaaS landing pages.
Output ONLY a complete, self-contained HTML file. No markdown, no explanation, no code fences.

TECH STACK:
- Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>)
- Google Fonts (use the font specified in the design system, or Inter if none given)
- Inline SVG for all icons. NEVER emojis. NEVER icon CDNs.

DESIGN DNA \u2014 FOLLOW THIS EXACTLY:
This is a typography-first, minimalist dark SaaS aesthetic. NO hero screenshots, NO floating mockups, NO product images in the hero. The beauty comes from typography, spacing, and subtle card depth.

1. TYPOGRAPHY IS KING:
   - Headlines: font-extrabold or font-black, tracking-tight
   - Hero headline: text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-center
   - Body text: text-base md:text-lg, muted color, max-w-2xl mx-auto text-center
   - Section labels: UPPERCASE text-xs font-semibold tracking-widest in the accent color, mb-4, centered above each section headline
   - Section headlines: text-3xl md:text-4xl font-extrabold text-center

2. LAYOUT \u2014 CENTERED AND NARROW:
   - max-w-4xl mx-auto for content (NOT wide 7xl grids)
   - Everything centered: text-center on all section headers and body text
   - Generous vertical rhythm: py-20 md:py-28 between sections
   - px-6 horizontal padding

3. COLORS \u2014 USE THE DESIGN SYSTEM:
   - Follow the colors from the provided design system exactly.
   - Dark background, slightly lighter surface for cards, thin subtle borders.
   - Accent color used sparingly: section labels, CTAs, badges, highlighted cards.
   - Text: bright for headlines, muted for body, more muted for footer.
   - Use a subtle radial gradient glow behind the hero area using the accent color at very low opacity.

4. COMPONENTS:
   - Nav: simple, dark bg, subtle bottom border. Logo left, 2-3 text links + 1 small button right. NOT sticky.
   - Hero: NO images. Small pill badge at top (dark bg, subtle border, rounded-full, small text). Then massive headline. Then body paragraph in muted color. Then ONE primary CTA button (rounded-full, accent gradient bg, px-8 py-3). Optional small trust text below CTA.
   - Cards: dark surface bg, subtle border, rounded-xl p-6. 2-column grid (NOT 3). Title (font-semibold) + description (text-sm muted). Subtle hover:border change, transition.
   - Featured/highlight card: gradient bg using accent color at low opacity, accent-tinted border, icon in a colored circle at top.
   - Pricing cards: 2-column grid. Featured plan gets a small "Popular" badge (accent bg, white text, text-xs rounded-full). Cards have title, price, description, and a CTA link (accent color with arrow \u2192).
   - Highlight banner: full-width, dark surface bg, subtle border, rounded-xl p-4 text-center, bold span for emphasis.
   - Logo cloud: company names as plain text (font-medium, muted color, text-sm), flex-wrap row, centered. NO images.
   - CTA section: large bold headline, muted subtitle, 2 buttons side by side (primary accent gradient + secondary outline).
   - Footer: simple centered. Logo, 3-4 links in a row, copyright below.

5. SECTION FLOW (this exact order):
   Nav \u2192 Hero (pill badge + headline + subtitle + CTA) \u2192 Features section (label + headline + subtitle + 2x2 card grid) \u2192 Pricing section (label + headline + subtitle + 2-col pricing cards) \u2192 Custom/highlight section (label + headline + featured gradient card) \u2192 Logo cloud (headline + company names) \u2192 Final CTA (headline + subtitle + 2 buttons) \u2192 Footer

6. WHAT MAKES IT PREMIUM:
   - Restraint. Less is more. No clutter, no busy layouts.
   - No images for SaaS/landing. Pure typography + cards + icons.
   - Subtle depth: cards slightly lighter than bg, thin borders, no heavy shadows.
   - Consistent 2-col grids, never 3-col.
   - Section labels in accent color create visual rhythm.
   - Generous whitespace between every element (space-y-6 in sections, gap-6 in grids).
   - Hover states on all interactive elements (transition-colors duration-200).
   - Inline SVG icons are simple, thin-stroke, 24x24 or 32x32.

7. IMAGES: If the prompt specifically needs images (ecommerce products, portfolio), use Lorem Picsum: https://picsum.photos/seed/{descriptive-seed}/{width}/{height}. For SaaS/landing pages, prefer NO images \u2014 use icons and typography instead.`,
    prompt,
    temperature: LLM_CONFIG.homepage.temperature,
    maxTokens: LLM_CONFIG.homepage.maxTokens,
  })
}

export async function groqParallel(calls, opts = {}) {
  return Promise.all(
    calls.map((call) =>
      groqFetch({
        prompt: call.prompt,
        system: call.system,
        temperature: call.temperature ?? opts.temperature ?? LLM_CONFIG.parallel.temperature,
        maxTokens: call.maxTokens ?? opts.maxTokens ?? LLM_CONFIG.parallel.maxTokens,
        model: call.model ?? opts.model,
      }),
    ),
  )
}
