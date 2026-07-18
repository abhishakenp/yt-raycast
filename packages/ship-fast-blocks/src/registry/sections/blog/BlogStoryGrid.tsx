import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ArticleGrid } from '#/section-kit/ArticleGrid.tsx'
import { StoryCard } from '#/section-kit/StoryCard.tsx'
import { useSyncPublicationArticles } from './publication-interactions.tsx'
import { publicationLakebed } from './publication-lakebed.ts'

/**
 * BlogStoryGrid — responsive story-grid for an editorial blog / publication.
 * A section header with a heading and a "view all" arrow-link above a 1/2/3-column
 * grid of story cards. Each card has a tagged cover image that zooms on hover, a
 * title, clamped excerpt, and an author/date footer. Cards and the view-all link
 * route through useNavigate. Use as the story grid / latest-stories / article-listing
 * section on blog homepages, magazine indexes, or editorial landing pages.
 */
export const BlogStoryGrid = defineCapsule({
  name: 'BlogStoryGrid',
  description:
    "Responsive story-grid section for an editorial blog or publication: a section header with a heading and a 'view all' arrow-link above a 1/2/3-column grid of story cards. Each card has a tagged cover image that zooms on hover, a title, clamped excerpt, and an author/date footer. Cards and the view-all link route through useNavigate. Use as the story grid / latest-stories / article-listing section on blog homepages, magazine indexes, or editorial landing pages.",
  props: z.object({
    /** Section heading text. */
    title: z.string().optional(),
    /** 'View all' link label. */
    viewAll: z.string().optional(),
    /** Navigation target for the view-all link. */
    viewAllTarget: z.string().optional(),
    /** Navigation target for each card click. */
    postTarget: z.string().optional(),
    /** Article cards. */
    posts: z
      .array(
        z.object({
          tag: z.string(),
          title: z.string(),
          excerpt: z.string(),
          author: z.string(),
          date: z.string(),
          /** Alt text driving the card cover image (never a raw src). */
          alt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const title = props.title ?? 'Latest stories'
    const viewAll = props.viewAll ?? 'View all'
    const viewAllTarget = props.viewAllTarget ?? 'View all'
    const postTarget = props.postTarget ?? 'Blog post'
    const posts = props.posts?.length
      ? props.posts
      : [
          {
            tag: 'Engineering',
            title: 'Why We Moved to Edge-First Rendering',
            excerpt:
              'Latency matters more than raw throughput. Shifting rendering to the edge cut our time-to-interactive in half — and simplified our mental model.',
            author: 'Noah Reeves',
            date: 'May 25',
            alt: 'MacBook on a minimalist desk with a plant',
          },
          {
            tag: 'Product',
            title: 'Running Discovery Without a Brief',
            excerpt:
              'Some of the most useful research starts messy. A look at how unstructured conversations with users can reveal problems no survey ever would.',
            author: 'Ava Morales',
            date: 'May 22',
            alt: 'Colorful sticky notes on a glass wall during a workshop',
          },
          {
            tag: 'Design',
            title: 'Typography as Interface',
            excerpt:
              'Type is not decoration — it is navigation, tone, and structure. Here is how we use hierarchy to guide attention without adding a single extra pixel.',
            author: 'Liam Park',
            date: 'May 19',
            alt: 'Wireframes on a tablet and printed sheets on a desk',
          },
          {
            tag: 'Engineering',
            title: 'Refactoring for Deletion',
            excerpt:
              'The best code is the code you do not have to maintain. A practical guide to shrinking surface area while keeping systems reliable.',
            author: 'Sofia Andersson',
            date: 'May 15',
            alt: 'Code editor on a dark theme with syntax highlighting',
          },
          {
            tag: 'Technology',
            title: 'The Infrastructure Behind Real-Time Collaboration',
            excerpt:
              'Operational transforms, CRDTs, and WebSockets — a plain-language tour of what keeps multiplayer documents in sync at scale.',
            author: 'Raj Patel',
            date: 'May 12',
            alt: 'Futuristic server room with blue ambient lighting',
          },
          {
            tag: 'Design',
            title: 'Color Palettes That Respect Accessibility',
            excerpt:
              'Contrast is not enough. Learn how to build flexible color scales that stay accessible across themes, modes, and devices.',
            author: 'Emma Lin',
            date: 'May 08',
            alt: 'Abstract geometric shapes in soft pastel colors',
          },
        ]
    useSyncPublicationArticles(
      lakebed,
      posts.map((post) => ({
        author: post.author,
        category: post.tag,
        date: post.date,
        excerpt: post.excerpt,
        target: postTarget,
        title: post.title,
      })),
    )

    const Arrow = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <section
        aria-label="Latest articles"
        className={cn('mx-auto w-full max-w-6xl px-6 pb-14', props.className)}
      >
        <div className="flex flex-col items-start gap-1.5 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => go(viewAllTarget)}
            className="group inline-flex items-center gap-2 text-[0.85rem] font-semibold text-primary"
          >
            {viewAll}
            <Arrow />
          </button>
        </div>

        <ArticleGrid cols="1-2-3">
          {posts.map((post) => (
            <StoryCard
              key={post.title}
              title={post.title}
              excerpt={post.excerpt}
              imageAlt={post.alt}
              imageW={800}
              imageH={500}
              imageClassName="h-[12.5rem]"
              meta={
                <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.06em] text-foreground shadow-sm backdrop-blur">
                  {post.tag}
                </span>
              }
              footer={
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
                  <span className="inline-flex items-center gap-2.5 text-[0.82rem] font-semibold text-foreground">
                    <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[0.625rem] font-bold text-primary-foreground">
                      {post.author.charAt(0)}
                    </span>
                    {post.author}
                  </span>
                  <span className="text-[0.78rem] text-muted-foreground">
                    {post.date}
                  </span>
                </div>
              }
              onClick={() => go(postTarget)}
              variant="bordered"
            />
          ))}
        </ArticleGrid>
      </section>
    )
  },
})
