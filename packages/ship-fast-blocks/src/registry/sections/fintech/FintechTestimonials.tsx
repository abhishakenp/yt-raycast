import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * FintechTestimonials — social-proof section for a fintech / neobank landing
 * page. A padded section wrapping the shared TestimonialGrid composite with a
 * heading and three customer quotes, each carrying a star rating, name, and
 * role/company. The grid is layout-only, so this capsule supplies the section
 * wrapper and container padding. Renders fully with no props via baked-in
 * "Vault" defaults.
 */
export const FintechTestimonials = defineComponent({
  name: 'FintechTestimonials',
  description:
    'Social-proof section for a fintech / neobank landing page: a padded section wrapping the shared TestimonialGrid composite with a heading and three customer quotes, each with a star rating, name, and role/company. The capsule supplies the section wrapper and container padding around the layout-only grid.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Testimonial cards: quote, name, role, company, rating. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          rating: z.number().optional(),
          avatarAlt: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Loved by millions of customers'
    const subheading =
      props.subheading ??
      'See why people are switching to Vault for everyday banking.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Switching to Vault was the best financial decision I've made. Transfers are instant, the app is gorgeous, and I'm finally earning real interest on my savings.",
            name: 'Maya Thompson',
            role: 'Freelance Designer',
            company: 'Self-employed',
            rating: 5,
            avatarAlt: 'smiling young woman portrait',
          },
          {
            quote:
              'Running my business banking through Vault has saved me hours every week. Invoicing, expense tracking, and team cards all live in one place.',
            name: 'Daniel Okafor',
            role: 'Founder',
            company: 'Northbridge Studio',
            rating: 5,
            avatarAlt: 'professional man portrait',
          },
          {
            quote:
              'I travel constantly and the fee-free global withdrawals have paid for themselves many times over. Support is genuinely responsive too.',
            name: 'Elena Vasquez',
            role: 'Travel Writer',
            company: 'Wanderlines',
            rating: 5,
            avatarAlt: 'woman traveler portrait',
          },
        ]

    return (
      <section className={cn('bg-muted/30 py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <TestimonialGrid
            heading={heading}
            subheading={subheading}
            items={items}
            columns={3}
          />
        </div>
      </section>
    )
  },
})
