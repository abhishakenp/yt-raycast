import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import {
  buildChatRefinementPrompt,
  createChatRefinementResponse,
  parseChatRefinementPlan,
} from './chat-refinement-response'

describe('parseChatRefinementPlan', () => {
  it('normalizes model JSON wrapped in markdown fences', () => {
    const plan = parseChatRefinementPlan(`\`\`\`json
{
  "headline": "Launch pastries faster",
  "ctaLabel": "Order a weekend box",
  "replacements": [{"oldText": "Old headline", "newText": "Launch pastries faster"}],
  "sections": [{"kind": "testimonials", "title": "Loved by neighbors", "body": "Weekend croissants sell out by noon."}],
  "assistantSummary": "Updated the hero and added proof."
}
\`\`\``)

    expect(plan).toEqual({
      headline: 'Launch pastries faster',
      ctaLabel: 'Order a weekend box',
      replacements: [
        { oldText: 'Old headline', newText: 'Launch pastries faster' },
      ],
      sections: [
        {
          kind: 'testimonials',
          title: 'Loved by neighbors',
          body: 'Weekend croissants sell out by noon.',
        },
      ],
      assistantSummary: 'Updated the hero and added proof.',
    })
  })
})

describe('buildChatRefinementPrompt', () => {
  it('includes the current HTML, OpenUI source, site spec, and user instruction', () => {
    const prompt = buildChatRefinementPrompt({
      content: 'Make the CTA warmer',
      generationView: {
        session: { prompt: 'Bakery landing page' },
        latestPreview: { html: '<main><h1>Old headline</h1></main>' },
        homeModule: { source: 'root = Text("Old headline")' },
        siteSpec: { specJson: '{"hero":{"headline":"Old headline"}}' },
      },
    })

    expect(prompt.system).toContain('OpenUI site refinement planner')
    expect(prompt.user).toContain('Make the CTA warmer')
    expect(prompt.user).toContain('Old headline')
    expect(prompt.user).toContain('root = Text')
  })
})

describe('createChatRefinementResponse', () => {
  it('keeps the engine text-generation runtime behind the planner path', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'src/features/chat/server/chat-refinement-response.ts',
      ),
      'utf8',
    )
    const imports = source.slice(0, source.indexOf('type ChatRefinementClient'))

    expect(imports).not.toContain('@ship-fast/engine')
    expect(source).toContain("import('@ship-fast/engine')")
    expect(source).toContain("import('@ship-fast/engine/model-list.js')")
  })

  it('persists an AI refinement plan through the Convex chat mutation', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({
        session: { prompt: 'Bakery landing page' },
        latestPreview: { html: '<main><h1>Old headline</h1></main>' },
        homeModule: { source: 'root = Text("Old headline")' },
        siteSpec: { specJson: '{"hero":{"headline":"Old headline"}}' },
      }),
      mutation: vi.fn().mockResolvedValue({
        sessionId: 'session_123',
        previewVersion: 2,
      }),
    }
    const generate = vi.fn().mockResolvedValue(
      JSON.stringify({
        headline: 'Launch pastries faster',
        assistantSummary: 'Updated the hero headline.',
      }),
    )

    const response = await createChatRefinementResponse(
      'session_123',
      new Request('https://ship-fast.test/api/sessions/session_123/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          content: 'Change the headline for a bakery launch',
          anonymousOwnerSecret: 'owner-secret',
        }),
      }),
      { client, generate },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      sessionId: 'session_123',
      previewVersion: 2,
      usedAiPlan: true,
    })
    expect(generate).toHaveBeenCalled()
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      sessionId: 'session_123',
      anonymousOwnerSecret: 'owner-secret',
      content: 'Change the headline for a bakery launch',
      refinementPlanJson: JSON.stringify({
        headline: 'Launch pastries faster',
        assistantSummary: 'Updated the hero headline.',
      }),
    })
  })

  it('falls back to deterministic Convex refinement when the planner fails', async () => {
    const client = {
      query: vi.fn().mockResolvedValue({ latestPreview: { html: '<main />' } }),
      mutation: vi.fn().mockResolvedValue({
        sessionId: 'session_123',
        previewVersion: 2,
      }),
    }

    const response = await createChatRefinementResponse(
      'session_123',
      new Request('https://ship-fast.test/api/sessions/session_123/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content: 'Add a pricing section' }),
      }),
      {
        client,
        generate: vi.fn().mockRejectedValue(new Error('GROQ_API_KEY not set')),
      },
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      usedAiPlan: false,
      plannerError: 'GROQ_API_KEY not set',
    })
    expect(client.mutation).toHaveBeenCalledWith(expect.anything(), {
      sessionId: 'session_123',
      anonymousOwnerSecret: undefined,
      content: 'Add a pricing section',
      refinementPlanJson: undefined,
    })
  })
})
