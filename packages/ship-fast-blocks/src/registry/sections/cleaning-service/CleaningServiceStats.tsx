import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * CleaningServiceStats — a brand-color stats band for a home-cleaning / maid-service landing page. A full-width primary-background band with a 4-column grid of big metric values (in primary-foreground) and descriptive labels (in muted primary-foreground). No links, no images — pure social-proof numbers. Use as a credibility / trust strip between content sections for residential cleaning companies, maid services, housekeeping platforms, or any local home-service brand. Renders fully with no props via four baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CleaningServiceStats = defineCapsule({
  name: 'CleaningServiceStats',
  description:
    'Brand-color stats band for a home-cleaning / maid-service landing page: full-width primary-background band with a 4-column grid of big metric values and descriptive labels. No links, no images — pure social-proof numbers. Use as a credibility / trust strip between content sections for residential cleaning, maid services, housekeeping, or local home-service brands.',
  props: z.object({
    /** Metric figures: value + label. */
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '10,000+',
            label: 'Homes Cleaned',
          },
          {
            value: '4.9',
            label: 'Average Rating',
          },
          {
            value: '150+',
            label: 'Vetted Cleaners',
          },
          {
            value: '98%',
            label: 'Satisfaction Rate',
          },
        ]
    return (
      <section className={cn('bg-primary py-16 lg:py-20', props.className)}>
        <Container>
          <ResponsiveGrid cols="2-lg-4" gap="lg" className="text-center">
            {items.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 text-4xl font-bold text-primary-foreground lg:text-5xl">
                  {stat.value}
                </div>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
