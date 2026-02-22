import { slug } from '../pipeline/workspace.js'

export function pagePrompt(task, navList, homepageHtml) {
  return {
    system:
      'You build pages that match an existing homepage exactly. Same head, nav, footer, fonts, colors. Output ONLY a complete HTML file.\n\n' +
      `HOMEPAGE (index.html) \u2014 match this exact style, head, nav, and footer:\n\n${homepageHtml}\n`,
    prompt:
      `Create the "${task.title}" page. Reuse the exact <head>, nav, and footer from the homepage.\n` +
      `Write unique <main> content for: ${task.description ?? task.title}\n\n` +
      `Nav links:\n${navList}\n\n` +
      `Realistic mock data. Lorem Picsum for images (https://picsum.photos/seed/${slug(task.title)}/800/400).\n` +
      'Output ONLY the complete HTML file.',
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
