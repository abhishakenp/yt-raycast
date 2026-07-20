import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StoryGrid } from '#/section-kit/StoryGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  ArticleGrid,
  ArticleCard,
  ArticleContent,
} from '#/section-kit/ArticleGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * DocsStoryGrid — "Terminal-docs" popular-guides ledger for a developer
 * DOCUMENTATION site. An asymmetric header row (left-aligned SectionHeading
 * with mono "Popular" eyebrow + extrabold title + subtitle, a tabular mono
 * entry count on the right) sits above a collapsed-border guide ledger:
 * hairline-shared cells (no cover images), each a routable card with a mono
 * uppercase category label, a `#`-anchored bold guide title whose anchor
 * glyph warms to primary on hover, a one-line description, and a hairline
 * footer meta row pairing a mono read-time with an arrow that slides on
 * group-hover. Cells tint on hover instead of lifting. Every card routes
 * through section-kit route links keyed on the guide title so PageSwitch can
 * swap pages. Use as the "most-read guides" / "popular docs" band on docs
 * homes, API references, SDK guides, developer portals, or knowledge bases.
 * Renders fully with no props via baked-in defaults.
 */
export const DocsStoryGrid = defineCapsule({
  name: 'DocsStoryGrid',
  description:
    "Terminal-docs popular-guides ledger for a developer DOCUMENTATION site: an asymmetric header row (left SectionHeading with mono 'Popular' eyebrow + extrabold title + subtitle, tabular mono entry count right) above a collapsed-border hairline guide ledger. Each hairline-shared cell is a routable text-forward card (no cover images) with a mono uppercase category label, a '#'-anchored bold guide title whose anchor glyph warms to primary on hover, a one-line description, and a hairline footer meta row pairing a mono read-time with an arrow that slides on hover; cells tint on hover. Every card routes through section-kit route links keyed on its title so PageSwitch can swap pages. Use as the 'most-read guides' / 'popular docs' band on docs homes, API references, SDK guides, developer portals, or knowledge bases.",
  props: z.object({
    /** Eyebrow label above the title. */
    eyebrow: z.string().optional(),
    /** Main section title. */
    title: z.string().optional(),
    /** Supporting subtitle under the title. */
    subtitle: z.string().optional(),
    /** Heading alignment. */
    align: z.enum(['center', 'left']).optional(),
    /** Guide cards. Each routes through section-kit route links keyed on its title. */
    guides: z
      .array(
        z.object({
          category: z.string(),
          title: z.string(),
          description: z.string(),
          readTime: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Popular'
    const title = props.title ?? 'Popular guides'
    const subtitle = props.subtitle ?? 'The guides developers reach for most.'
    const align = props.align ?? 'left'
    const guides = props.guides?.length
      ? props.guides
      : [
          {
            category: 'Guides',
            title: 'Authentication',
            description:
              'Issue API keys, exchange tokens, and secure every request with OAuth 2.0.',
            readTime: '5 min read',
          },
          {
            category: 'API',
            title: 'Webhooks',
            description:
              'Subscribe to events and verify signed payloads delivered in real time.',
            readTime: '7 min read',
          },
          {
            category: 'Guides',
            title: 'Rate Limiting',
            description:
              'Understand request quotas, read rate-limit headers, and back off gracefully.',
            readTime: '4 min read',
          },
          {
            category: 'Tutorial',
            title: 'Pagination',
            description:
              'Page through large collections with cursor-based and offset strategies.',
            readTime: '6 min read',
          },
          {
            category: 'Guides',
            title: 'Error Handling',
            description:
              'Map status codes to error types and build resilient retry logic.',
            readTime: '5 min read',
          },
          {
            category: 'Tutorial',
            title: 'Deploying',
            description:
              'Ship to production with environment configs, secrets, and zero-downtime rollouts.',
            readTime: '8 min read',
          },
        ]

    return (
      <StoryGrid
        className={cn(
          'border-b border-border pt-24 pb-16 lg:pt-28 lg:pb-24',
          props.className,
        )}
      >
        <Container size="lg">
          <div
            className={cn(
              'flex flex-col gap-6',
              align === 'left' && 'md:flex-row md:items-end md:justify-between',
            )}
          >
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              subtitle={subtitle}
              align={align}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
            />
            <p
              aria-hidden="true"
              className={cn(
                'shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums',
                align === 'center' && 'text-center',
              )}
            >
              [ {String(guides.length).padStart(2, '0')} entries ]
            </p>
          </div>

          <ArticleGrid
            cols="1-2-3"
            className="mt-10 gap-0 border-l border-t border-border"
          >
            {guides.map((guide, i) => (
              <ArticleCard
                asChild
                key={`${guide.title}-${i}`}
                variant="none"
                className="rounded-none border-0 border-b border-r border-border bg-transparent text-left transition-colors hover:bg-muted/40"
              >
                <NavbarRouteLink href={guide.title}>
                  <ArticleContent className="p-6 sm:p-7">
                    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                      {guide.category}
                    </span>
                    <h3 className="mt-4 text-base font-bold tracking-tight text-foreground">
                      <span
                        aria-hidden="true"
                        className="mr-2 font-mono font-normal text-muted-foreground/50 transition-colors group-hover:text-primary"
                      >
                        #
                      </span>
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {guide.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        {guide.readTime}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4 text-muted-foreground transition-[transform,color] duration-150 group-hover:translate-x-1 group-hover:text-primary"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </div>
                  </ArticleContent>
                </NavbarRouteLink>
              </ArticleCard>
            ))}
          </ArticleGrid>
        </Container>
      </StoryGrid>
    )
  },
})
