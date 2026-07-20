import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * CommunityForumFeatures — playful-geometric staggered capabilities grid for a
 * community-platform / discussion-forum landing page. An asymmetric header row
 * (left-aligned mono "02 / features" rail + big tight-tracked heading and lead,
 * with a mono "[ 06 modules ]" meta tag on the right) above a 3-column grid of
 * sharp-cornered bordered cards where the middle column is pushed down for a
 * staggered rhythm and alternate cards tilt ±1deg. Each card carries a
 * rounded-full mono index chip ("01"–"06"), a title, and a description, and
 * lifts onto a hard offset shadow on hover. A giant ghost "06" watermark sits
 * behind the grid. No links — presentation only. Use as the feature section
 * for community platforms, forums, knowledge bases, or SaaS products
 * showcasing organized topics, search, permissions, real-time updates,
 * insights, and rich text editing.
 */
export const CommunityForumFeatures = defineCapsule({
  name: 'CommunityForumFeatures',
  description:
    'Playful-geometric staggered capabilities grid for a community-platform / discussion-forum landing page: an asymmetric header (mono metadata rail + left-aligned tight-tracked heading and lead, mono meta tag right) above a 3-column grid of sharp-cornered bordered cards with a staggered middle column and ±1deg tilts, each carrying a rounded-full mono index chip, a title, and a description, lifting onto a hard offset shadow on hover, over a giant ghost watermark numeral. No links — presentation only. Use as the feature section for community platforms, forums, knowledge bases, or SaaS products showcasing organized topics, search, permissions, real-time updates, insights, and rich text editing.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? 'Everything you need for thriving discussions'
    const description =
      props.description ??
      'Purpose-built features that make community management effortless and conversations delightful.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Organized Topics',
            description:
              'Create unlimited categories and subcategories. Keep discussions structured so members can find exactly what they need without endless scrolling.',
          },
          {
            title: 'Powerful Search',
            description:
              'Instant full-text search across all posts, comments, and member profiles. Find that specific conversation from months ago in seconds.',
          },
          {
            title: 'Granular Permissions',
            description:
              'Control who can view, post, moderate, and manage. Create private spaces for premium members or open discussions for everyone.',
          },
          {
            title: 'Real-time Updates',
            description:
              'See new posts and replies instantly without refreshing. Stay in the flow of conversation with live notifications and typing indicators.',
          },
          {
            title: 'Community Insights',
            description:
              'Track engagement metrics, popular topics, member growth, and activity patterns. Make data-driven decisions to nurture your community.',
          },
          {
            title: 'Rich Text Editor',
            description:
              'Compose beautiful posts with markdown support, code blocks, embeds, and file attachments. Express ideas clearly with formatting that just works.',
          },
        ]
    const tilts = [
      '-rotate-1',
      'rotate-0',
      'rotate-1',
      'rotate-1',
      'rotate-0',
      '-rotate-1',
    ]

    return (
      <section
        className={cn(
          'relative overflow-hidden py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-6 bottom-0 text-[9rem] sm:text-[14rem] lg:text-[20rem]">
          {String(items.length).padStart(2, '0')}
        </Watermark>
        <Container size="lg" className="relative">
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag>02 / Features</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-16 bg-border sm:w-24"
                />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-0"
                titleClassName="mb-4 text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="text-lg text-muted-foreground"
              />
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:mb-2"
            >
              [ {String(items.length).padStart(2, '0')} modules ]
            </MonoTag>
          </div>
          <FeatureGrid
            columns={3}
            className="gap-0 [&>div]:gap-4 sm:[&>div]:gap-5"
          >
            {items.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard
                  key={__iv__.title}
                  className={cn(
                    'rounded-none border-2 border-foreground/15 bg-card p-6 transition-all duration-150 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-[5px_5px_0_0] hover:shadow-primary/25 active:translate-y-0 sm:p-7',
                    tilts[i % tilts.length],
                    i % 3 === 1 && 'md:translate-y-6',
                  )}
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-full border-2 border-foreground/20 bg-background font-mono text-[11px] font-semibold tracking-[0.08em] text-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle className="text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
