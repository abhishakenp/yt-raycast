import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StoryGrid } from '#/section-kit/StoryGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  StoryCard,
  StoryCardImage,
  StoryCardImageContainer,
  StoryCardMeta,
  StoryCardTitle,
  StoryCardExcerpt,
  StoryCardFooter,
  StoryCardBody,
} from '#/section-kit/StoryCard.tsx'
import { useSyncPublicationArticles } from './publication-interactions.tsx'
import { publicationLakebed } from './publication-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * BlogStoryGrid — collapsed-border newsprint story grid for an editorial blog
 * / publication. A serif section header sits on a heavy double masthead rule
 * beside a mono small-caps "view all" arrow-link; below, the stories share
 * hairline column and row rules like a broadsheet page (no gaps, no card
 * chrome) with the lead story spanning two columns on desktop and the final
 * story closing the band as a full-width horizontal ledger row. Each cell
 * carries a mono index + dateline row (№ 01 · tag · date), a hairline-framed
 * grayscale cover that regains color on hover, a serif headline, a clamped
 * excerpt, and a small-caps "By author" byline rule. Cards and the view-all
 * link route through section-kit route links. Use as the story grid /
 * latest-stories / article-listing section on blog homepages, magazine
 * indexes, or editorial landing pages.
 */
export const BlogStoryGrid = defineCapsule({
  name: 'BlogStoryGrid',
  description:
    "Collapsed-border newsprint story grid for an editorial blog or publication: a serif section header on a heavy double masthead rule beside a mono small-caps 'view all' arrow-link, above a broadsheet grid where stories share hairline column and row rules (no gaps, no card chrome), the lead story spans two columns on desktop, and the final story closes the band as a full-width horizontal ledger row. Each cell has a mono index + dateline row (№ 01 · tag · date), a hairline-framed grayscale cover that regains color on hover, a serif headline, a clamped excerpt, and a small-caps 'By author' byline rule. Cards and the view-all link route through section-kit route links. Use as the story grid / latest-stories / article-listing section on blog homepages, magazine indexes, or editorial landing pages.",
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
      <StoryGrid
        aria-label="Latest articles"
        className={cn('pb-16', props.className)}
      >
        <Container size="lg">
          {/* Section header on a heavy double masthead rule. */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-b-2 border-foreground pb-3 shadow-[0_3px_0_-2px] shadow-border">
            <SectionHeading
              align="left"
              title={title}
              className="gap-0"
              titleClassName="font-serif text-2xl font-black tracking-tight text-foreground sm:text-3xl"
            />
            <NavbarRouteLink
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:text-primary"
              href={viewAllTarget}
            >
              {viewAll}
              <Arrow />
            </NavbarRouteLink>
          </div>

          {/* Broadsheet grid: cells draw their own left+top hairlines, the
              container closes right+bottom — collapse survives any span. */}
          <div className="mt-6 grid border-b border-r border-border sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => {
              const isLead = i === 0
              // The final story closes the page as a full-width horizontal
              // ledger row, so the broadsheet never ends on a ragged row.
              const isCloser = i === posts.length - 1 && posts.length > 3
              return (
                <StoryCard
                  key={`${post.tag}:${post.title}`}
                  variant="simple"
                  asChild
                  className={cn(
                    'group rounded-none border-l border-t border-border',
                    isLead && 'sm:col-span-2 lg:col-span-2',
                    isCloser && 'sm:col-span-full',
                  )}
                >
                  <NavbarRouteLink href={postTarget}>
                    <div className="flex h-full flex-col p-5 sm:p-6">
                      {/* Mono index + dateline row. */}
                      <div className="flex items-baseline gap-3 border-b border-border pb-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                          № {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                          {post.tag}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-px flex-1 bg-border"
                        />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {post.date}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'flex flex-1 flex-col',
                          isCloser && 'sm:flex-row sm:items-stretch sm:gap-8',
                        )}
                      >
                        <StoryCardImageContainer
                          className={cn(
                            'mt-5 border border-foreground/25',
                            isCloser && 'sm:w-[38%] sm:shrink-0',
                          )}
                        >
                          <StoryCardImage
                            alt={post.alt}
                            w={800}
                            h={500}
                            className={cn(
                              'h-[11rem] grayscale transition-[filter] duration-500 group-hover:grayscale-0',
                              isLead && 'sm:h-[15rem]',
                              isCloser && 'sm:h-full sm:min-h-[12rem]',
                            )}
                            variant="simple"
                          />
                          <StoryCardMeta />
                        </StoryCardImageContainer>
                        <StoryCardBody className="flex flex-1 flex-col p-0 pt-5">
                          <StoryCardTitle
                            className={cn(
                              'font-serif text-xl font-black leading-snug tracking-tight underline-offset-4 group-hover:underline group-hover:decoration-2',
                              (isLead || isCloser) && 'sm:text-2xl lg:text-3xl',
                            )}
                          >
                            {post.title}
                          </StoryCardTitle>
                          <StoryCardExcerpt
                            className={cn('mt-2.5', isCloser && 'sm:max-w-2xl')}
                          >
                            {post.excerpt}
                          </StoryCardExcerpt>
                          <StoryCardFooter>
                            {
                              <div className="mt-auto flex items-baseline justify-between gap-3 pt-5">
                                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                                  By {post.author}
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="font-serif text-sm leading-none text-muted-foreground/50"
                                >
                                  ✦
                                </span>
                              </div>
                            }
                          </StoryCardFooter>
                        </StoryCardBody>
                      </div>
                    </div>
                  </NavbarRouteLink>
                </StoryCard>
              )
            })}
          </div>
        </Container>
      </StoryGrid>
    )
  },
})
