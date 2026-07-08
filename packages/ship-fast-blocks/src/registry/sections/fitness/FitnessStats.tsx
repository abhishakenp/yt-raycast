import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * FitnessStats — bold primary-filled stats band for a gym or fitness studio. A
 * full-width primary-colored strip with a centered 2/4-column row of big metric
 * numbers over small muted labels (members, weekly classes, trainers, square feet).
 * Renders fully on zero args. Use as a high-contrast proof band between sections on
 * gyms, fitness studios, yoga / pilates / boxing / spin studios or wellness clubs.
 */
export const FitnessStats = defineCapsule({
  name: 'FitnessStats',
  description:
    'Bold primary-filled stats band for a gym or fitness studio: a full-width primary-colored strip with a centered 2/4-column row of big metric numbers over small muted labels (active members, weekly classes, expert trainers, square feet). Use as a high-contrast social-proof / by-the-numbers band between sections on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios and wellness clubs.',
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
          { value: '3,200+', label: 'Active members' },
          { value: '45+', label: 'Weekly classes' },
          { value: '12', label: 'Expert trainers' },
          { value: '12k', label: 'Square feet' },
        ]

    return (
      <section className={cn('bg-primary py-16', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ResponsiveGrid cols="2-md-4" gap="lg" className="text-center">
            {statsItems.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 text-3xl font-semibold text-primary-foreground md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
