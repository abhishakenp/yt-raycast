import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Canonical OpenUI system prompt for **server** code (API routes, Bun pipeline).
 *
 * Loaded from `src/openui/generated/system-prompt.txt` so we never import
 * `@openuidev/react-lang` / `contract.ts` here — `createLibrary` uses React
 * `createContext`, which breaks in Route Handler bundles.
 *
 * Regenerate that file when ship-fast OpenUI components / contract change.
 */
const SYSTEM_PROMPT_FILE = join(process.cwd(), 'src/openui/generated/system-prompt.txt')

function loadOpenUISystemPrompt(): string {
  if (!existsSync(SYSTEM_PROMPT_FILE)) {
    throw new Error(
      `Missing OpenUI system prompt file: ${SYSTEM_PROMPT_FILE}. Generate it from the library contract.`,
    )
  }
  return readFileSync(SYSTEM_PROMPT_FILE, 'utf8').replace(/\bStack\(/g, 'Section(')
}

export const OPENUI_SYSTEM_PROMPT = loadOpenUISystemPrompt()
