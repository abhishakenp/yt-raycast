import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { readAnonymousOwnerSecret } from '@/features/session/services/anonymous-owner-secret'

type CmsContentType = 'text' | 'richtext' | 'image' | 'link'

export type CmsBlogPostFields = {
  title: string
  slug: string
  excerpt: string
  author: string
  category: string
  coverImageUrl: string
  body: string
  status: 'draft' | 'published'
}

export const useCmsController = (sessionId: string) => {
  const upsertContentEntry = useMutation(api.sessions.upsertCmsContentEntry)
  const restoreContentRevision = useMutation(
    api.sessions.restoreCmsContentRevision,
  )
  const upsertCollectionItem = useMutation(api.sessions.upsertCmsCollectionItem)
  const deleteCollectionItem = useMutation(api.sessions.deleteCmsCollectionItem)
  const content = useQuery(api.sessions.listCmsContent, {
    sessionId: sessionId as Id<'sessions'>,
  })
  const blogPosts = useQuery(api.sessions.listCmsCollectionItems, {
    sessionId: sessionId as Id<'sessions'>,
    collectionKey: 'blogPosts',
  })
  const [cmsError, setCmsError] = useState<string>()
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingBlogPost, setIsSavingBlogPost] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const readOwnerSecret = () =>
    typeof window === 'undefined'
      ? undefined
      : readAnonymousOwnerSecret(window.localStorage, sessionId)

  const saveContent = async (input: {
    bindingId?: Id<'cmsBindings'>
    selector?: string
    type?: CmsContentType
    field?: string
    content: string
    contentType?: string
    beforeContent?: string
  }) => {
    setCmsError(undefined)
    setIsSaving(true)

    try {
      await upsertContentEntry({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret: readOwnerSecret(),
        ...input,
      })
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const restoreRevision = async (revisionId: Id<'cmsRevisions'>) => {
    setCmsError(undefined)
    setIsRestoring(true)

    try {
      await restoreContentRevision({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret: readOwnerSecret(),
        revisionId,
      })
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Restore failed')
    } finally {
      setIsRestoring(false)
    }
  }

  const saveBlogPost = async (input: {
    itemId?: Id<'cmsCollectionItems'>
    fields: CmsBlogPostFields
  }): Promise<boolean> => {
    setCmsError(undefined)
    setIsSavingBlogPost(true)

    try {
      await upsertCollectionItem({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret: readOwnerSecret(),
        collectionKey: 'blogPosts',
        ...input,
      })
      return true
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Save failed')
      return false
    } finally {
      setIsSavingBlogPost(false)
    }
  }

  const deleteBlogPost = async (itemId: Id<'cmsCollectionItems'>) => {
    setCmsError(undefined)
    setIsSavingBlogPost(true)

    try {
      await deleteCollectionItem({
        sessionId: sessionId as Id<'sessions'>,
        anonymousOwnerSecret: readOwnerSecret(),
        itemId,
      })
    } catch (error) {
      setCmsError(error instanceof Error ? error.message : 'Delete failed')
    } finally {
      setIsSavingBlogPost(false)
    }
  }

  return {
    blogPosts,
    content,
    cmsError,
    deleteBlogPost,
    isRestoring,
    isSaving,
    isSavingBlogPost,
    restoreRevision,
    saveBlogPost,
    saveContent,
  }
}
