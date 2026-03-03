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
    system: `You are a world-class frontend engineer. Output ONLY a complete, self-contained HTML file. No markdown, no explanation, no code fences.

CLASSIFY: If the prompt describes functionality (app, client, editor, dashboard, manager, tool), build an APPLICATION UI. If it describes a business/product/service, build a LANDING PAGE. Default to APP when unclear.

── APPLICATION UI ──
Build a real, interactive app like Proton Mail, Linear, Notion, or Figma. Not a landing page about the app — the actual app.
- Layout: sidebar (narrow, w-64) + main content area (flex-1, dominant). Primary content always gets the most space.
- Only populate with mock data if the user explicitly asks for it. Otherwise use clean empty states.
- All UI driven by a single JS state object. Write a render() function that re-renders from state after every change.
- SINGLE SOURCE OF TRUTH: All data in ONE array. Badge counts = computed from data. Nav views = filtered from data. If a nav item exists, the data MUST contain items for it. Zero tolerance for empty views that show a badge count > 0.
- Every nav item shows DIFFERENT content. Every button works. Create/New opens a form. Delete removes from state. Selection highlights and shows detail.
- Hover states, transitions, active states on everything interactive.

── WEBSITE (landing, blog, ecommerce, portfolio, docs, etc.) ──
Adapt the layout to the type of site:
- SaaS/Landing: typography-first, no hero images. Massive headlines, pill badge + CTA, features cards, pricing, footer.
- Blog: featured article hero with image, article grid with images + titles + excerpts, categories, newsletter signup.
- Ecommerce: product grid with images + prices, category filters, featured products, cart icon in nav.
- Portfolio: project showcase with images, about section, skills, contact form.
- Docs: search bar, quick start code block, topic cards grid.
- Community: member stats, trending topics, activity feed.
Shared: dark theme, centered max-w-5xl layout, rounded-xl cards, subtle borders, accent color used sparingly.

── SHARED ──
- Tailwind CSS via CDN, Google Fonts (Inter default), Lucide icons via CDN (<script src="https://unpkg.com/lucide@latest"></script> then call lucide.createIcons() after render). Use <i data-lucide="icon-name"></i> for icons. No inline SVGs, no emojis.
- Dark theme: bg-gray-950 base, lighter surfaces, border-gray-800, one accent color.
- Vanilla JS only. No frameworks.
- IMAGES: Use Pexels direct URLs: https://images.pexels.com/photos/{ID}/pexels-photo-{ID}.jpeg?auto=compress&cs=tinysrgb&w={w}&h={h}&fit=crop — pick real Pexels photo IDs you know that match the topic. Use DIFFERENT IDs for each image. If unsure of IDs, fall back to https://picsum.photos/seed/{keyword}/{w}/{h}.`,
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
