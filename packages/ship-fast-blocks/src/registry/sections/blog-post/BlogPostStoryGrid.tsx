import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ArticleGrid } from '#/section-kit/ArticleGrid.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StoryGrid } from '#/section-kit/StoryGrid.tsx'
import {
  StoryCard,
  StoryCardImage,
  StoryCardFigure,
  StoryCardMeta,
  StoryCardTitle,
  StoryCardExcerpt,
  StoryCardBody,
} from '#/section-kit/StoryCard.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { useSyncPublicationArticles } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BlogPostStoryGrid — newsprint "further reading" archive band for an
 * editorial blog post detail page. A muted wash band that cuts in on a slanted
 * top seam, opened by a mono index rail ("Archive" — hairline rule — ✦
 * ornament) above the serif heading. Below, a collapsed-border newspaper grid
 * (shared hairlines, no gaps, 1/2/3 columns): each cell is a clickable
 * article card with a sharp hairline-framed cover that renders grayscale and
 * regains color on hover, a mono category · date dateline, a giant faint
 * serif index numeral, a serif headline that underlines on hover, and a short
 * excerpt. All cards route through section-kit route links. Use as the
 * "related reading" / "more stories" section below the body on blogs,
 * magazines, journals, or editorial reading pages.
 */
export const BlogPostStoryGrid = defineCapsule({
  name: 'BlogPostStoryGrid',
  description:
    "Newsprint further-reading archive band for an editorial blog post detail page: a muted wash band cutting in on a slanted top seam, a mono index rail with hairline rule and ornament above the serif heading, and a collapsed-border newspaper grid (shared hairlines, no gaps, 1/2/3 columns) of clickable article cells — each with a sharp hairline-framed grayscale cover that regains color on hover, a mono category · date dateline, a giant faint serif index numeral, a serif headline that underlines on hover, and a short excerpt. All cards are clickable and route through section-kit route links. Use as the 'related reading' / 'more stories' section below the body on blogs, magazines, journals, or editorial reading pages.",
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
      <StoryGrid
        variant="muted"
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 pt-24 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Container size="md" className="relative px-6 lg:px-6">
          {/* Mono archive rail: label — hairline — ornament. */}
          <div className="mb-4 flex items-center gap-4">
            <MonoTag className="flex shrink-0 items-center gap-2 text-foreground">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-primary"
              />
              Archive
            </MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-foreground/20" />
            <span
              aria-hidden="true"
              className="shrink-0 font-serif text-sm text-muted-foreground/60"
            >
              ✦
            </span>
          </div>
          <SectionHeading
            title={heading}
            align="left"
            titleClassName="font-serif text-3xl font-bold tracking-tight md:text-4xl"
            className="mb-10"
          />
          {/* Collapsed-border newspaper grid — hairlines celebrated, no gaps. */}
          <ArticleGrid
            cols="1-md-2-3"
            className="gap-0 border-t border-l border-foreground/20"
          >
            {items.map((post, i) => (
              <StoryCard
                key={`${post.category}:${post.title}`}
                variant="simple"
                asChild
                className="border-r border-b border-foreground/20 bg-background/40 p-6 transition-colors hover:bg-background sm:p-7"
              >
                <NavbarRouteLink href={post.title}>
                  <StoryCardFigure className="relative mb-5 overflow-hidden rounded-none border border-foreground/20">
                    <StoryCardImage
                      alt={post.imageAlt}
                      w={600}
                      h={400}
                      className="grayscale transition-[filter,transform] duration-500 group-hover:grayscale-0"
                    />
                  </StoryCardFigure>
                  <StoryCardBody>
                    <StoryCardMeta>
                      <div className="mb-3 flex items-baseline justify-between gap-3">
                        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          <span className="text-foreground">
                            {post.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <time className="shrink-0">{post.date}</time>
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-serif text-3xl font-bold leading-none text-foreground/15"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </StoryCardMeta>
                    <StoryCardTitle className="font-serif text-xl font-bold leading-snug tracking-tight underline-offset-4 decoration-primary/60 group-hover:underline">
                      {post.title}
                    </StoryCardTitle>
                    <StoryCardExcerpt className="font-serif">
                      {post.excerpt}
                    </StoryCardExcerpt>
                  </StoryCardBody>
                </NavbarRouteLink>
              </StoryCard>
            ))}
          </ArticleGrid>
        </Container>
      </StoryGrid>
    )
  },
})
