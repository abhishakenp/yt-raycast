import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * HealthcareStats — full-bleed accent statistics band for a medical-clinic
 * page. A solid primary-colored strip holding a responsive 2/4-column grid of
 * big metric figures, each with a large value and a lighter label below, all
 * centered. Tokens-only, no links. Use as a credibility / "by the numbers"
 * band between sections of a doctors' office, primary-care practice or hospital
 * to surface patient count, wait time, satisfaction and years of service.
 * Renders fully with no props via baked-in clinic-metric defaults.
 */
export const HealthcareStats = defineComponent({
  name: 'HealthcareStats',
  description:
    "Full-bleed accent statistics band for a medical-clinic page: a solid primary-colored strip holding a responsive 2/4-column grid of big metric figures, each with a large value and a lighter label below, all centered. Tokens-only, no links. Use as a credibility / 'by the numbers' band between sections of a doctors' office, primary-care practice or hospital to surface patient count, wait time, satisfaction and years of service.",
  props: z.object({
    /** Metric figures: value + label. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '4,900+', label: 'Active Patients' },
          { value: '15 min', label: 'Avg. Wait Time' },
          { value: '98%', label: 'Patient Satisfaction' },
          { value: '9+', label: 'Years of Service' },
        ]

    return (
      <section
        className={cn('bg-primary py-16', props.className)}
        aria-label="Clinic statistics"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {items.map((s) => (
              <div key={s.label}>
                <p className="mb-2 text-4xl font-bold text-primary-foreground sm:text-5xl">
                  {s.value}
                </p>
                <p className="font-medium text-primary-foreground/80">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
