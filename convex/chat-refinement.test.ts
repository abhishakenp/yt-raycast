import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))

describe('convex chat refinement source', () => {
  it('persists chat as a preview-changing refinement instead of message-only storage', () => {
    const source = readFileSync(join(here, 'sessions.ts'), 'utf8')
    const start = source.indexOf('export const sendChatMessage = mutation')
    const end = source.indexOf('export const listChatMessages = query')
    const sendChatSource = source.slice(start, end)

    expect(sendChatSource).toContain('assertCanMutateSession')
    expect(sendChatSource).toContain('assertContentPolicy(content)')
    expect(sendChatSource).toContain('buildChatRefinedPreviewHtml')
    expect(sendChatSource).toContain("role: 'assistant'")
    expect(sendChatSource).toContain("editType: 'chat'")
    expect(sendChatSource).toContain("eventType: 'chat_refinement_started'")
    expect(sendChatSource).toContain("eventType: 'preview_reload'")
    expect(sendChatSource).toContain("eventType: 'chat_refinement_completed'")
    expect(sendChatSource).toContain('previewVersion: nextPreviewVersion')
  })
})
