import { slug } from '../pipeline/workspace.js'

function imageGuide(imageHints) {
  const photos = imageHints?.photos ?? []
  if (!photos.length) {
    return `No curated Pexels images are available yet.\nFor fallback only, use realistic results from Picsum:\nhttps://picsum.photos/seed/{descriptive-seed}/{width}/{height}`
  }

  const lines = photos
    .slice(0, 8)
    .map((photo, index) => {
      const hint = String(photo.alt || photo.query).slice(0, 120)
      return `- ${index + 1}. ${hint}: ${photo.url}`
    })
    .join('\n')
  return `Use these Pexels images first:\n${lines}\nIf these are not suitable, use https://picsum.photos/seed/{descriptive-seed}/{width}/{height} as fallback.`
}

export function pagePrompt(task, navList, homepageHtml, imageHints = null, indiaMode = null) {
  const hinglish = indiaMode?.language?.code === 'hinglish'
  const hinglishNote = hinglish
    ? '\n\nLANGUAGE: Hinglish — match the homepage. All new visible text stays a natural Hindi–English mix, not pure Hindi or pure English.\n'
    : ''
  return {
    system:
      'You build pages that match an existing homepage exactly. Same head, nav, footer, fonts, colors. Output ONLY a complete HTML file.\n\n' +
      `HOMEPAGE (index.html) \u2014 match this exact style, head, nav, and footer:\n\n${homepageHtml}\n`,
    prompt: `Create the "${task.title}" page. Reuse the exact <head>, nav, and footer from the homepage.
Write unique <main> content for: ${task.description ?? task.title}

${hinglishNote}Nav links:
${navList}

Realistic mock data.
${imageGuide(imageHints)}
Example fallback seed: https://picsum.photos/seed/${slug(task.title)}/800/400.
NEVER use placeholder.com, placehold.co, via.placeholder, or unsplash source URLs.
Design must feel vibrant and modern \u2014 match the homepage energy with bold colors and generous whitespace.
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
