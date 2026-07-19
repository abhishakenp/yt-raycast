import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * DentalStats — dark inverted stats band for a dental practice site. A full-width
 * section on the foreground color with inverted background text, showing a
 * responsive 2-to-4 column grid of centered metrics where each big value is
 * rendered in the primary color above a faded label. Use as a credibility strip
 * (years of excellence, patients served, average rating, satisfaction) between
 * content sections on a dentist, dental office, or clinic site.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const DentalStats = defineCapsule({
  name: 'DentalStats',
  description:
    'Dark inverted stats band for a dental practice site: a full-width section on the foreground color with inverted text, showing a responsive 2-to-4 column grid of centered metrics where each big value is rendered in the primary color above a faded label. Use as a credibility strip (years of excellence, patients served, average rating, satisfaction) between content sections on a dentist, dental office, or clinic site.',
  props: z.object({
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
    const statsItems = props.items?.length
      ? props.items
      : [
          {
            value: '15+',
            label: 'Years of Excellence',
          },
          {
            value: '10K+',
            label: 'Happy Patients',
          },
          {
            value: '4.9',
            label: 'Average Rating',
          },
          {
            value: '98%',
            label: 'Patient Satisfaction',
          },
        ]
    return (
      <section
        className={cn('bg-foreground py-20 text-background', props.className)}
      >
        <Container>
          <StatGrid columns={4} className="gap-12">
            {statsItems.map((s) => {
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
