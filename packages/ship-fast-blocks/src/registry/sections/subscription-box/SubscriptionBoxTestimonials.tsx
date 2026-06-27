import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * SubscriptionBoxTestimonials — social-proof band for a subscription-box brand
 * built on the shared TestimonialGrid composite. A padded section wraps a
 * 3-column grid of happy-customer quotes, each with a name, a role/location, and
 * a star rating. Theme-token only and renders complete with no props. Use to
 * showcase delight and trust on any curated-box or membership page.
 */
export const SubscriptionBoxTestimonials = defineCapsule({
  name: 'SubscriptionBoxTestimonials',
  description:
    'Social-proof band for a subscription-box brand built on the shared TestimonialGrid composite: a padded section wrapping a 3-column grid of happy-customer quotes with name, role/location, and star rating. Use to showcase delight and trust on any curated-box or membership page.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
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
    const heading = props.heading ?? 'Unboxing smiles everywhere'
    const subheading =
      props.subheading ??
      'Thousands of members look forward to box day every single month.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Box day is genuinely my favorite day of the month. Every item feels picked just for me.',
            name: 'Maya Chen',
            role: 'Member since 2023',
            company: 'Austin, TX',
            rating: 5,
            avatarAlt: 'smiling subscription box member portrait',
          },
          {
            quote:
              'The customization is spot on and shipping is always free. I cancelled three other boxes for this one.',
            name: 'Devon Park',
            role: 'Classic plan',
            company: 'Portland, OR',
            rating: 5,
            avatarAlt: 'happy customer holding subscription box',
          },
          {
            quote:
              'I gifted Deluxe to my sister and now we both race to unbox first. Pure delight every time.',
            name: 'Priya Nair',
            role: 'Deluxe plan',
            company: 'Brooklyn, NY',
            rating: 5,
            avatarAlt: 'delighted member unboxing surprise gift',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6">
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
