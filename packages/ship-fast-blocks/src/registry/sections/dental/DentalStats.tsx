import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * DentalStats — dark inverted stats band for a dental practice site. A full-width
 * section on the foreground color with inverted background text, showing a
 * responsive 2-to-4 column grid of centered metrics where each big value is
 * rendered in the primary color above a faded label. Use as a credibility strip
 * (years of excellence, patients served, average rating, satisfaction) between
 * content sections on a dentist, dental office, or clinic site.
 */
import { Container } from '#/section-kit/Container.tsx'
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
          <ResponsiveGrid cols="2-lg-4" gap="lg" className="text-center">
            {statsItems.map((s) => (
              <div key={s.label}>
                <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                  {s.value}
                </div>
                <div className="text-background/70">{s.label}</div>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
