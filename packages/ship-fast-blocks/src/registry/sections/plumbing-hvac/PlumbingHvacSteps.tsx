import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'

/**
 * PlumbingHvacSteps — a "How it works" band for a plumbing & HVAC trade site. A
 * centered heading + optional intro above a responsive row of 3 numbered steps,
 * each with a large gradient/primary numbered badge, a title, and a short
 * description, joined by a faint accent connector line. Defaults walk a customer
 * through the booking experience — Call us, We diagnose, We fix it. Use to set
 * expectations and reduce friction for homeowners calling a plumber or HVAC
 * contractor. Renders fully with no props via baked-in defaults.
 */
export const PlumbingHvacSteps = defineCapsule({
  name: 'PlumbingHvacSteps',
  description:
    "A 'How it works' band for a plumbing & HVAC trade site: a centered heading + optional intro above a responsive row of 3 numbered steps, each with a large gradient/primary numbered badge, a title, and a short description, joined by a faint accent connector line. Defaults walk a customer through the booking experience — Call us, We diagnose, We fix it. Use to set expectations and reduce friction for homeowners calling a plumber or HVAC contractor.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Optional supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Ordered steps; each renders a numbered badge, title, and description. */
    steps: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Getting help is simple'
    const subheading =
      props.subheading ??
      'No runaround, no hidden fees. Three easy steps from your first call to a fully working home.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Call us',
            description:
              "Reach a real person 24/7. Tell us what's wrong and we'll book a same-day or next-day visit that fits your schedule.",
          },
          {
            title: 'We diagnose',
            description:
              'A licensed technician arrives on time, inspects the issue, and gives you a clear, upfront quote before any work begins.',
          },
          {
            title: 'We fix it',
            description:
              'We complete the repair or installation right the first time, clean up after ourselves, and back it with our guarantee.',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="plumbing-hvac-steps-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="plumbing-hvac-steps-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{subheading}</p>
          </div>
          <ol className="relative grid gap-10 md:gap-8 md:grid-cols-3">
            {/* Connecting accent line behind the badges on desktop */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-accent to-transparent md:block"
            />
            {steps.map((step, i) => (
              <li
                key={i}
                className="relative flex flex-col items-center text-center md:items-start md:text-left"
              >
                <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-extrabold text-primary-foreground shadow-lg ring-4 ring-background">
                  {i + 1}
                </span>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    )
  },
})
