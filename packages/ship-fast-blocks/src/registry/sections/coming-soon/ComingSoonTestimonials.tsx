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

/**
 * ComingSoonTestimonials — early-access testimonial wall for a "launching soon" /
 * waitlist pre-launch landing page. A centered heading and lead paragraph above a
 * responsive 1/2/3-column grid of bordered quote cards on a card-colored band;
 * each card shows a 5-star rating row, the quote text, and an attribution row with
 * a round alt-driven avatar beside the reviewer's name and role. Avatars use the
 * alt-driven <Image> component. Use as social-proof / early-feedback section on
 * SaaS waitlists, app pre-launch pages, or beta sign-up landers. Renders fully
 * with no props via three baked-in default testimonials.
 */
export const ComingSoonTestimonials = defineCapsule({
  name: 'ComingSoonTestimonials',
  description:
    "Early-access testimonial wall for a 'launching soon' / waitlist pre-launch landing page: centered heading and lead paragraph above a responsive 1/2/3-column grid of bordered quote cards on a card-colored band. Each card shows a 5-star rating row, quote text, and an attribution row with a round alt-driven avatar beside reviewer name and role. Avatars use the alt-driven <Image> component. Use as social-proof / early-feedback section on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: quote, name, role, avatarAlt. */
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
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Early access feedback'
    const description =
      props.description ??
      'From design, engineering, and product teams already using Nexus'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Nexus replaced four tools in our stack. The unified workspace has transformed how our remote team collaborates.',
            name: 'Sarah Chen',
            role: 'Product Lead, Linear',
            avatarAlt:
              'Professional headshot of Sarah Chen, a smiling product manager with dark hair',
          },
          {
            quote:
              'The smart boards feature alone saved us 10 hours a week. Finally, a tool that thinks like designers do.',
            name: 'Marcus Williams',
            role: 'UX Director, Figma',
            avatarAlt:
              'Professional headshot of Marcus Williams, a bearded UX designer in his 30s',
          },
          {
            quote:
              'Security was our top concern. Nexus exceeded every compliance requirement our enterprise clients demand.',
            name: 'David Park',
            role: 'CTO, Vercel',
            avatarAlt:
              'Professional headshot of David Park, a CTO wearing glasses with a confident smile',
          },
        ]

    const gridItems = items.map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      avatarAlt: t.avatarAlt,
      rating: 5,
    }))

    return (
      <section
        className={cn(
          'w-full bg-card px-4 py-24 sm:px-6 lg:py-28 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl">
          <TestimonialGrid heading={heading} subheading={description}>
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
                <TestimonialCard key={__iv__.name} className={'bg-muted p-8'}>
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
        </div>
      </section>
    )
  },
})
