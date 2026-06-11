import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api, internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

test('extractCmsBindings parses data-cms attributes', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test site',
    anonymousClientIdHash: 'test-hash',
  })

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

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test site',
    anonymousClientIdHash: 'test-hash',
  })

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

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test site',
    anonymousClientIdHash: 'test-hash',
  })

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
