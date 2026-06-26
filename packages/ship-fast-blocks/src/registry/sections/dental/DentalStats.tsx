import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * DentalStats — dark inverted stats band for a dental practice site. A full-width
 * section on the foreground color with inverted background text, showing a
 * responsive 2-to-4 column grid of centered metrics where each big value is
 * rendered in the primary color above a faded label. Use as a credibility strip
 * (years of excellence, patients served, average rating, satisfaction) between
 * content sections on a dentist, dental office, or clinic site.
 */
export const DentalStats = defineComponent({
  name: 'DentalStats',
  description:
    'Dark inverted stats band for a dental practice site: a full-width section on the foreground color with inverted text, showing a responsive 2-to-4 column grid of centered metrics where each big value is rendered in the primary color above a faded label. Use as a credibility strip (years of excellence, patients served, average rating, satisfaction) between content sections on a dentist, dental office, or clinic site.',
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
          { value: '15+', label: 'Years of Excellence' },
          { value: '10K+', label: 'Happy Patients' },
          { value: '4.9', label: 'Average Rating' },
          { value: '98%', label: 'Patient Satisfaction' },
        ]

    return (
      <section
        className={cn('bg-foreground py-20 text-background', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {statsItems.map((s) => (
              <div key={s.label}>
                <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                  {s.value}
                </div>
                <div className="text-background/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
