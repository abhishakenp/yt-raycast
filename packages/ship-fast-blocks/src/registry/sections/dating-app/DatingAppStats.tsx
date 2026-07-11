import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

import { Container } from '#/section-kit/Container.tsx'

/**
 * DatingAppStats — a bold full-width stats band for a dating / matchmaking app. A
 * solid rose/primary band with a responsive 2/4-column grid of centered metrics,
 * each a large bold value over a softer label in the primary-foreground color. Use
 * as a high-impact social-proof divider between content sections — active singles,
 * matches this month, relationships started, app rating — for dating apps, singles
 * platforms, or any product with punchy headline numbers. Renders fully with no
 * props via baked-in metric defaults.
 */
export const DatingAppStats = defineCapsule({
  name: 'DatingAppStats',
  description:
    'Bold full-width stats band for a dating / matchmaking app: a solid rose/primary band with a responsive 2/4-column grid of centered metrics, each a large bold value over a softer label in the primary-foreground color. Use as a high-impact social-proof divider between content sections — active singles, matches this month, relationships started, app rating — for dating apps, singles platforms, or any product with punchy headline numbers.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statsItems = props.items?.length
      ? props.items
      : [
          { value: '2M+', label: 'Active singles' },
          { value: '847K', label: 'Matches this month' },
          { value: '12K+', label: 'Relationships started' },
          { value: '4.8★', label: 'App Store rating' },
        ]

    return (
      <section className={cn('bg-primary py-20', props.className)}>
        <Container>
          <ResponsiveGrid cols="2-lg-4" gap="lg" className="text-center">
            {statsItems.map((s) => (
              <div key={s.label}>
                <p className="mb-2 text-4xl font-bold text-primary-foreground sm:text-5xl">
                  {s.value}
                </p>
                <p className="text-primary-foreground/80">{s.label}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
