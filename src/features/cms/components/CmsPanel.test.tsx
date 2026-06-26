// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { Id } from '../../../../convex/_generated/dataModel'
import { CmsPanel } from './CmsPanel'

const cmsState = vi.hoisted(() => ({
  blogPosts: [
    {
      itemId: 'cms_item_1' as Id<'cmsCollectionItems'>,
      collectionKey: 'blogPosts',
      slug: 'launch-lessons',
      title: 'Launch lessons',
      excerpt: 'A practical launch guide.',
      author: 'Maya Chen',
      category: 'Growth',
      coverImageUrl: 'https://cdn.example.com/launch.jpg',
      body: 'Post body',
      status: 'published',
      updatedAt: 100,
    },
  ],
  content: [
    {
      bindingId: 'cms_binding_1' as Id<'cmsBindings'>,
      entryId: 'cms_entry_1' as Id<'cmsEntries'>,
      selector: 'field:hero.headline',
      field: 'hero.headline',
      type: 'text',
      content: 'Current headline',
      contentType: 'text/plain',
      updatedAt: 100,
    },
  ],
  deleteBlogPost: vi.fn(),
  restoreRevision: vi.fn(),
  saveBlogPost: vi.fn(),
  saveContent: vi.fn(),
  useCmsController: vi.fn(),
}))

vi.mock('../hooks/useCmsController', () => ({
  useCmsController: (...args: unknown[]) => {
    cmsState.useCmsController(...args)
    return {
      blogPosts: cmsState.blogPosts,
      cmsError: undefined,
      content: cmsState.content,
      deleteBlogPost: cmsState.deleteBlogPost,
      isRestoring: false,
      isSaving: false,
      isSavingBlogPost: false,
      restoreRevision: cmsState.restoreRevision,
      saveBlogPost: cmsState.saveBlogPost,
      saveContent: cmsState.saveContent,
    }
  },
}))

vi.mock('convex/react', () => ({
  useQuery: () => [],
}))

describe('CmsPanel', () => {
  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    cmsState.deleteBlogPost.mockReset()
    cmsState.restoreRevision.mockReset()
    cmsState.saveBlogPost.mockReset()
    cmsState.saveContent.mockReset()
    cmsState.useCmsController.mockReset()
  })

  it('keeps generated page fields on the default tab', () => {
    render(<CmsPanel sessionId="session_123" prompt="Fallback prompt" />)

    expect(screen.getByRole('button', { name: 'Page fields' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Blog posts' })).toBeTruthy()
    expect(screen.getByDisplayValue('Current headline')).toBeTruthy()
    expect(screen.queryByLabelText('Title')).toBeNull()
  })

  it('creates a published blog post from the Blog posts tab', () => {
    render(<CmsPanel sessionId="session_123" prompt="Fallback prompt" />)

    fireEvent.click(screen.getByRole('button', { name: 'Blog posts' }))
    expect(screen.getByText('Launch lessons')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New launch checklist' },
    })
    fireEvent.change(screen.getByLabelText('Slug'), {
      target: { value: 'new-launch-checklist' },
    })
    fireEvent.change(screen.getByLabelText('Excerpt'), {
      target: { value: 'A short checklist for new posts.' },
    })
    fireEvent.change(screen.getByLabelText('Author'), {
      target: { value: 'Editor' },
    })
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Guides' },
    })
    fireEvent.change(screen.getByLabelText('Cover image URL'), {
      target: { value: 'https://cdn.example.com/checklist.jpg' },
    })
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: '## Checklist\n\nWrite, publish, share.' },
    })
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'published' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save blog post' }))

    expect(cmsState.saveBlogPost).toHaveBeenCalledWith({
      fields: {
        author: 'Editor',
        body: '## Checklist\n\nWrite, publish, share.',
        category: 'Guides',
        coverImageUrl: 'https://cdn.example.com/checklist.jpg',
        excerpt: 'A short checklist for new posts.',
        slug: 'new-launch-checklist',
        status: 'published',
        title: 'New launch checklist',
      },
    })
  })

  it('restores the active blog tab and draft after a remount', () => {
    const { unmount } = render(
      <CmsPanel sessionId="session_123" prompt="Fallback prompt" />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Blog posts' }))
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Persisted blog draft' },
    })
    fireEvent.change(screen.getByLabelText('Body'), {
      target: { value: 'Draft body survives remounts.' },
    })
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'published' },
    })

    unmount()
    render(<CmsPanel sessionId="session_123" prompt="Fallback prompt" />)

    expect(screen.queryByDisplayValue('Current headline')).toBeNull()
    expect(screen.getByDisplayValue('Persisted blog draft')).toBeTruthy()
    expect(screen.getByDisplayValue('persisted-blog-draft')).toBeTruthy()
    expect(
      screen.getByDisplayValue('Draft body survives remounts.'),
    ).toBeTruthy()
    expect((screen.getByLabelText('Status') as HTMLSelectElement).value).toBe(
      'published',
    )
  })
})
