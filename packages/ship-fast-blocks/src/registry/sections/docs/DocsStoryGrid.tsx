import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StoryGrid } from '#/section-kit/StoryGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  ArticleGrid,
  ArticleCard,
  ArticleContent,
} from '#/section-kit/ArticleGrid.tsx'

/**
 * DocsStoryGrid — bespoke, token-styled "popular guides" cards grid for a
 * developer DOCUMENTATION site. Opens with a left-aligned SectionHeading
 * ("Popular" eyebrow + "Popular guides" title + subtitle), then lays out a
 * responsive grid of text-forward guide cards (no cover images). Each card is a
 * routable button: a small category pill, a bold guide title, a one-line
 * description, and a footer meta row with read-time plus an arrow that slides on
 * group-hover. Every card routes through useNavigate(go) so PageSwitch can swap
 * pages, keyed on the guide title. Use as the "most-read guides" / "popular
 * docs" band on docs homes, API references, SDK guides, developer portals, or
 * knowledge bases. Renders fully with no props via baked-in defaults.
 */
export const DocsStoryGrid = defineCapsule({
  name: 'DocsStoryGrid',
  description:
    "Bespoke, token-styled 'popular guides' cards grid for a developer DOCUMENTATION site. Opens with a SectionHeading ('Popular' eyebrow + 'Popular guides' title + subtitle), then a responsive grid of clean, text-forward guide cards (no cover images): each card is a routable button with a small category pill, a bold guide title, a one-line description, and a footer meta row showing read-time plus an arrow that slides on hover. Every card routes through useNavigate keyed on its title so PageSwitch can swap pages. Use as the 'most-read guides' / 'popular docs' band on docs homes, API references, SDK guides, developer portals, or knowledge bases.",
  props: z.object({
    /** Eyebrow label above the title. */
    eyebrow: z.string().optional(),
    /** Main section title. */
    title: z.string().optional(),
    /** Supporting subtitle under the title. */
    subtitle: z.string().optional(),
    /** Heading alignment. */
    align: z.enum(['center', 'left']).optional(),
    /** Guide cards. Each routes through useNavigate keyed on its title. */
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
    const go = useNavigate()
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
      <StoryGrid className={cn('pt-28 pb-16', props.className)}>
        <Container size="lg">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            align={align}
          />
          <ArticleGrid cols="1-2-3" className="mt-12 gap-6">
            {guides.map((guide, i) => (
              <ArticleCard
                asChild
                key={`${guide.title}-${i}`}
                variant="default"
                className="text-left transition hover:shadow-md"
              >
                <button type="button" onClick={() => go(guide.title)}>
                  <ArticleContent className="p-6">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {guide.category}
                    </span>
                    <h3 className="mt-3 font-semibold text-foreground">
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {guide.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-xs text-muted-foreground">
                        {guide.readTime}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-4 text-primary transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </div>
                  </ArticleContent>
                </button>
              </ArticleCard>
            ))}
          </ArticleGrid>
        </Container>
      </StoryGrid>
    )
  },
})
