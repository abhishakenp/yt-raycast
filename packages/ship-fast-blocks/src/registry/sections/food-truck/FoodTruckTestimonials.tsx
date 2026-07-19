import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FoodTruckTestimonials — a customer-reviews section with a press-logo strip. A
 * centered eyebrow + heading sits above a 3-up grid of muted quote cards, each with a
 * five-star row, an italicized quote and an avatar + name + role byline, followed by a
 * centered row of clickable press / publication logos. Avatars use the alt-driven
 * Image component; logos route through section-kit route links. Use as the social-proof section for
 * food trucks, restaurants, caterers or street-food vendors showing reviews and press.
 */
export const FoodTruckTestimonials = defineCapsule({
  name: 'FoodTruckTestimonials',
  description:
    'Customer-reviews section with a press-logo strip: a centered eyebrow + heading above a 3-up grid of muted quote cards, each with a five-star row, a quote and an avatar + name + role byline, followed by a centered row of clickable press / publication logos. Avatars use the alt-driven Image component; logos route through section-kit route links. Use as the social-proof / testimonials section for food trucks, restaurants, caterers or street-food vendors showing reviews and press mentions.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    pressLogos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testEyebrow = props.eyebrow ?? 'Reviews'
    const testHeading = props.heading ?? 'What People Say'
    const testItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Had them cater our company lunch for 80 people. The Korean short rib tacos were the hit of the day. Everyone asked where we found them. Will definitely book again!',
            name: 'Sarah Chen',
            role: 'VP Marketing, TechFlow Inc.',
            avatarAlt:
              'Professional headshot of Sarah Chen, a marketing executive',
          },
          {
            quote:
              "Best food truck in LA hands down. I've been tracking them for months. The cauliflower tacos are so good I dream about them. Worth driving across town for.",
            name: 'Marcus Johnson',
            role: 'Food Blogger @LAEats',
            avatarAlt:
              'Professional headshot of Marcus Johnson, a food blogger',
          },
          {
            quote:
              'Hired them for my wedding reception. They were professional, punctual, and the food was absolutely incredible. Our guests are still talking about it three months later!',
            name: 'Emily Rodriguez',
            role: 'Wedding Client',
            avatarAlt: 'Professional headshot of Emily Rodriguez, a bride',
          },
        ]
    const pressLogos = props.pressLogos?.length
      ? props.pressLogos
      : ['Eater LA', 'LA Times Food', 'The Infatuation']

    const gridItems = testItems.map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      avatarAlt: t.avatarAlt,
      rating: 5,
    }))

    return (
      <section className={cn('px-6 pt-28 pb-20', props.className)}>
        <Container size="lg">
          <TestimonialGrid eyebrow={testEyebrow} heading={testHeading}>
            {gridItems.map((t) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={'bg-muted border-0 p-6'}
                >
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta>
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {pressLogos.map((logo) => (
              <NavbarRouteLink
                key={logo}
                className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/60 transition-colors hover:text-foreground"
                href={logo}
              >
                {logo}
              </NavbarRouteLink>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
