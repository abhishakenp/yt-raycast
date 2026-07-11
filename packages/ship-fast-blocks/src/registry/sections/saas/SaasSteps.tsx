import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'

/**
 * SaasSteps — a "How it works" band for a B2B SaaS landing page. A centered
 * heading + optional intro above a responsive row of 3-4 numbered steps, each
 * with a large gradient/primary numbered badge, a title, and a short
 * description, joined by a faint accent connector line. Use to explain a
 * product onboarding or workflow in a few confident, conversion-focused steps.
 * Renders fully with no props via baked-in defaults.
 */
export const SaasSteps = defineCapsule({
  name: 'SaasSteps',
  description:
    "A 'How it works' band for a B2B SaaS landing page: a centered heading + optional intro above a responsive row of 3-4 numbered steps, each with a large gradient/primary numbered badge, a title, and a short description, joined by a faint accent connector line. Use to explain a product onboarding or workflow in a few confident, conversion-focused steps.",
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
    const heading = props.heading ?? 'How it works'
    const subheading =
      props.subheading ??
      'Go from sign-up to fully automated in minutes — no engineers, no migrations, no friction.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Connect',
            description:
              'Link your existing tools in a single click. We sync your data securely without touching production.',
          },
          {
            title: 'Configure',
            description:
              'Pick a template or define your own rules with a visual builder. No code required to get started.',
          },
          {
            title: 'Automate',
            description:
              'Turn it on and let the engine run. Workflows trigger in real time, around the clock.',
          },
          {
            title: 'Scale',
            description:
              'Add teammates, environments, and integrations as you grow. Performance stays instant at any volume.',
          },
        ]

    return (
      <section
        className={cn('bg-background py-20 lg:py-28', props.className)}
        aria-labelledby="saas-steps-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="saas-steps-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{subheading}</p>
          </div>
          <ol
            className={cn(
              'relative grid gap-10 md:gap-8',
              steps.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3',
            )}
          >
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
