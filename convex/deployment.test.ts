import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

test('getDeploymentBySlug returns deployment with session metadata', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test site',
    anonymousClientIdHash: 'test-hash',
  })

  await t.runMutation(api.sessions.publishPreview, {
    sessionId,
    requestedSlug: 'test-site',
  })

  const deployment = await t.runQuery(api.sessions.getDeploymentBySlug, {
    slug: 'test-site',
  })

  expect(deployment).not.toBeNull()
  expect(deployment?.slug).toBe('test-site')
  expect(deployment?.session?.id).toBe(sessionId)
})

test('getDeploymentStatus returns deployment status', async () => {
  const t = convexTest(schema, modules)

  const sessionId = await t.runMutation(api.sessions.create, {
    prompt: 'Test site',
    anonymousClientIdHash: 'test-hash',
  })

  await t.runMutation(api.sessions.publishPreview, {
    sessionId,
    requestedSlug: 'test-site',
  })

  const status = await t.runQuery(api.sessions.getDeploymentStatus, {
    sessionId,
  })

  expect(status).not.toBeNull()
  expect(status?.status).toBe('ready')
})
