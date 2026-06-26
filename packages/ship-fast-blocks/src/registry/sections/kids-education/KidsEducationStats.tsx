import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * KidsEducationStats — dark stats band for a kids / family learning platform. A
 * full-width dark (foreground) band holding a 2-up / 4-up grid of big metric
 * figures whose values rotate through primary / secondary / accent accent colors,
 * each with a muted sub-label below. Use as a social-proof / impact strip between
 * content sections for kids-education startups, children's e-learning platforms,
 * and family learning apps. Renders fully with no props via baked-in defaults.
 */
export const KidsEducationStats = defineComponent({
  name: 'KidsEducationStats',
  description:
    "Dark stats band for a kids / family learning platform: a full-width dark (foreground) band holding a 2-up / 4-up grid of big metric figures whose values rotate through primary / secondary / accent accent colors, each with a muted sub-label below. Use as a social-proof / impact strip between content sections for kids-education startups, children's e-learning platforms, and family learning apps.",
  props: z.object({
    /** Stat figures. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '50K+', label: 'Happy Learners' },
          { value: '1,200+', label: 'Activities & Games' },
          { value: '98%', label: 'Parent Satisfaction' },
          { value: '35+', label: 'Countries Reached' },
        ]

    return (
      <section
        className={cn('bg-foreground py-20 text-background', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {items.map((s, i) => (
              <div key={s.label}>
                <p
                  className={cn(
                    'mb-2 text-4xl font-bold sm:text-5xl',
                    i % 3 === 0 && 'text-primary',
                    i % 3 === 1 && 'text-secondary',
                    i % 3 === 2 && 'text-accent',
                  )}
                >
                  {s.value}
                </p>
                <p className="text-background/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
