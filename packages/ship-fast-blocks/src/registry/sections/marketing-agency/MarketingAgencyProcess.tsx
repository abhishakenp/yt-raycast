import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * MarketingAgencyProcess — kinetic "how we work" sequence. An asymmetric header
 * (mono "[ PROCESS ]" meta, marker-highlighted heading and description) sits above
 * a staggered 4-up row of sharp step cards with hard offset shadows: each card
 * carries a giant ghost step numeral bleeding behind it, a mono "STEP 01" tag with
 * a primary tick, a bold title and a short description, and a mono pipeline arrow
 * strip runs beneath. Use to explain a working methodology (discovery, strategy,
 * execution, scale) for marketing / growth agencies, consultancies, or service
 * firms. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  ProcessTimeline,
  ProcessGrid,
  ProcessStep,
} from '#/section-kit/ProcessTimeline.tsx'
export const MarketingAgencyProcess = defineCapsule({
  name: 'MarketingAgencyProcess',
  description:
    'Kinetic "how we work" sequence: an asymmetric header (mono process meta, marker-highlighted heading and description) above a staggered 4-up row of sharp hard-offset-shadow step cards, each with a giant ghost step numeral behind it, a mono STEP tag with a primary tick, a bold title and description, plus a mono pipeline arrow strip beneath. Use to explain a working methodology (discovery, strategy, execution, scale) for marketing / growth agencies, consultancies, or service firms.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Our Process'
    const heading = props.heading ?? 'How We Work'
    const description =
      props.description ??
      'A proven framework that delivers consistent results.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery',
            description:
              'Deep dive into your business, competitors, and current performance. We audit every channel and identify quick wins.',
          },
          {
            title: 'Strategy',
            description:
              'Custom growth roadmap with clear milestones, budget allocation, and KPIs. Everything documented in Notion.',
          },
          {
            title: 'Execution',
            description:
              'Campaign launches, creative production, and iterative optimization. Weekly standups and async updates.',
          },
          {
            title: 'Scale',
            description:
              'Double down on winners, cut losers, and expand to new channels. Monthly strategy reviews and pivoting.',
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
      <ProcessTimeline
        className={cn(
          'relative overflow-hidden bg-background py-20 lg:py-28 lg:pb-40',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Process
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · {String(steps.length).padStart(2, '0')} steps
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
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
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ {eyebrow} ]
            </p>
          </div>
          <ProcessGrid columns={4} className="gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <ProcessStep
                key={step.title}
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
                <div className="relative mt-6 flex flex-col border border-foreground/80 bg-card p-5 shadow-[6px_6px_0_0] shadow-foreground/12 sm:p-6">
                  <MonoTag className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-primary"
                    />
                    Step {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <h3 className="mt-3 text-lg font-bold tracking-tight text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </ProcessStep>
            ))}
          </ProcessGrid>
          <MonoTag
            aria-hidden="true"
            tone="faint"
            className="mt-12 block md:mt-24"
          >
            [ discovery → strategy → execution → scale ]
          </MonoTag>
        </Container>
      </ProcessTimeline>
    )
  },
})
