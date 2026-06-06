// @ts-ignore — JSON fixture is resolved at bundle time
import randomPrompts from '../../../fixtures/random_prompt.json'

function resolveNodeEnv(): string {
  if (typeof process === 'undefined') return 'development'
  return process.env?.NEXT_PUBLIC_NODE_ENV ?? process.env?.NODE_ENV ?? 'development'
}

function withNodeEnvPrefill(prompt: string): string {
  return prompt.replace(/process\.env\.NODE_ENV/g, `"${resolveNodeEnv()}"`)
}

export function getRandomPrompt(): string {
  const index = Math.floor(Math.random() * randomPrompts.length)
  return withNodeEnvPrefill(randomPrompts[index])
}
