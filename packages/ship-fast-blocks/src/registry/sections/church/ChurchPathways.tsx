import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { PathwayGrid, PathwayCard } from '#/section-kit/PathwayGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ChurchPathways — a 3-up "next step" pathways grid for a church or faith-community
 * site. Heading + description on the left, then a responsive grid of photo-card
 * articles with image, title, description, and a text CTA with arrow. Each card
 * image lazily loads and subtly scales on hover. CTAs route through useNavigate.
 * Use for small-groups, kids/youth, serve-together, or any multi-pathway onboarding
 * flow for churches, ministries, or community organizations. Renders fully with no
 * props via baked-in defaults.
 */
export const ChurchPathways = defineCapsule({
  name: 'ChurchPathways',
  description:
    '3-up next-step pathways grid for a church or faith-community site: heading + description on the left, then a responsive grid of photo-card articles with image, title, description, and a text CTA with arrow. Each image lazily loads and subtly scales on hover. CTAs route through useNavigate. Use for small-groups, kids/youth, serve-together, or any multi-pathway onboarding flow for churches, ministries, or community organizations.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Paragraph under the heading. */
    description: z.string().optional(),
    /** Pathway cards; each has a title, description, CTA label, and image alt. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          cta: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everyone has a next step'
    const description =
      props.description ??
      "Whether you're taking your first steps in faith or have been walking with Jesus for decades, we have pathways designed to help you grow, connect, and serve."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Small Groups',
            description:
              'Meet weekly in homes across the Portland metro area. Share life, study scripture, and build lasting friendships with 8-12 people.',
            cta: 'Find a group',
            imageAlt:
              'Young adults laughing together during a small group Bible study in a cozy living room',
          },
          {
            title: 'Kids & Youth',
            description:
              'Nursery through high school programs every Sunday. Safe, fun environments where young people discover faith at their level.',
            cta: 'Learn more',
            imageAlt:
              'Children smiling and raising hands during a colorful Sunday school worship session',
          },
          {
            title: 'Serve Together',
            description:
              "Join one of 40+ volunteer teams. From greeting guests to global missions, there's a place for your gifts to make a difference.",
            cta: 'Explore teams',
            imageAlt:
              'Volunteers wearing matching t-shirts distributing food at a community outreach event',
          },
        ]

    return (
      <section className={cn('pt-28 pb-24 lg:pt-32 lg:pb-28', props.className)}>
        <Container size="xl" className="px-6">
          <SectionHeading
            title={heading}
            subtitle={description}
            align="left"
            titleClassName="text-3xl font-medium tracking-tight sm:text-4xl"
            subtitleClassName="text-lg leading-relaxed"
            className="mb-20 max-w-3xl gap-6"
          />
          <PathwayGrid cols="1-2-3">
            {items.map((item) => (
              <PathwayCard key={item.title}>
                <div className="flex flex-col gap-3 p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </PathwayCard>
            ))}
          </PathwayGrid>
        </Container>
      </section>
    )
  },
})
