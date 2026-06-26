// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Id } from '../../../../convex/_generated/dataModel'
import { useCmsController } from './useCmsController'

const controllerState = vi.hoisted(() => ({
  deleteCollectionItem: vi.fn(),
  restoreContentRevision: vi.fn(),
  upsertCollectionItem: vi.fn(),
  upsertContentEntry: vi.fn(),
  useMutationCalls: 0,
}))

vi.mock('convex/react', () => ({
  useMutation: () => {
    const mutations = [
      controllerState.upsertContentEntry,
      controllerState.restoreContentRevision,
      controllerState.upsertCollectionItem,
      controllerState.deleteCollectionItem,
    ]
    return mutations[controllerState.useMutationCalls++]
  },
  useQuery: () => [],
}))

vi.mock('@/features/session/services/anonymous-owner-secret', () => ({
  readAnonymousOwnerSecret: () => 'owner-secret',
}))

describe('useCmsController', () => {
  beforeEach(() => {
    controllerState.useMutationCalls = 0
  })

  afterEach(() => {
    cleanup()
    controllerState.deleteCollectionItem.mockReset()
    controllerState.restoreContentRevision.mockReset()
    controllerState.upsertCollectionItem.mockReset()
    controllerState.upsertContentEntry.mockReset()
    controllerState.useMutationCalls = 0
  })

  it('saves first-party blog posts through the collection mutation', async () => {
    const { result } = renderHook(() => useCmsController('session_123'))

    let didSave: boolean | undefined

    await act(async () => {
      didSave = await result.current.saveBlogPost({
        fields: {
          author: 'Editor',
          body: 'Post body',
          category: 'Guides',
          coverImageUrl: '',
          excerpt: 'Excerpt',
          slug: 'launch',
          status: 'published',
          title: 'Launch',
        },
      })
    })

    expect(didSave).toBe(true)
    expect(controllerState.upsertCollectionItem).toHaveBeenCalledWith({
      sessionId: 'session_123' as Id<'sessions'>,
      anonymousOwnerSecret: 'owner-secret',
      collectionKey: 'blogPosts',
      fields: {
        author: 'Editor',
        body: 'Post body',
        category: 'Guides',
        coverImageUrl: '',
        excerpt: 'Excerpt',
        slug: 'launch',
        status: 'published',
        title: 'Launch',
      },
    })
  })

  it('reports blog post save failures without throwing', async () => {
    controllerState.upsertCollectionItem.mockRejectedValueOnce(
      new Error('Save denied'),
    )
    const { result } = renderHook(() => useCmsController('session_123'))
    let didSave: boolean | undefined

    await act(async () => {
      didSave = await result.current.saveBlogPost({
        fields: {
          author: 'Editor',
          body: 'Post body',
          category: 'Guides',
          coverImageUrl: '',
          excerpt: 'Excerpt',
          slug: 'launch',
          status: 'published',
          title: 'Launch',
        },
      })
    })

    expect(didSave).toBe(false)
    expect(result.current.cmsError).toBe('Save denied')
  })

  it('deletes first-party blog posts through the collection mutation', async () => {
    const { result } = renderHook(() => useCmsController('session_123'))

    await act(async () => {
      await result.current.deleteBlogPost(
        'cms_collection_item_123' as Id<'cmsCollectionItems'>,
      )
    })

    expect(controllerState.deleteCollectionItem).toHaveBeenCalledWith({
      sessionId: 'session_123' as Id<'sessions'>,
      anonymousOwnerSecret: 'owner-secret',
      itemId: 'cms_collection_item_123' as Id<'cmsCollectionItems'>,
    })
  })
})
