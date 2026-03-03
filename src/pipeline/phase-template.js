// Template generation phase — disabled (using direct LLM homepage generation)
export async function generateTemplate(_siteType, _workspace, log) {
  log('  template: skipped (using direct generation)')
  return { content: '', inputTokens: 0, outputTokens: 0, cost: 0 }
}
