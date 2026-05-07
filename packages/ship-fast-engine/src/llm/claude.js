import { query } from '@anthropic-ai/claude-agent-sdk'

function cleanEnv() {
  const env = { ...process.env }
  delete env.ANTHROPIC_API_KEY
  delete env.CLAUDECODE
  const extraPaths = ['/Users/livio/.local/bin', '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin']
  const current = env.PATH || ''
  const missing = extraPaths.filter((p) => !current.includes(p))
  if (missing.length) env.PATH = `${missing.join(':')}:${current}`
  return env
}

export async function claudeStream(prompt, { system, onChunk } = {}) {
  let full = ''
  const sdkStream = query({
    prompt,
    options: {
      maxTurns: 1,
      tools: [],
      allowedTools: [],
      permissionMode: 'acceptEdits',
      includePartialMessages: true,
      ...(system ? { systemPrompt: system } : {}),
      env: cleanEnv(),
    },
  })
  for await (const message of sdkStream) {
    if (message.type === 'stream_event') {
      const event = message.event
      if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        const text = event.delta.text || ''
        if (text) {
          full += text
          onChunk?.(text)
        }
      }
    } else if (message.type === 'assistant' && !full) {
      for (const block of message.message?.content ?? []) {
        if (block.type === 'text' && block.text) {
          full += block.text
          onChunk?.(block.text)
        }
      }
    }
  }
  return full
}

export async function claude(prompt, opts = {}) {
  return claudeStream(prompt, opts)
}
