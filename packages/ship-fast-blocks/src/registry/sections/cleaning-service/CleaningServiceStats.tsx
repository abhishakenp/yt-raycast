import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * CleaningServiceStats — a brand-color stats band for a home-cleaning / maid-service landing page. A full-width primary-background band with a 4-column grid of big metric values (in primary-foreground) and descriptive labels (in muted primary-foreground). No links, no images — pure social-proof numbers. Use as a credibility / trust strip between content sections for residential cleaning companies, maid services, housekeeping platforms, or any local home-service brand. Renders fully with no props via four baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
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
          <StatGrid columns={4} className="gap-12">
            {items.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem key={__iv__.label} align={'center'}>
                  <StatValue weight={'bold'} size={'large'} color={'inverted'}>
                    {__iv__.value}
                  </StatValue>
                  <StatLabel color={'inverted'}>{__iv__.label}</StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
