import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * HealthcareStats — full-bleed accent statistics band for a medical-clinic
 * page. A solid primary-colored strip holding a responsive 2/4-column grid of
 * big metric figures, each with a large value and a lighter label below, all
 * centered. Tokens-only, no links. Use as a credibility / "by the numbers"
 * band between sections of a doctors' office, primary-care practice or hospital
 * to surface patient count, wait time, satisfaction and years of service.
 * Renders fully with no props via baked-in clinic-metric defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const HealthcareStats = defineCapsule({
  name: 'HealthcareStats',
  description:
    "Full-bleed accent statistics band for a medical-clinic page: a solid primary-colored strip holding a responsive 2/4-column grid of big metric figures, each with a large value and a lighter label below, all centered. Tokens-only, no links. Use as a credibility / 'by the numbers' band between sections of a doctors' office, primary-care practice or hospital to surface patient count, wait time, satisfaction and years of service.",
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
            value: '4,900+',
            label: 'Active Patients',
          },
          {
            value: '15 min',
            label: 'Avg. Wait Time',
          },
          {
            value: '98%',
            label: 'Patient Satisfaction',
          },
          {
            value: '9+',
            label: 'Years of Service',
          },
        ]
    return (
      <section
        className={cn('bg-primary py-16', props.className)}
        aria-label="Clinic statistics"
      >
        <Container>
          <ResponsiveGrid cols="2-lg-4" gap="lg" className="text-center">
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
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
