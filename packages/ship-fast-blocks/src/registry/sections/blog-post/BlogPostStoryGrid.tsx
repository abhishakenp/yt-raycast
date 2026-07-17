import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StoryCard } from '#/section-kit/StoryCard.tsx'
import { useSyncPublicationArticles } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

/**
 * BlogPostStoryGrid — related-articles cards grid for an editorial blog post
 * detail page. A muted-background band with a left-aligned "Related reading"
 * heading above a responsive 1/2/3-column grid of article cards; each card has
 * a hover-zoom cover image, category/date meta, a bold title, and a short
 * excerpt. All cards are clickable and route through useNavigate. Use as the
 * "related reading" / "more stories" section below the body on blogs,
 * magazines, journals, or editorial reading pages.
 */
export const BlogPostStoryGrid = defineCapsule({
  name: 'BlogPostStoryGrid',
  description:
    "Related-articles cards grid for an editorial blog post detail page: a muted-background band with a left-aligned 'Related reading' heading above a responsive 1/2/3-column grid of article cards, each with a hover-zoom cover image, category/date meta, a bold title, and a short excerpt. All cards are clickable and route through useNavigate. Use as the 'related reading' / 'more stories' section below the body on blogs, magazines, journals, or editorial reading pages.",
  props: z.object({
    /** Section heading above the grid. */
    heading: z.string().optional(),
    /** Related article cards. */
    items: z
      .array(
        z.object({
          category: z.string(),
          date: z.string(),
          title: z.string(),
          excerpt: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Related reading'
    const items = props.items?.length
      ? props.items
      : [
          {
            category: 'Team Culture',
            date: 'Feb 28, 2024',
            title: 'Building Design Systems That Actually Get Used',
            excerpt:
              'Lessons from rolling out design systems at three different startups—and why adoption is harder than construction.',
            imageAlt:
              'Design team whiteboarding session with colorful sticky notes on glass wall',
          },
          {
            category: 'UX Research',
            date: 'Feb 10, 2024',
            title: 'The Lost Art of Sketching Before Pixels',
            excerpt:
              'Why the best digital designers still start with analog tools—and how paper prototyping catches problems Figma misses.',
            imageAlt:
              'Close-up of hands sketching wireframes in a notebook with pencil',
          },
          {
            category: 'Design Process',
            date: 'Jan 22, 2024',
            title: 'Measuring Design Quality: Beyond Vanity Metrics',
            excerpt:
              'A framework for quantifying design excellence using behavioral signals instead of NPS scores and gut feelings.',
            imageAlt:
              'Laptop screen showing data analytics dashboard with charts and metrics',
          },
        ]
    useSyncPublicationArticles(
      lakebed,
      items.map((post) => ({
        category: post.category,
        date: post.date,
        excerpt: post.excerpt,
        target: post.title,
        title: post.title,
      })),
    )

    return (
      <section className={cn('bg-muted py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <SectionHeading
            title={heading}
            align="left"
            titleClassName="text-2xl font-semibold tracking-tight"
            className="mb-10"
          />
          <ResponsiveGrid cols="1-md-2-3" gap="lg">
            {items.map((post) => (
              <StoryCard
                key={post.title}
                title={post.title}
                excerpt={post.excerpt}
                imageAlt={post.imageAlt}
                imageW={600}
                imageH={400}
                meta={
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.category}</span>
                    <span aria-hidden="true">•</span>
                    <time>{post.date}</time>
                  </div>
                }
                onClick={() => go(post.title)}
                variant="simple"
              />
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
