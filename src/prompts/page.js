import { isMixedEnglishIndicCode } from '../config/languages.js'
import { brandProfilePromptBlock } from './brand-profile.js'

function imageGuide(imageHints) {
  const photos = imageHints?.photos ?? []
  if (!photos.length) {
    return 'No curated verified images are available. Do not insert unrelated stock photos. If a section still needs visual weight, use gradients, patterns, icons, framed typography, or reuse existing layout treatments instead of random images.'
  }

  const lines = photos
    .slice(0, 8)
    .map((photo, index) => {
      const hint = String(
        photo.query && photo.alt && photo.alt !== photo.query
          ? `[${photo.query}] ${photo.alt}`
          : photo.alt || photo.query,
      ).slice(0, 140)
      return `- ${index + 1}. ${hint}: ${photo.url}`
    })
    .join('\n')
  return `Use these verified image URLs first:\n${lines}\nReuse the closest matching verified URL if multiple cards need similar imagery. If no line is a good fit, avoid adding a random photo and use a non-photo visual treatment instead.`
}

export function pagePrompt(
  task,
  navList,
  homepageHtml,
  imageHints = null,
  indiaMode = null,
  brandProfile = null,
) {
  const mixedEn = isMixedEnglishIndicCode(indiaMode?.language?.code)
  const langNote = mixedEn
    ? `\n\nLANGUAGE: ${indiaMode.language?.name || 'Mixed'} — match the homepage. All new visible text stays a natural mix of the local language and English, not a single language throughout unless a short fragment requires it.\n`
    : indiaMode?.code && indiaMode.code !== 'en'
      ? `\n\nLANGUAGE: ${indiaMode.name} — all visible text must be in ${indiaMode.name}. Match the homepage language.\n`
      : ''
  const brandBlock = brandProfilePromptBlock(brandProfile)
  return {
    system:
      'You build pages that match an existing homepage exactly. Same head, nav, footer, fonts, colors. Output ONLY a complete HTML file.\n\n' +
      `HOMEPAGE (index.html) \u2014 match this exact style, head, nav, and footer:\n\n${homepageHtml}\n`,
    prompt: `Create the "${task.title}" page. Reuse the exact <head>, nav, and footer from the homepage.
Write unique <main> content for: ${task.description ?? task.title}

${langNote}Nav links:
${navList}

Realistic mock data.
${brandBlock}
${imageGuide(imageHints)}
If you add icons, use Lucide with exact placeholders like <i data-lucide="heart"></i>. For brand socials use x, instagram, and whatsapp. NEVER use class="lucide-heart" as the placeholder syntax.
NEVER use placeholder.com, placehold.co, via.placeholder, or random source endpoints like source.unsplash.com.
If verified brand details are provided, keep them exact and do not invent missing contact fields.
Design must match the homepage craft: same fonts, depth (blur, rings, shadows), and motion — not a flat appendix page.
Reuse the same dynamic patterns as the homepage where relevant: data-mobile-nav, data-accordion, data-tab-group, data-carousel, data-counter, data-pricing-billing, with matching inline <script> behavior so buttons and toggles work.
Output ONLY the complete HTML file.`,
    temperature: 0.3,
    maxTokens: 8000,
  }
}

export function backendPrompt(task, ctx) {
  return {
    system: 'You are a backend code generator. Output ONLY file content. No markdown fences.',
    prompt:
      `Project context:\n${JSON.stringify(ctx)}\n\n` +
      `Task: ${task.title}\nDescription: ${task.description ?? ''}\n\n` +
      'Generate the backend code for this task. Output ONLY the file content.',
    temperature: 0.3,
    maxTokens: 8000,
  }
}
