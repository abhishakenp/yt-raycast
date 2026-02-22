import { loadTemplate } from './template-loader.js'
import { LLM_CONFIG } from '../config.js'

const CHATJIMMY_API = 'https://chatjimmy.ai/api/chat'
const DEFAULT_MODEL = 'llama3.1-8B'

async function llmFetch({
  model = DEFAULT_MODEL,
  system,
  prompt,
  _temperature = LLM_CONFIG.default.temperature,
  _maxTokens = LLM_CONFIG.default.maxTokens,
}) {
  const messages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    { role: 'user', content: prompt },
  ]

  const requestBody = {
    messages,
    chatOptions: {
      selectedModel: model,
      systemPrompt: system || '',
      topK: 8,
    },
    attachment: null,
  }

  try {
    const res = await fetch(CHATJIMMY_API, {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'fr,en;q=0.9,en-US;q=0.8,fr-CH;q=0.7',
        'content-type': 'application/json',
        'origin': 'https://chatjimmy.ai',
        'priority': 'u=1, i',
        'referer': 'https://chatjimmy.ai/',
        'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      console.error(`❌ chatjimmy.ai API error: ${res.status} ${res.statusText}`)
      const text = await res.text()
      console.error('Response text:', text.slice(0, 300))
      return { content: '', error: `API error: ${res.status}`, tps: 0 }
    }

    let text = await res.text()

    // Strip <|stats|> suffix that chatjimmy.ai appends to responses
    text = text.replace(/<\|stats\|>[\s\S]*?<\/\|stats\|>/g, '').trim()

    if (!text) {
      console.error('❌ Response is empty after stripping stats')
      return { content: '', error: 'Empty response', tps: 0 }
    }

    console.log(`📡 Content (${text.length} chars):`, text.slice(0, 200))

    // Try to parse as JSON first
    let data
    try {
      data = JSON.parse(text)
      console.log('✅ Parsed as JSON. Keys:', Object.keys(data).join(', '))

      if (data.error) return { content: '', error: data.error, tps: 0 }

      // Extract content from JSON response
      const content = data.message?.content || data.content || data.reply || data.text || JSON.stringify(data)
      return {
        content,
        tps: 0,
        inputTokens: 0,
        outputTokens: 0,
        model,
        cost: 0,
      }
    } catch {
      // Not JSON - treat as plain content (HTML, markdown, etc.)
      console.log('✅ Response is plain text/HTML (not JSON)')
      return {
        content: text,
        tps: 0,
        inputTokens: 0,
        outputTokens: 0,
        model,
        cost: 0,
      }
    }
  } catch (err) {
    console.error('❌ chatjimmy.ai fetch error:', err?.message, err?.toString?.())
    return {
      content: '',
      error: err?.message || 'API request failed',
      tps: 0,
    }
  }
}

export async function groq(prompt, opts = {}) {
  return llmFetch({ prompt, ...opts })
}

export async function groqHomepage(prompt) {
  return llmFetch({
    model: DEFAULT_MODEL,
    system: `You are a world-class frontend engineer who builds premium SaaS landing pages.
Output ONLY a complete, self-contained HTML file. No markdown, no explanation, no code fences.

TECH STACK:
- Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>)
- Google Fonts (use the font specified in the design system, or Inter if none given)
- Inline SVG for all icons. NEVER emojis. NEVER icon CDNs.

DESIGN DNA — FOLLOW THIS EXACTLY:
This is a typography-first, minimalist dark SaaS aesthetic. NO hero screenshots, NO floating mockups, NO product images in the hero. The beauty comes from typography, spacing, and subtle card depth.

1. TYPOGRAPHY IS KING:
   - Headlines: font-extrabold or font-black, tracking-tight
   - Hero headline: text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-center
   - Body text: text-base md:text-lg, muted color, max-w-2xl mx-auto text-center
   - Section labels: UPPERCASE text-xs font-semibold tracking-widest in the accent color, mb-4, centered above each section headline
   - Section headlines: text-3xl md:text-4xl font-extrabold text-center

2. LAYOUT — CENTERED AND NARROW:
   - max-w-4xl mx-auto for content (NOT wide 7xl grids)
   - Everything centered: text-center on all section headers and body text
   - Generous vertical rhythm: py-20 md:py-28 between sections
   - px-6 horizontal padding

3. COLORS — USE THE DESIGN SYSTEM:
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
   - Pricing cards: 2-column grid. Featured plan gets a small "Popular" badge (accent bg, white text, text-xs rounded-full). Cards have title, price, description, and a CTA link (accent color with arrow →).
   - Highlight banner: full-width, dark surface bg, subtle border, rounded-xl p-4 text-center, bold span for emphasis.
   - Logo cloud: company names as plain text (font-medium, muted color, text-sm), flex-wrap row, centered. NO images.
   - CTA section: large bold headline, muted subtitle, 2 buttons side by side (primary accent gradient + secondary outline).
   - Footer: simple centered. Logo, 3-4 links in a row, copyright below.

5. SECTION FLOW (this exact order):
   Nav → Hero (pill badge + headline + subtitle + CTA) → Features section (label + headline + subtitle + 2x2 card grid) → Pricing section (label + headline + subtitle + 2-col pricing cards) → Custom/highlight section (label + headline + featured gradient card) → Logo cloud (headline + company names) → Final CTA (headline + subtitle + 2 buttons) → Footer

6. WHAT MAKES IT PREMIUM:
   - Restraint. Less is more. No clutter, no busy layouts.
   - No images for SaaS/landing. Pure typography + cards + icons.
   - Subtle depth: cards slightly lighter than bg, thin borders, no heavy shadows.
   - Consistent 2-col grids, never 3-col.
   - Section labels in accent color create visual rhythm.
   - Generous whitespace between every element (space-y-6 in sections, gap-6 in grids).
   - Hover states on all interactive elements (transition-colors duration-200).
   - Inline SVG icons are simple, thin-stroke, 24x24 or 32x32.

7. IMAGES: If the prompt specifically needs images (ecommerce products, portfolio), use Lorem Picsum: https://picsum.photos/seed/{descriptive-seed}/{width}/{height}. For SaaS/landing pages, prefer NO images — use icons and typography instead.`,
    prompt,
    temperature: LLM_CONFIG.homepage.temperature,
    maxTokens: LLM_CONFIG.homepage.maxTokens,
  })
}

export async function groqTemplate(siteType, designSystem = null) {
  // Load template from pre-made collection (v1 or v2 - random selection)
  try {
    const result = await loadTemplate(siteType)
    return {
      content: result.content,
      version: result.version,
      siteType: result.siteType,
      inputTokens: 0,
      outputTokens: 0,
      model: 'template-loader',
      cost: 0,
    }
  } catch (err) {
    return {
      content: '',
      error: err?.message || 'Template loading failed',
      tps: 0,
    }
  }
}

export async function groqCustomizeTemplate(template, prompt, ctx, designBrief) {
  const projectName = ctx?.project_name || 'My Project'
  const features = ctx?.features ?? []
  const tagline = ctx?.tagline || ''
  const siteType = ctx?.site_type || 'saas'

  // Extract key info from prompt (first sentence)
  const promptWords = prompt.split(/[.!?]/).filter(s => s.trim())[0]?.trim() || prompt

  // DEBUG: Log what values are being used for customization
  if (typeof process !== 'undefined' && process.env.DEBUG_CUSTOMIZE) {
    console.log(`[groqCustomizeTemplate] projectName="${projectName}" features=${features.length} tagline="${tagline}"`)
  }

  // Build replacement map with placeholder tokens
  const replacements = {
    BRAND_NAME: projectName,
    PROJECT_NAME: projectName,

    // Hero section
    NEW_FEATURE_LABEL: '✨ New Feature',
    HERO_HEADLINE: projectName,
    HERO_SUBTITLE: promptWords || tagline || 'Transform the way you work',
    HERO_CTA_TEXT: 'Get Started Free',

    // Features section
    FEATURES_LABEL: 'Features',
    FEATURES_HEADLINE: 'Everything you need',
    FEATURES_SUBTITLE: 'Powerful features built for teams',

    FEATURE_1_NAME: features[0]?.split(/[,\-\.]/)[0]?.trim() || 'Lightning Fast',
    FEATURE_1_DESC: 'Built for performance and speed',
    FEATURE_2_NAME: features[1]?.split(/[,\-\.]/)[0]?.trim() || 'Enterprise Secure',
    FEATURE_2_DESC: 'Enterprise-grade security built in',
    FEATURE_3_NAME: features[2]?.split(/[,\-\.]/)[0]?.trim() || 'Infinitely Scalable',
    FEATURE_3_DESC: 'Grows with your team and business',
    FEATURE_4_NAME: features[3]?.split(/[,\-\.]/)[0]?.trim() || 'Easy Integration',
    FEATURE_4_DESC: 'Integrates with your favorite tools',

    // Pricing section
    PRICING_LABEL: 'Pricing',
    PRICING_HEADLINE: 'Simple, transparent pricing',
    PRICING_SUBTITLE: 'Choose the plan that works for you',

    PLAN_1_NAME: 'Starter',
    PLAN_1_DESC: 'For individuals and small teams',
    PLAN_1_PRICE: '$29',
    PLAN_1_CTA: 'Get Started',
    PLAN_1_FEATURE_1: 'Up to 10 projects',
    PLAN_1_FEATURE_2: '5 team members',
    PLAN_1_FEATURE_3: 'Email support',

    PLAN_2_NAME: 'Professional',
    PLAN_2_DESC: 'For growing teams',
    PLAN_2_PRICE: '$99',
    PLAN_2_CTA: 'Get Started',
    PLAN_2_FEATURE_1: 'Unlimited projects',
    PLAN_2_FEATURE_2: 'Unlimited team members',
    PLAN_2_FEATURE_3: 'Priority support',
    PLAN_2_FEATURE_4: 'API access',

    // CTA section
    CTA_HEADLINE: 'Ready to get started?',
    CTA_SUBTITLE: `Join thousands of teams already using ${projectName}`,
    CTA_PRIMARY_TEXT: 'Start Free Trial',
    CTA_SECONDARY_TEXT: 'Schedule Demo',

    // Footer
    FOOTER_COL1_TITLE: 'Product',
    FOOTER_COL1_LINK1: 'Features',
    FOOTER_COL1_LINK2: 'Pricing',
    FOOTER_COL1_LINK3: 'Security',

    FOOTER_COL2_TITLE: 'Company',
    FOOTER_COL2_LINK1: 'About',
    FOOTER_COL2_LINK2: 'Blog',
    FOOTER_COL2_LINK3: 'Careers',

    FOOTER_COL3_TITLE: 'Resources',
    FOOTER_COL3_LINK1: 'Docs',
    FOOTER_COL3_LINK2: 'API',
    FOOTER_COL3_LINK3: 'Support',

    FOOTER_COL4_TITLE: 'Legal',
    FOOTER_COL4_LINK1: 'Privacy',
    FOOTER_COL4_LINK2: 'Terms',
    FOOTER_COL4_LINK3: 'Contact',

    FOOTER_COPYRIGHT: `© 2024 ${projectName}. All rights reserved.`,
  }

  // Apply replacements
  let customized = template
  for (const [token, value] of Object.entries(replacements)) {
    if (value) {
      customized = customized.replace(new RegExp(token, 'g'), String(value))
    }
  }

  // Optional: Update accent color from design brief if provided
  if (designBrief && designBrief.includes('#')) {
    const colorMatch = designBrief.match(/#[0-9a-f]{6}/i)
    if (colorMatch) {
      customized = customized.replace(
        '--color-accent: #06b6d4',
        `--color-accent: ${colorMatch[0]}`
      )
      customized = customized.replace(
        '--color-accent-dark: #0891b2',
        `--color-accent-dark: ${colorMatch[0]}`
      )
    }
  }

  return {
    content: customized,
    inputTokens: 0,
    outputTokens: 0,
    model: 'template-system',
    cost: 0,
  }
}

export async function groqParallel(calls, opts = {}) {
  return Promise.all(
    calls.map((call) =>
      llmFetch({
        prompt: call.prompt,
        system: call.system,
        temperature: call.temperature ?? opts.temperature ?? LLM_CONFIG.parallel.temperature,
        maxTokens: call.maxTokens ?? opts.maxTokens ?? LLM_CONFIG.parallel.maxTokens,
        model: call.model ?? opts.model ?? DEFAULT_MODEL,
      }),
    ),
  )
}
