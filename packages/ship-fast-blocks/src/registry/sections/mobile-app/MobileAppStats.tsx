import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * MobileAppStats — an inverted, full-bleed big-number stats band on the primary
 * brand background. A centered heading + description (slightly translucent) sits
 * above a responsive 2-/4-column row of large metric figures, each over a
 * translucent caption label. No links, no imagery. Use as a high-contrast
 * proof-point / traction band between content sections on a mobile-app, SaaS or
 * consumer-product landing page. Renders fully with no props via baked-in
 * defaults.
 */
export const MobileAppStats = defineComponent({
  name: 'MobileAppStats',
  description:
    'Inverted full-bleed big-number stats band on the primary brand background: a centered heading + translucent description over a responsive 2-/4-column row of large metric figures, each over a translucent caption label. Use as a high-contrast proof-point / traction band between content sections on a mobile-app, SaaS or consumer-product landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Numbers that speak'
    const description =
      props.description ??
      'Join thousands of people who are transforming their lives one habit at a time.'
    const items = props.items?.length
      ? props.items
      : [
          { value: '50,000+', label: 'Active users building habits' },
          { value: '2.8M', label: 'Habits completed monthly' },
          { value: '87%', label: 'Users report lasting change' },
          { value: '4.9', label: 'App Store rating (12K reviews)' },
        ]

    return (
      <section
        className={cn(
          'bg-primary py-20 text-primary-foreground lg:py-32',
          props.className,
        )}
        aria-labelledby="mobileapp-stats-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2
              id="mobileapp-stats-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-primary-foreground/70">{description}</p>
          </div>
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {items.map((s) => (
              <div key={s.label}>
                <div className="mb-2 text-4xl font-bold sm:text-5xl">
                  {s.value}
                </div>
                <p className="text-primary-foreground/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
