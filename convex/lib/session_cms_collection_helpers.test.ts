import { describe, expect, it } from 'vitest'

import type { Doc, Id } from '../_generated/dataModel'
import { applyBlogPostsToPreviewHtml } from './session_cms_collection_helpers'

const blogPost = (
  overrides: Partial<Doc<'cmsCollectionItems'>> = {},
): Doc<'cmsCollectionItems'> =>
  ({
    _creationTime: 1,
    _id: 'cms_item_1' as Id<'cmsCollectionItems'>,
    author: 'Maya Chen',
    body: '## Ship faster\n\nUse a small editorial checklist.',
    category: 'Growth',
    collectionId: 'cms_collection_1' as Id<'cmsCollections'>,
    collectionKey: 'blogPosts',
    createdAt: 1,
    excerpt: 'A practical guide to publishing faster.',
    publishedAt: 1,
    sessionId: 'session_1' as Id<'sessions'>,
    slug: 'launch-lessons',
    status: 'published',
    title: 'Launch lessons',
    updatedAt: 1,
    ...overrides,
  }) as Doc<'cmsCollectionItems'>

describe('session CMS collection helpers', () => {
  it('injects published blog post index and route markup into preview html', () => {
    const html =
      '<html><body><main><h1>Editorial Blog</h1></main></body></html>'

    const result = applyBlogPostsToPreviewHtml(html, [blogPost()])

    expect(result).toContain('data-cms-collection="blogPosts"')
    expect(result).toContain('Launch lessons')
    expect(result).toContain('data-cms-route="/blog/launch-lessons"')
    expect(result).toContain('Use a small editorial checklist.')
    expect(result.indexOf('data-cms-collection="blogPosts"')).toBeLessThan(
      result.indexOf('</main>'),
    )
  })

  it('removes the managed blog block when no published posts remain', () => {
    const html =
      '<html><body><main><h1>Editorial Blog</h1></main></body></html>'
    const withPost = applyBlogPostsToPreviewHtml(html, [blogPost()])

    const result = applyBlogPostsToPreviewHtml(withPost, [])

    expect(result).not.toContain('data-cms-collection="blogPosts"')
    expect(result).not.toContain('Launch lessons')
    expect(result).toContain('<h1>Editorial Blog</h1>')
  })
})
