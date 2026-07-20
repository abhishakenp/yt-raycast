import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepItem,
  StepContent,
} from '#/section-kit/StepTimeline.tsx'

/**
 * SaasSteps — kinetic-SaaS "How it works" band for a B2B SaaS landing page. An
 * asymmetric header (marker-highlighted heading left, mono "[ SETUP ]" meta
 * right) above a responsive row of 3-4 sharp step cards with hard offset shadows
 * that stagger down the page on desktop: each card carries a giant ghost step
 * numeral bleeding behind it, a mono "STEP 01" tag with a primary tick, a bold
 * title and a short description; a mono pipeline arrow strip runs beneath. Use
 * to explain a product onboarding or workflow in a few confident,
 * conversion-focused steps. Renders fully with no props via baked-in defaults.
 */
export const SaasSteps = defineCapsule({
  name: 'SaasSteps',
  description:
    "Kinetic-SaaS 'How it works' band for a B2B SaaS landing page: an asymmetric marker-highlighted header with mono meta above a responsive row of 3-4 sharp step cards with hard offset shadows that stagger down the page, each with a giant ghost step numeral, a mono STEP tag with a primary tick, a bold title and a short description, plus a mono pipeline arrow strip beneath. Use to explain a product onboarding or workflow in a few confident, conversion-focused steps.",
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

    const stagger = [
      'md:translate-y-0',
      'md:translate-y-6',
      'md:translate-y-12',
      'md:translate-y-[4.5rem]',
    ]
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24 lg:pb-36',
          props.className,
        )}
        aria-labelledby="saas-steps-heading"
      >
        <Container>
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Setup
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · minutes
                </span>
              </MonoTag>
              <h2
                id="saas-steps-heading"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">{subheading}</p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ setup ] no migrations
            </p>
          </div>
          <ol
            className={cn(
              'grid gap-8 lg:gap-10',
              steps.length >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3',
            )}
          >
            {steps.map((step, i) => (
              <StepItem
                key={i}
                className={cn(
                  'relative list-none',
                  stagger[i % stagger.length],
                )}
              >
                {/* Giant ghost numeral bleeding behind the card. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 right-0 select-none text-[6rem] font-extrabold leading-none tracking-tighter text-foreground/[0.06] sm:text-[7rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <StepContent className="relative mt-6 gap-0 border border-foreground/80 bg-card p-5 shadow-[6px_6px_0_0] shadow-foreground/15 sm:p-6">
                  <MonoTag className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-primary"
                    />
                    Step {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <h3 className="mt-3 text-xl font-bold tracking-tight text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </StepContent>
              </StepItem>
            ))}
          </ol>
          <MonoTag
            aria-hidden="true"
            tone="faint"
            className="mt-12 block md:mt-24"
          >
            [ connect → configure → automate → scale ]
          </MonoTag>
        </Container>
      </StepTimeline>
    )
  },
})
