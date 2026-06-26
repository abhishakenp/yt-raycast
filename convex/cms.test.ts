import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const createTestSession = (
  t: ReturnType<typeof convexTest>,
  prompt = 'Test site',
) =>
  t.mutation(api.sessions.create, {
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

  const result = await t.mutation(internal.sessions.extractCmsBindings, {
    sessionId,
    html,
  })

  expect(result.extracted).toBe(4)
})

test('updateCmsEntry creates entry and revision', async () => {
  const t = convexTest(schema, modules)

  const { sessionId } = await createTestSession(t)

  const bindingId = await t.mutation(internal.sessions.insertCmsBinding, {
    sessionId,
    selector: 'type:text field:title',
    type: 'text',
    field: 'title',
  })

  const result = await t.mutation(internal.sessions.updateCmsEntry, {
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

  const bindingId = await t.mutation(internal.sessions.insertCmsBinding, {
    sessionId,
    selector: 'type:text field:title',
    type: 'text',
    field: 'title',
  })

  await t.mutation(internal.sessions.updateCmsEntry, {
    sessionId,
    bindingId,
    content: 'Initial content',
    contentType: 'text/plain',
    updatedBy: 'test-user',
  })

  const entries = await t.query(api.sessions.listCmsEntries, { sessionId })
  const entryId = entries[0]._id

  await t.mutation(internal.sessions.updateCmsEntry, {
    sessionId,
    bindingId,
    content: 'Updated content',
    contentType: 'text/plain',
    updatedBy: 'test-user',
  })

  const revisions = await t.query(internal.sessions.listCmsRevisions, {
    entryId,
  })
  const revisionId = revisions[0]._id

  const result = await t.mutation(internal.sessions.restoreCmsRevision, {
    sessionId,
    revisionId,
  })

  expect(result.success).toBe(true)
})

test('CMS image and link edits update rendered preview attributes', async () => {
  const t = convexTest(schema, modules)
  const ownerSecret = 'cms-asset-owner'

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: 'Build a CMS asset editing test site',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cms_asset_test',
    anonymousClientId: 'anon-cms-asset-test',
    anonymousOwnerSecret: ownerSecret,
  })

  await t.mutation(internal.sessions.completeGenerationInternal, {
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

  const content = await t.query(api.sessions.listCmsContent, { sessionId })
  const image = content.find((item) => item.field === 'hero.image')
  const link = content.find((item) => item.field === 'hero.ctaUrl')

  expect(content.filter((item) => item.field === 'hero.image')).toHaveLength(1)
  expect(content.filter((item) => item.field === 'hero.ctaUrl')).toHaveLength(1)
  expect(image?.type).toBe('image')
  expect(link?.type).toBe('link')

  await t.mutation(api.sessions.upsertCmsContentEntry, {
    sessionId,
    anonymousOwnerSecret: ownerSecret,
    bindingId: image!.bindingId,
    content: 'https://cdn.example.com/new.jpg',
    contentType: 'text/uri-list',
    beforeContent: image!.content,
  })

  await t.mutation(api.sessions.upsertCmsContentEntry, {
    sessionId,
    anonymousOwnerSecret: ownerSecret,
    bindingId: link!.bindingId,
    content: 'https://example.com/new',
    contentType: 'text/uri-list',
    beforeContent: link!.content,
  })

  const view = await t.query(api.sessions.getGenerationView, { sessionId })

  expect(view?.latestPreview?.html).toContain(
    'src="https://cdn.example.com/new.jpg"',
  )
  expect(view?.latestPreview?.html).toContain('href="https://example.com/new"')
  expect(view?.latestPreview?.version).toBe(3)
})

test('CMS seeding extracts generated content collections from site spec without data-cms HTML', async () => {
  const t = convexTest(schema, modules)
  const { sessionId } = await createTestSession(
    t,
    'Build a SaaS blog and portfolio CMS test site',
  )

  await t.mutation(internal.sessions.completeGenerationInternal, {
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

  const content = await t.query(api.sessions.listCmsContent, { sessionId })
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
}, 15_000)

test('CMS blog post collection publishes into the generated preview', async () => {
  const t = convexTest(schema, modules)
  const ownerSecret = 'cms-blog-owner'

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: 'Build a CMS-ready editorial blog',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cms_blog_test',
    anonymousClientId: 'anon-cms-blog-test',
    anonymousOwnerSecret: ownerSecret,
  })

  await t.mutation(internal.sessions.completeGenerationInternal, {
    sessionId,
    html: '<html><body><main><h1>Editorial Blog</h1><section><h2>Latest posts</h2></section></main></body></html>',
    openUiSource: '$page = "Home"\nroot = Text("Editorial Blog")',
    siteSpecJson: JSON.stringify({
      projectName: 'Editorial Blog',
      blog: { posts: [] },
    }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  })

  const result = await t.mutation(api.sessions.upsertCmsCollectionItem, {
    sessionId,
    anonymousOwnerSecret: ownerSecret,
    collectionKey: 'blogPosts',
    fields: {
      title: 'Launch lessons',
      slug: 'launch-lessons',
      excerpt: 'A practical guide to publishing faster.',
      author: 'Maya Chen',
      category: 'Growth',
      coverImageUrl: 'https://cdn.example.com/launch.jpg',
      body: '## Ship faster\n\nUse a small editorial checklist.',
      status: 'published',
    },
  })

  expect(result.collectionKey).toBe('blogPosts')
  expect(result.slug).toBe('launch-lessons')
  expect(result.previewVersion).toBe(2)

  const collections = await t.query(api.sessions.listCmsCollections, {
    sessionId,
  })
  expect(collections).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        key: 'blogPosts',
        label: 'Blog posts',
        itemCount: 1,
      }),
    ]),
  )

  const items = await t.query(api.sessions.listCmsCollectionItems, {
    sessionId,
    collectionKey: 'blogPosts',
  })
  expect(items).toHaveLength(1)
  expect(items[0]).toMatchObject({
    title: 'Launch lessons',
    slug: 'launch-lessons',
    status: 'published',
  })

  const view = await t.query(api.sessions.getGenerationView, { sessionId })
  expect(view?.latestPreview?.html).toContain('data-cms-collection="blogPosts"')
  expect(view?.latestPreview?.html).toContain('Launch lessons')
  expect(view?.latestPreview?.html).toContain(
    'data-cms-route="/blog/launch-lessons"',
  )
  expect(view?.latestPreview?.html).toContain(
    'Use a small editorial checklist.',
  )
})

test('CMS blog post collection keeps drafts out of the generated preview and removes published posts', async () => {
  const t = convexTest(schema, modules)
  const ownerSecret = 'cms-blog-draft-owner'

  const { sessionId } = await t.mutation(api.sessions.create, {
    prompt: 'Build a publication blog',
    preferredLanguage: 'en',
    preferredExportTarget: 'html',
    isPrivate: false,
    workspace: 'workspace_cms_blog_draft_test',
    anonymousClientId: 'anon-cms-blog-draft-test',
    anonymousOwnerSecret: ownerSecret,
  })

  await t.mutation(internal.sessions.completeGenerationInternal, {
    sessionId,
    html: '<html><body><main><h1>Publication Blog</h1><section>Stories</section></main></body></html>',
    openUiSource: '$page = "Home"\nroot = Text("Publication Blog")',
    siteSpecJson: JSON.stringify({ projectName: 'Publication Blog', blog: {} }),
    tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  })

  const draft = await t.mutation(api.sessions.upsertCmsCollectionItem, {
    sessionId,
    anonymousOwnerSecret: ownerSecret,
    collectionKey: 'blogPosts',
    fields: {
      title: 'Private notes',
      slug: 'private-notes',
      excerpt: 'Internal editorial notes.',
      author: 'Editor',
      category: 'Drafts',
      coverImageUrl: '',
      body: 'This should not be public.',
      status: 'draft',
    },
  })

  const draftView = await t.query(api.sessions.getGenerationView, { sessionId })
  expect(draft.previewVersion).toBe(1)
  expect(draftView?.latestPreview?.html).not.toContain('Private notes')

  const published = await t.mutation(api.sessions.upsertCmsCollectionItem, {
    sessionId,
    anonymousOwnerSecret: ownerSecret,
    itemId: draft.itemId,
    collectionKey: 'blogPosts',
    fields: {
      title: 'Public notes',
      slug: 'public-notes',
      excerpt: 'Published editorial notes.',
      author: 'Editor',
      category: 'News',
      coverImageUrl: '',
      body: 'This should be public.',
      status: 'published',
    },
  })

  expect(published.previewVersion).toBe(2)
  const publishedView = await t.query(api.sessions.getGenerationView, {
    sessionId,
  })
  expect(publishedView?.latestPreview?.html).toContain('Public notes')

  const deleted = await t.mutation(api.sessions.deleteCmsCollectionItem, {
    sessionId,
    anonymousOwnerSecret: ownerSecret,
    itemId: draft.itemId,
  })

  expect(deleted.previewVersion).toBe(3)
  const deletedView = await t.query(api.sessions.getGenerationView, {
    sessionId,
  })
  expect(deletedView?.latestPreview?.html).not.toContain('Public notes')
})
