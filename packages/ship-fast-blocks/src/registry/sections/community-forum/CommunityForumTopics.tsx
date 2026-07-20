import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { TopicGrid, TopicCard, TopicIcon } from '#/section-kit/TopicGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CommunityForumTopics — playful-geometric staggered topic directory for a
 * community-platform landing page. A muted band with an asymmetric header
 * (mono "03 / topics" rail + left-aligned tight-tracked heading and lead, mono
 * "[ browse all ]" meta right) above a 2-to-4-column grid of sharp-cornered
 * bordered topic cards where every other card is nudged down for a checkered
 * stagger. Each card pairs a tinted rounded-full emoji sticker ring with a
 * bold title and a rounded-full mono discussion-count chip, tilts a hair on
 * hover onto a hard offset shadow, and presses down on click. A giant ghost
 * "#" watermark anchors the band. Cards route through section-kit route links
 * on click. Use as the topic-browse / category-directory section for
 * community platforms, forums, or discussion-board products.
 */
export const CommunityForumTopics = defineCapsule({
  name: 'CommunityForumTopics',
  description:
    'Playful-geometric staggered topic directory for a community-platform landing page: a muted band with an asymmetric header (mono metadata rail + left-aligned tight-tracked heading, mono meta tag right) above a 2-to-4-column grid of sharp-cornered bordered topic cards with a checkered stagger, each pairing a tinted rounded-full emoji sticker ring with a bold title and a rounded-full mono discussion-count chip, lifting onto a hard offset shadow on hover with press feedback, over a giant ghost "#" watermark. Cards route through section-kit route links on click. Use as the topic-browse / category-directory section for community platforms, forums, or discussion-board products.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Topic tiles: emoji icon + title + discussion count. */
    items: z
      .array(
        z.object({
          emoji: z.string(),
          title: z.string(),
          count: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Explore active communities'
    const description =
      props.description ??
      'Join thousands of ongoing conversations across diverse topics and interests.'
    const items = props.items?.length
      ? props.items
      : [
          {
            emoji: '💻',
            title: 'Software Engineering',
            count: '2,847 active discussions',
          },
          {
            emoji: '🎨',
            title: 'Design & UX',
            count: '1,523 active discussions',
          },
          {
            emoji: '📊',
            title: 'Data Science',
            count: '956 active discussions',
          },
          { emoji: '🚀', title: 'Startups', count: '1,104 active discussions' },
          {
            emoji: '📷',
            title: 'Photography',
            count: '742 active discussions',
          },
          {
            emoji: '🌱',
            title: 'Sustainability',
            count: '628 active discussions',
          },
          {
            emoji: '💼',
            title: 'Remote Work',
            count: '1,891 active discussions',
          },
          {
            emoji: '🎵',
            title: 'Music Production',
            count: '534 active discussions',
          },
        ]

    const topicTints = [
      'bg-primary/10 text-primary',
      'bg-secondary text-secondary-foreground',
      'bg-accent text-accent-foreground',
      'bg-chart-1/15 text-chart-1',
      'bg-chart-2/15 text-chart-2',
      'bg-chart-3/15 text-chart-3',
      'bg-chart-4/15 text-chart-4',
      'bg-chart-5/15 text-chart-5',
    ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-8 -top-6 text-[10rem] sm:text-[15rem] lg:text-[22rem]">
          #
        </Watermark>
        <Container size="lg" className="relative">
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag>03 / Topics</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-16 bg-border sm:w-24"
                />
              </div>
              <SectionHeading
                title={heading}
                subtitle={description}
                align="left"
                titleClassName="text-3xl font-extrabold tracking-tighter sm:text-4xl lg:text-5xl"
                subtitleClassName="text-lg"
                className="gap-4"
              />
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:mb-2"
            >
              [ browse all ]
            </MonoTag>
          </div>
          <TopicGrid cols="2-3-4" className="gap-3 sm:gap-4">
            {items.map((topic, i) => (
              <TopicCard
                asChild
                key={topic.title}
                className={cn(
                  'rounded-none border-2 border-foreground/15 bg-card p-4 text-left text-card-foreground transition-all duration-150 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-[5px_5px_0_0] hover:shadow-primary/25 active:translate-y-0 active:shadow-none sm:p-6',
                  i % 2 === 1 && 'sm:translate-y-4',
                )}
              >
                <NavbarRouteLink href={topic.title}>
                  <TopicIcon
                    className={cn(
                      'flex size-11 items-center justify-center rounded-full border-2 border-foreground/10 text-xl',
                      topicTints[i % topicTints.length],
                    )}
                  >
                    <span aria-hidden="true">{topic.emoji}</span>
                  </TopicIcon>
                  <h4 className="mb-2 mt-3 font-bold tracking-tight text-card-foreground">
                    {topic.title}
                  </h4>
                  <span className="inline-flex w-fit rounded-full border border-foreground/15 bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {topic.count}
                  </span>
                </NavbarRouteLink>
              </TopicCard>
            ))}
          </TopicGrid>
        </Container>
      </section>
    )
  },
})
