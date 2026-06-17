import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const requireEventStream = <T>(stream: T | null): T => {
  if (stream === null) throw new Error('Expected event stream')
  return stream
}

const createReadySession = async (
  t: ReturnType<typeof convexTest>,
  html = '<html><body><main><h1>Old headline</h1><a href="/start">Start now</a></main></body></html>',
) => {
  const created = await t.mutation(api.sessions.create, {
    prompt: 'Build a durable chat refinement test site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_chat_refinement',
    anonymousClientId: 'anon-chat-refinement',
    anonymousOwnerSecret: 'owner-secret',
  })

  await t.mutation(internal.sessions.completeGenerationInternal, {
    sessionId: created.sessionId,
    html,
    siteSpecJson: JSON.stringify({
      brand: 'Durable chat test',
      hero: {
        headline: 'Old headline',
        ctaLabel: 'Start now',
      },
      sections: [],
    }),
    openUiSource:
      '$page = "Home"\nroot = Text("Old headline")\ncta = Button("Start now")',
    tasks: [
      {
        id: 'home.openui',
        label: 'Generate homepage',
        status: 'DONE',
      },
    ],
  })

  return created
}

test('sendChatMessage changes durable preview HTML and stores chat history', async () => {
  const t = convexTest(schema, modules)
  const { sessionId } = await createReadySession(t)

  const result = await t.mutation(api.sessions.sendChatMessage, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    content: 'Change headline to "Launch pastries faster"',
  })

  const preview = await t.query(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })
  const history = await t.query(api.sessions.listPreviewHistory, {
    sessionId,
  })
  const messages = await t.query(api.sessions.listChatMessages, {
    sessionId,
  })
  const stream = requireEventStream(
    await t.query(api.sessions.getEventStream, {
      lookup: sessionId,
    }),
  )
  const generationView = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })

  expect(result.previewVersion).toBe(2)
  expect(preview?.previewVersion).toBe(2)
  expect(preview?.html).toContain('<h1>Launch pastries faster</h1>')
  expect(preview?.html).not.toContain('Old headline')
  expect(history[0]).toMatchObject({ version: 2, source: 'edit' })
  expect(messages.map((message) => message.role)).toEqual(['user', 'assistant'])
  expect(messages[1].content).toContain('Updated the primary headline')
  expect(generationView?.homeModule?.source).toContain(
    'Text("Launch pastries faster")',
  )
  expect(generationView?.homeModule?.source).toContain(
    'ship-fast-chat-refinement:2',
  )
  expect(generationView?.siteSpec?.specJson).toContain(
    '"headline":"Launch pastries faster"',
  )
  expect(generationView?.siteSpec?.specJson).toContain(
    '"shipFastChatRefinements"',
  )
  expect(stream.events.map((event) => event.eventType)).toEqual(
    expect.arrayContaining([
      'chat_refinement_started',
      'preview_reload',
      'chat_refinement_completed',
    ]),
  )
})

test('sendChatMessage can add requested sections when no direct text target exists', async () => {
  const t = convexTest(schema, modules)
  const { sessionId } = await createReadySession(t)

  await t.mutation(api.sessions.sendChatMessage, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    content: 'Add a testimonials section about weekend croissants',
  })

  const preview = await t.query(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })
  const messages = await t.query(api.sessions.listChatMessages, {
    sessionId,
  })
  const generationView = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })

  expect(preview?.html).toContain('testimonial section')
  expect(preview?.html).toContain('weekend croissants')
  expect(preview?.html).not.toContain('data-ship-fast-chat-note')
  expect(preview?.html).not.toContain('ship-fast-chat-refinement-note')
  expect(messages[1].content).toContain('Added a testimonials section')
  expect(generationView?.homeModule?.source).toContain(
    'ship-fast-chat-refinement:2',
  )
  expect(generationView?.siteSpec?.specJson).toContain('weekend croissants')
})

test('sendChatMessage applies AI refinement plans across preview, OpenUI, and site spec', async () => {
  const t = convexTest(schema, modules)
  const { sessionId } = await createReadySession(t)

  await t.mutation(api.sessions.sendChatMessage, {
    sessionId,
    anonymousOwnerSecret: 'owner-secret',
    content: 'Make the bakery launch page more premium',
    refinementPlanJson: JSON.stringify({
      headline: 'Premium pastries, launched daily',
      ctaLabel: 'Reserve a tasting box',
      replacements: [
        {
          oldText: 'Old headline',
          newText: 'Premium pastries, launched daily',
        },
      ],
      sections: [
        {
          kind: 'testimonials',
          title: 'Loved before sunrise',
          body: 'Regulars reserve croissants before the first tray cools.',
        },
      ],
      assistantSummary: 'Updated the hero, CTA, and proof section.',
    }),
  })

  const preview = await t.query(api.sessions.getPublicPreview, {
    lookup: sessionId,
  })
  const generationView = await t.query(api.sessions.getGenerationView, {
    lookup: sessionId,
  })
  const messages = await t.query(api.sessions.listChatMessages, {
    sessionId,
  })

  expect(preview?.html).toContain('<h1>Premium pastries, launched daily</h1>')
  expect(preview?.html).toContain('Reserve a tasting box')
  expect(preview?.html).toContain('Loved before sunrise')
  expect(generationView?.homeModule?.source).toContain(
    'Text("Premium pastries, launched daily")',
  )
  expect(generationView?.homeModule?.source).toContain(
    'Button("Reserve a tasting box")',
  )
  expect(generationView?.siteSpec?.specJson).toContain(
    '"headline":"Premium pastries, launched daily"',
  )
  expect(generationView?.siteSpec?.specJson).toContain(
    '"ctaLabel":"Reserve a tasting box"',
  )
  expect(messages.at(-1)?.content).toBe(
    'Updated the hero, CTA, and proof section.',
  )
})
