import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CafeProcess — dark "farm to cup" numbered process band for a cozy cafe /
 * coffee shop page. A full-bleed inverted section on bg-foreground with
 * text-background: centered cap, serif heading, and description above a 4-up
 * grid. Each step shows a large circular tile with an outlined number (01–04),
 * a serif title, and a small description. No links. Use as a credibility /
 * craft-process block for cafes, roasteries, bakeries, or artisan food brands.
 * Renders fully with no props via baked-in defaults.
 */
export const CafeProcess = defineCapsule({
  name: 'CafeProcess',
  description:
    "Dark 'farm to cup' numbered process band for a cozy cafe page: full-bleed inverted section on bg-foreground with centered cap, serif heading, and description above a 4-up grid. Each step shows a circular tile with an outlined number (01–04), serif title, and description. No links. Use as a credibility / craft-process block for cafes, roasteries, bakeries, or artisan food brands.",
  props: z.object({
    /** Eyebrow / cap text. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Process steps: title + description. */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const cap = props.cap ?? 'The Process'
    const heading = props.heading ?? 'From farm to cup'
    const description =
      props.description ??
      "Every step matters. We obsess over the details so you don't have to."
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Source',
            description:
              'Direct relationships with small-lot farmers in coffee belt regions',
          },
          {
            title: 'Roast',
            description:
              'Small-batch roasting on our Diedrich IR-12, profiles dialed to origin',
          },
          {
            title: 'Brew',
            description:
              'Precision extraction using refractometers and taste panels',
          },
          {
            title: 'Serve',
            description:
              'Hand-delivered with care, every drink crafted to order',
          },
        ]

    return (
      <section
        className={cn('bg-foreground py-20 text-background', props.className)}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
              {cap}
            </p>
            <h2 className="mb-6 font-serif text-3xl font-medium sm:text-4xl">
              {heading}
            </h2>
            <p className="text-background/60">{description}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="space-y-4 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-full border border-background/20 bg-background/10">
                  <span className="font-serif text-2xl text-primary">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-medium">{step.title}</h3>
                <p className="text-sm text-background/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
