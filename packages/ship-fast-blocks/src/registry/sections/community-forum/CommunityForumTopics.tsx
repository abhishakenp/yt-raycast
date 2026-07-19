import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { TopicGrid, TopicCard, TopicIcon } from '#/section-kit/TopicGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CommunityForumTopics — colorful topic / category directory grid for a
 * community-platform landing page. A centered heading + description above a
 * responsive 4-column grid of rounded card tiles; each tile has a tinted emoji
 * circle, a title, and an active-discussion count. Cards route through
 * section-kit route links on click. Use as the topic-browse / category-directory section for
 * community platforms, forums, or discussion-board products.
 */
export const CommunityForumTopics = defineCapsule({
  name: 'CommunityForumTopics',
  description:
    'Colorful topic / category directory grid for a community-platform landing page: a centered heading and description above a responsive 4-column grid of rounded card tiles, each with a tinted emoji circle, a title, and an active-discussion count; cards route through section-kit route links on click. Use as the topic-browse / category-directory section for community platforms, forums, or discussion-board products.',
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
      <section className={cn('bg-muted py-24 lg:py-28', props.className)}>
        <Container size="lg">
          <SectionHeading
            title={heading}
            subtitle={description}
            align="center"
            titleClassName="text-3xl font-bold sm:text-4xl"
            subtitleClassName="text-lg"
            className="mx-auto mb-16 max-w-2xl gap-6"
          />
          <TopicGrid cols="1-2-4" className="gap-4">
            {items.map((topic, i) => (
              <TopicCard
                asChild
                key={topic.title}
                className="p-6 text-left text-card-foreground transition-all hover:border-foreground/20 hover:shadow-sm"
              >
                <NavbarRouteLink href={topic.title}>
                  <TopicIcon
                    className={cn(
                      'flex size-10 items-center justify-center text-xl',
                      topicTints[i % topicTints.length],
                    )}
                  >
                    <span aria-hidden="true">{topic.emoji}</span>
                  </TopicIcon>
                  <h4 className="mb-1 font-semibold text-card-foreground">
                    {topic.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{topic.count}</p>
                </NavbarRouteLink>
              </TopicCard>
            ))}
          </TopicGrid>
        </Container>
      </section>
    )
  },
})
