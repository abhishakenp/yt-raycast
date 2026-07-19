import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ProcessTimeline,
  ProcessGrid,
  ProcessStep,
} from '#/section-kit/ProcessTimeline.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * AccountingFirmProcess — "how we work" steps band for a CPA / accounting-firm
 * site. A centered heading + lede above a responsive 3-up numbered process grid
 * (filled circular step badges with connecting rules between them on desktop),
 * followed by a bordered inline booking-CTA panel (heading + blurb + filled
 * button). Calm, trustworthy professional-services aesthetic. The CTA routes
 * through section-kit route links. Use to explain engagement flow on accounting firms, CPA
 * practices, tax/bookkeeping providers, audit firms, or advisory practices.
 * Renders fully with no props via baked-in defaults.
 */
export const AccountingFirmProcess = defineCapsule({
  name: 'AccountingFirmProcess',
  description:
    'How-we-work process band for a CPA / accounting-firm site: a centered heading + lede above a responsive 3-up numbered process grid with filled circular step badges and connecting rules on desktop, followed by a bordered inline booking-CTA panel (heading + blurb + filled button). Calm professional-services look; the CTA routes through section-kit route links. Use to explain the engagement flow on accounting firms, CPA practices, tax/bookkeeping providers, audit firms, or advisory practices.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting lede under the heading. */
    description: z.string().optional(),
    /** Numbered process steps. */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Inline CTA panel heading. */
    ctaHeading: z.string().optional(),
    /** Inline CTA panel blurb. */
    ctaDescription: z.string().optional(),
    /** Inline CTA panel button label. */
    ctaButton: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How we work with you'
    const description =
      props.description ??
      'A proven process designed to understand your needs and deliver measurable results from day one.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Discovery & Assessment',
            description:
              'We begin with a complimentary consultation to understand your financial situation, goals, and challenges. This includes a comprehensive review of your current books, tax returns, and financial statements.',
          },
          {
            title: 'Strategy & Planning',
            description:
              'Our team develops a customized financial strategy tailored to your specific objectives. We present clear recommendations with projected outcomes, timelines, and transparent fee structures.',
          },
          {
            title: 'Execution & Support',
            description:
              'We implement your plan with precision, providing ongoing support, regular check-ins, and proactive adjustments as your situation evolves. Your dedicated account manager ensures nothing falls through the cracks.',
          },
        ]
    const ctaHeading = props.ctaHeading ?? 'Ready to get started?'
    const ctaDescription =
      props.ctaDescription ??
      'Schedule your complimentary consultation—no obligation, no pressure.'
    const ctaButton = props.ctaButton ?? 'Book Your Consultation'

    return (
      <ProcessTimeline
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
            subtitleClassName="text-lg"
          />

          <ProcessGrid columns={3} className="gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <ProcessStep key={step.title} className="relative">
                <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-[calc(100%+1.5rem)] top-6 hidden h-px w-[calc(100%-3rem)] -translate-y-1/2 bg-border md:block"
                  />
                )}
              </ProcessStep>
            ))}
          </ProcessGrid>

          <Card variant="muted" className="mt-16 rounded-lg p-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div>
                <h4 className="mb-2 text-xl font-semibold text-foreground">
                  {ctaHeading}
                </h4>
                <p className="text-muted-foreground">{ctaDescription}</p>
              </div>
              <NavbarRouteLink
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                href={ctaButton}
              >
                {ctaButton}
              </NavbarRouteLink>
            </div>
          </Card>
        </Container>
      </ProcessTimeline>
    )
  },
})
