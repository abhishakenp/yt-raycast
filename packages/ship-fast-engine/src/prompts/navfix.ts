export function navfixPrompt(
  navList: string,
  fileContent: string,
): { system: string; prompt: string; temperature: number; maxTokens: number } {
  return {
    system:
      'You are a code editor. Fix nav href links. Output ONLY the complete HTML file. No markdown fences.',
    prompt:
      'Fix ONLY the href links in the nav/header so all pages are linked correctly.\n' +
      'Do NOT change anything else \u2014 no styles, no content, no layout.\n\n' +
      `All pages (use these exact filenames as href values):\n${navList}\n\n` +
      `Current file (index.html):\n${fileContent}\n\n` +
      'Output ONLY the complete updated HTML file.',
    temperature: 0.2,
    maxTokens: 16000,
  }
}
