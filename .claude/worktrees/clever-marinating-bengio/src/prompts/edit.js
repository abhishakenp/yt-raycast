export function editPrompt(prompt, task, html, homepageRef) {
  return {
    system:
      `You are a frontend code editor. You receive an existing HTML page and an edit instruction. ` +
      `Apply ONLY the requested changes. You MUST preserve:\n` +
      `- The exact same color scheme / dark mode / light mode as the original\n` +
      `- The project name, branding, and logo\n` +
      `- The nav structure and footer\n` +
      `- The <head> (fonts, Tailwind, meta tags)\n` +
      `- All existing page content not mentioned in the edit instruction\n` +
      `Do NOT change the theme, colors, or branding unless explicitly asked. ` +
      `Match the homepage styling exactly for consistency across all pages. ` +
      `Output ONLY the complete modified HTML file. No markdown fences, no explanation.${
        homepageRef
      }`,
    prompt:
      `EDIT INSTRUCTION (apply ONLY this change, preserve everything else including colors/theme/branding):\n${prompt}\n\n` +
      `CURRENT FILE (${task.filename}):\n${html}\n\n` +
      'Apply ONLY the edit instruction. Keep the same dark/light mode, colors, project name, nav, footer. Output ONLY the complete updated HTML file.',
    temperature: 0.3,
    maxTokens: 16000,
  }
}
