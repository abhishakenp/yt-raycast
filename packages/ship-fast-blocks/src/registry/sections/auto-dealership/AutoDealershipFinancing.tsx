import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * AutoDealershipFinancing — financing / pre-approval section for an auto
 * dealership page. Two-column layout: a large rounded finance photo on one side
 * and, on the other, a heading + lead, a vertical list of numbered step cards
 * (Apply Online, Compare Offers, Drive Away), a 3-up APR stats panel (starting
 * APR / max months / down options), and a solid primary CTA. The CTA routes
 * through useNavigate and the photo uses the alt-driven Image component. Use as
 * the financing / get-pre-approved section for car dealerships, used-car lots,
 * or auto sales groups. Renders fully with no props via baked-in defaults.
 */
export const AutoDealershipFinancing = defineComponent({
  name: 'AutoDealershipFinancing',
  description:
    'Financing / pre-approval section for an auto dealership page: a two-column layout with a large rounded finance photo on one side and, on the other, a heading and lead, a vertical list of numbered step cards (Apply Online, Compare Offers, Drive Away), a 3-up APR stats panel (starting APR / max months / down options), and a solid primary CTA. The CTA routes through useNavigate and the photo uses the alt-driven Image component. Use as the financing / get-pre-approved section for car dealerships, used-car lots, or auto sales groups.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Alt text driving the finance photo. */
    imageAlt: z.string().optional(),
    /** Solid primary CTA label. */
    cta: z.string().optional(),
    /** Numbered financing steps. */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** APR stats panel items. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Flexible Financing Options'
    const description =
      props.description ??
      'Get pre-approved in minutes with competitive rates from our network of 20+ lenders. We work with all credit situations to find the right payment plan for you.'
    const imageAlt =
      props.imageAlt ??
      'Professional business handshake over desk with documents and calculator'
    const cta = props.cta ?? 'Get Pre-Approved Now'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Apply Online',
            description:
              'Complete our secure 3-minute application. No impact to your credit score.',
          },
          {
            title: 'Compare Offers',
            description:
              'Review personalized rates from multiple lenders side by side.',
          },
          {
            title: 'Drive Away',
            description: 'Sign electronically and take delivery the same day.',
          },
        ]
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '3.9%', label: 'Starting APR' },
          { value: '84', label: 'Max Months' },
          { value: '$0', label: 'Down Options' },
        ]

    return (
      <section className={cn('bg-card py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-cover shadow-lg"
              />
            </div>
            <div className="order-1 space-y-8 lg:order-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {heading}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div
                    key={step.title}
                    className="flex items-start gap-4 rounded-lg border border-border bg-muted p-4"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-muted p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-3xl font-semibold">{s.value}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => go(cta)}
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {cta}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
