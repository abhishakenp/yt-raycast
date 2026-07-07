import {
  ECOMMERCE_ENVATO_TEMPLATES_URL,
  getEcommerceGenerationGuidelines,
  ECOMMERCE_MEDUSA_DOCS_LEARN,
  MOTION_REACT_GUIDELINES,
} from '../config'
import { brandProfilePromptBlock, type BrandProfile } from './brand-profile'

interface PhotoHint {
  url: string
  query?: string
  alt?: string
  posterUrl?: string
}

interface VideoHint {
  url: string
  query?: string
  alt?: string
  posterUrl?: string
}

interface ImageHints {
  photos?: PhotoHint[]
  videos?: VideoHint[]
}

interface PageTask {
  title: string
  filename?: string
  description?: string
}

interface PageCtx {
  [key: string]: unknown
}

function imageGuide(imageHints: ImageHints | null): string {
  const photos = imageHints?.photos ?? []
  const videos = imageHints?.videos ?? []
  if (!photos.length && !videos.length) {
    return 'No verified Pexels/Unsplash URLs are available (API keys may be unset). Do not invent image or video URLs or use placeholder domains. If a section needs visual weight, use gradients, patterns, icons, or typography only — never fake stock URLs.'
  }

  const lines = photos
    .slice(0, 8)
    .map((photo: PhotoHint, index: number) => {
      const hint = String(
        photo.query && photo.alt && photo.alt !== photo.query
          ? `[${photo.query}] ${photo.alt}`
          : photo.alt || photo.query,
      ).slice(0, 140)
      return `- ${index + 1}. ${hint}: ${photo.url}`
    })
    .join('\n')
  const videoLines = videos
    .slice(0, 6)
    .map((v: VideoHint, index: number) => {
      const hint = String(
        v.query && v.alt && v.alt !== v.query
          ? `[${v.query}] ${v.alt}`
          : v.alt || v.query,
      ).slice(0, 120)
      const poster = v.posterUrl ? ` | poster: ${v.posterUrl}` : ''
      return `- ${index + 1}. ${hint}\n  mp4: ${v.url}${poster}`
    })
    .join('\n')
  const imgBlock = photos.length
    ? `Use these verified image URLs first:\n${lines}`
    : ''
  const vidBlock = videos.length
    ? `${photos.length ? '\n\n' : ''}Verified Pexels videos (hero/background: <video muted loop playsinline> + <source type="video/mp4">):\n${videoLines}`
    : ''
  return `${imgBlock}${vidBlock}\n\nReuse the closest matching verified URL when multiple blocks need similar media. If no line fits, use a non-photo visual treatment instead of inventing URLs.`
}

export function pagePrompt(
  task: PageTask,
  navList: string,
  homepageHtml: string,
  imageHints: ImageHints | null = null,
  _indiaMode: string | null = null,
  brandProfile: BrandProfile | null = null,
  siteType: string | null = null,
  hasUserDesignReferences = false,
) {
  const ecommerceGuidelines = getEcommerceGenerationGuidelines({
    hasUserDesignReferences,
  })
  const brandBlock = brandProfilePromptBlock(brandProfile)
  const taskLower = (task.title || '').toLowerCase()
  const fnameLower = (task.filename || '').toLowerCase()
  const isContactPage =
    taskLower.includes('contact') || fnameLower.includes('contact')
  const contactPageBlock = isContactPage
    ? `\nCONTACT PAGE (mandatory):
- Include a real HTML <form> in <main> with: a text <input name="name">, an email <input type="email" name="email">, a <textarea name="message">, and a submit <button type="submit">. Labels must be visible.
- Add a small inline <script> before </body> that prevents default submit and shows a polite success message, or use data attributes consistent with the homepage demo patterns.
- Do not add street addresses, cities, or map pins unless the user prompt or verified brand block explicitly provides them—never invent place names.
- Do not include "Ship Fast", builder badges, rocket logos, or generator marketing anywhere on the page.
- The panel titled "Send us a Message" (or similar) must contain the form fields above, not a logo or empty decorative block.\n`
    : ''
  const ecommercePageBlock =
    siteType === 'ecommerce'
      ? taskLower.includes('shop') ||
        taskLower.includes('catalog') ||
        taskLower.includes('product')
        ? `\n${ecommerceGuidelines}

E-COMMERCE SHOP PAGE:
This is a product listing page for an e-commerce store. Build it like a real online shop (template density: ${ECOMMERCE_ENVATO_TEMPLATES_URL}):
- Sticky or prominent header search; nav depth so shoppers reach this catalog from home in few clicks (Home → category → listing or search → listing)
- Category filter sidebar or top filter bar (by category, price range, sort); filters and sort selection persist while browsing (use client-side state or data attributes + small script so changing pages does not reset filters in the demo)
- Product grid (3-col or 4-col): each card has product image (use gradient placeholder if no image), product name, price (formatted with $ symbol, bold), "Add to Cart" button
- Product cards must have hover effects: image slight zoom, card lift shadow
- Pagination or "Load More" button at bottom
- Breadcrumbs at top: Home > Shop
- Use realistic mock product data (8-12 products with varied prices $19.99-$149.99)
- Price display: font-semibold, slightly larger than body text
- Primary CTA: Add to cart; secondary: quick view or save if present — visually distinct
- "Add to Cart" buttons: primary accent color, rounded, hover darker\n`
        : taskLower.includes('cart')
          ? `\n${ecommerceGuidelines}

E-COMMERCE CART PAGE:
This is a shopping cart page. Build it like a real checkout experience (Medusa cart flow per ${ECOMMERCE_MEDUSA_DOCS_LEARN}):
- Cart items list: each row has product thumbnail (small square), product name, unit price, quantity selector (- / number / +), line total, remove button (X)
- Order summary sidebar: subtotal, estimated shipping, estimated tax, order total (bold, larger) — all visible before any payment step
- Copy defaulting to guest checkout (e.g. "Checkout as guest" or no forced account wall before email/shipping)
- If the page includes a checkout step or modal: show a progress indicator (Cart → Details → Payment) or equivalent
- "Proceed to Checkout" button: large, primary accent, full-width in sidebar
- "Continue Shopping" link back to /shop
- Empty cart state: "Your cart is empty" message with CTA to shop
- Use realistic mock cart data (2-3 items)
- Clean table/grid layout, clear visual hierarchy
- For any shipping or contact fields on this page or inline checkout, use appropriate autocomplete attributes (e.g. autocomplete="email", "given-name", "family-name", "address-line1", "postal-code")\n`
          : `\n${ecommerceGuidelines}

E-COMMERCE PAGE:
This page is part of an e-commerce store. Maintain the store aesthetic and Medusa-aligned commerce patterns:
- Keep the cart icon in the nav and search discoverable in the header where applicable
- Use product-oriented language and imagery
- Primary vs secondary CTAs: one clear main action per section (e.g. Shop vs Learn more)
- Maintain trust signals (payment, shipping badges) near purchase paths and in footer\n`
      : ''
  return {
    system:
      'You build pages that match an existing homepage exactly. Same head, nav, footer, fonts, colors. Output ONLY a complete HTML file.\n\n' +
      `HOMEPAGE (index.html) \u2014 match this exact style, head, nav, and footer:\n\n${homepageHtml}\n`,
    prompt: `Create the "${task.title}" page. Reuse the exact <head>, nav, and footer from the homepage.
Write unique <main> content for: ${task.description ?? task.title}
${contactPageBlock}${ecommercePageBlock}
Nav links:
${navList}

Realistic mock data.
${brandBlock}
${imageGuide(imageHints)}
If you add icons, use Lucide with exact placeholders like <i data-lucide="heart"></i>. For brand socials use x, instagram, and whatsapp. NEVER use class="lucide-heart" as the placeholder syntax.
NEVER use placeholder.com, placehold.co, via.placeholder, or random source endpoints like source.unsplash.com.
If verified brand details are provided, keep them exact and do not invent missing contact fields.
Design must match the homepage craft: same fonts, depth (blur, rings, shadows), and motion — not a flat appendix page.
Reuse the same dynamic patterns as the homepage where relevant: data-mobile-nav, data-accordion, data-tab-group, data-carousel, data-counter, data-pricing-billing, with matching inline <script> behavior so buttons and toggles work.
When this site is exported as Next.js or React components, ${MOTION_REACT_GUIDELINES}
Output ONLY the complete HTML file.
CRITICAL: Your output MUST be a complete HTML document starting with <!DOCTYPE html> and containing <html>, <head>, and <body> tags. Do NOT output just a fragment or partial HTML.`,
    temperature: 0.3,
    maxTokens: 8000,
  }
}

export function backendPrompt(
  task: PageTask,
  ctx: PageCtx,
): { system: string; prompt: string; temperature: number; maxTokens: number } {
  return {
    system:
      'You are a backend code generator. Output ONLY file content. No markdown fences.',
    prompt:
      `Project context:\n${JSON.stringify(ctx)}\n\n` +
      `Task: ${task.title}\nDescription: ${task.description ?? ''}\n\n` +
      'Generate the backend code for this task. Output ONLY the file content.',
    temperature: 0.3,
    maxTokens: 8000,
  }
}
