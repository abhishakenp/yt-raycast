// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { applyCmsBlogPostsToPreviewDom } from './cms-preview-sync'

describe('applyCmsBlogPostsToPreviewDom', () => {
  it('injects published CMS blog posts after a publication section', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <main>
        <section aria-label="Latest articles">
          <h2>Latest Articles</h2>
        </section>
      </main>
    `

    applyCmsBlogPostsToPreviewDom(root, [
      {
        itemId: 'post-1',
        title: 'Design Systems Without Burnout',
        slug: 'design-systems-without-burnout',
        excerpt: 'A practical guide to scaling tokens and components.',
        author: 'Maya Chen',
        category: 'Design',
        body: 'Full post body',
        status: 'published',
        updatedAt: 100,
      },
      {
        itemId: 'draft-1',
        title: 'Draft Only',
        slug: 'draft-only',
        excerpt: 'Should stay hidden.',
        author: 'Maya Chen',
        category: 'Drafts',
        body: 'Draft body',
        status: 'draft',
        updatedAt: 101,
      },
    ])

    const injected = root.querySelector('[data-ship-fast-cms-blog-posts]')
    const anchor = root.querySelector('[aria-label="Latest articles"]')

    expect(injected).toBeTruthy()
    expect(anchor?.nextElementSibling).toBe(injected)
    expect(root.textContent).toContain('Design Systems Without Burnout')
    expect(root.textContent).toContain('Maya Chen')
    expect(root.textContent).toContain('Design')
    expect(root.textContent).not.toContain('Draft Only')
    expect(root.textContent).not.toContain('Generated OpenUI source is ready')

    applyCmsBlogPostsToPreviewDom(root, [
      {
        itemId: 'post-1',
        title: 'Design Systems Without Burnout',
        slug: 'design-systems-without-burnout',
        excerpt: 'A practical guide to scaling tokens and components.',
        author: 'Maya Chen',
        category: 'Design',
        body: 'Full post body',
        status: 'published',
        updatedAt: 100,
      },
    ])

    expect(
      root.querySelectorAll('[data-ship-fast-cms-blog-posts]'),
    ).toHaveLength(1)
  })

  it('removes the injected section when no published posts remain', () => {
    const root = document.createElement('div')
    root.innerHTML = '<main><section><h2>From the blog</h2></section></main>'

    applyCmsBlogPostsToPreviewDom(root, [
      {
        itemId: 'post-1',
        title: 'Published Post',
        slug: 'published-post',
        excerpt: 'Visible.',
        author: 'Editorial',
        category: 'News',
        body: 'Full post body',
        status: 'published',
        updatedAt: 100,
      },
    ])
    expect(root.querySelector('[data-ship-fast-cms-blog-posts]')).toBeTruthy()

    applyCmsBlogPostsToPreviewDom(root, [
      {
        itemId: 'draft-1',
        title: 'Draft Post',
        slug: 'draft-post',
        excerpt: 'Hidden.',
        author: 'Editorial',
        category: 'News',
        body: 'Draft body',
        status: 'draft',
        updatedAt: 101,
      },
    ])

    expect(root.querySelector('[data-ship-fast-cms-blog-posts]')).toBeNull()
  })
})
