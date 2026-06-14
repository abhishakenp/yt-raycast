import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const createTestSession = (t: ReturnType<typeof convexTest>, prompt = 'Test site') =>
  t.runMutation(api.sessions.create, {
    prompt,
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_test',
    anonymousClientId: `anon-${prompt}`,
  })

test('extractCmsBindings parses data-cms attributes', async () => {
  const t = convexTest(schema, modules)

  const { sessionId } = await createTestSession(t)

  const html = `
    <div data-cms="type:text field:title">Hello World</div>
    <div data-cms="type:richtext field:content">Rich text</div>
    <div data-cms="type:image field:hero">Image</div>
    <div data-cms="type:link field:url">Link</div>
  `

  const result = await t.runMutation(internal.sessions.extractCmsBindings, {
    sessionId,
    html,
  })

  expect(result.extracted).toBe(4)
})

test('updateCmsEntry creates entry and revision', async () => {
  const t = convexTest(schema, modules)

  const { sessionId } = await createTestSession(t)

  const bindingId = await t.runMutation(internal.sessions.insertCmsBinding, {
    sessionId,
    selector: 'type:text field:title',
    type: 'text',
    field: 'title',
  })

  const result = await t.runMutation(internal.sessions.updateCmsEntry, {
    sessionId,
    bindingId,
    content: 'Updated content',
    contentType: 'text/plain',
    updatedBy: 'test-user',
  })

  expect(result.success).toBe(true)
})

test('restoreCmsRevision reverts to previous version', async () => {
  const t = convexTest(schema, modules)

  const { sessionId } = await createTestSession(t)

  const bindingId = await t.runMutation(internal.sessions.insertCmsBinding, {
    sessionId,
    selector: 'type:text field:title',
    type: 'text',
    field: 'title',
  })

  await t.runMutation(internal.sessions.updateCmsEntry, {
    sessionId,
    bindingId,
    content: 'Initial content',
    contentType: 'text/plain',
    updatedBy: 'test-user',
  })

  const entries = await t.runQuery(api.sessions.listCmsEntries, { sessionId })
  const entryId = entries[0]._id

  await t.runMutation(internal.sessions.updateCmsEntry, {
    sessionId,
    bindingId,
    content: 'Updated content',
    contentType: 'text/plain',
    updatedBy: 'test-user',
  })

  const revisions = await t.runQuery(internal.sessions.listCmsRevisions, { entryId })
  const revisionId = revisions[0]._id

  const result = await t.runMutation(internal.sessions.restoreCmsRevision, {
    sessionId,
    revisionId,
  })

  expect(result.success).toBe(true)
})

test('CMS image and link edits update rendered preview attributes', async () => {
  const t = convexTest(schema, modules)
  const ownerSecret = 'cms-asset-owner'

  const { sessionId } = await t.runMutation(api.sessions.create, {
    prompt: 'Build a CMS asset editing test site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cms_asset_test',
    anonymousClientId: 'anon-cms-asset-test',
    anonymousOwnerSecret: ownerSecret,
  })

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: `
      <main>
        <img data-cms="type:image field:hero.image" src="https://cdn.example.com/old.jpg" alt="Hero" />
        <a data-cms="type:link field:hero.ctaUrl" href="https://example.com/old">Start now</a>
      </main>
    `,
    openUiSource: 'root = Image("https://cdn.example.com/old.jpg")',
    siteSpecJson: JSON.stringify({
      projectName: 'CMS asset editing test',
      hero: {
        image: 'https://cdn.example.com/old.jpg',
        ctaUrl: 'https://example.com/old',
      },
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  })

  const content = await t.runQuery(api.sessions.listCmsContent, { sessionId })
  const image = content.find((item) => item.field === 'hero.image')
  const link = content.find((item) => item.field === 'hero.ctaUrl')

  expect(content.filter((item) => item.field === 'hero.image')).toHaveLength(1)
  expect(content.filter((item) => item.field === 'hero.ctaUrl')).toHaveLength(1)
  expect(image?.type).toBe('image')
  expect(link?.type).toBe('link')

  await t.runMutation(api.sessions.upsertCmsContentEntry, {
    sessionId,
    anonymousOwnerSecret: ownerSecret,
    bindingId: image!.bindingId,
    content: 'https://cdn.example.com/new.jpg',
    contentType: 'text/uri-list',
    beforeContent: image!.content,
  })

  await t.runMutation(api.sessions.upsertCmsContentEntry, {
    sessionId,
    anonymousOwnerSecret: ownerSecret,
    bindingId: link!.bindingId,
    content: 'https://example.com/new',
    contentType: 'text/uri-list',
    beforeContent: link!.content,
  })

  const view = await t.runQuery(api.sessions.getGenerationView, { sessionId })

  expect(view?.latestPreview?.html).toContain('src="https://cdn.example.com/new.jpg"')
  expect(view?.latestPreview?.html).toContain('href="https://example.com/new"')
  expect(view?.latestPreview?.version).toBe(3)
})

test('CMS seeding extracts generated content collections from site spec without data-cms HTML', async () => {
  const t = convexTest(schema, modules)
  const { sessionId } = await createTestSession(
    t,
    'Build a SaaS blog and portfolio CMS test site',
  )

  await t.action(internal.sessions.completeGeneration, {
    sessionId,
    html: '<main><h1>CMS-rich generated site</h1></main>',
    openUiSource: '$page = "Home"\nroot = Text("CMS-rich generated site")',
    siteSpecJson: JSON.stringify({
      projectName: 'CMS-rich generated site',
      features: [
        {
          title: 'Automated briefs',
          description: 'Turn a rough idea into a structured launch plan.',
        },
      ],
      pricing: [
        {
          name: 'Pro',
          price: '$29',
          bullets: ['Unlimited exports', 'Priority support'],
        },
      ],
      faqs: [
        {
          question: 'Can I edit the generated copy?',
          answer: 'Yes, every generated content field is editable.',
        },
      ],
      blog: {
        posts: [
          {
            title: 'Launch lessons',
            excerpt: 'A short guide to shipping faster.',
            author: 'Maya Chen',
            category: 'Growth',
          },
        ],
      },
      portfolio: {
        projects: [
          {
            title: 'Atlas redesign',
            summary: 'A homepage refresh for a logistics SaaS.',
          },
        ],
      },
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  })

  const content = await t.runQuery(api.sessions.listCmsContent, { sessionId })
  const fields = new Set(content.map((item) => item.field))

  expect(fields.has('features.0.title')).toBe(true)
  expect(fields.has('features.0.description')).toBe(true)
  expect(fields.has('pricing.0.name')).toBe(true)
  expect(fields.has('pricing.0.bullets.0')).toBe(true)
  expect(fields.has('faqs.0.question')).toBe(true)
  expect(fields.has('faqs.0.answer')).toBe(true)
  expect(fields.has('blog.posts.0.title')).toBe(true)
  expect(fields.has('blog.posts.0.author')).toBe(true)
  expect(fields.has('blog.posts.0.category')).toBe(true)
  expect(fields.has('portfolio.projects.0.title')).toBe(true)
  expect(fields.has('portfolio.projects.0.summary')).toBe(true)
  expect(content.find((item) => item.field === 'faqs.0.answer')).toMatchObject({
    type: 'richtext',
    contentType: 'text/markdown',
  })
})
