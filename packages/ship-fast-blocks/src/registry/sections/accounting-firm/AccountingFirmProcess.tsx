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
 * AccountingFirmProcess — Swiss-ledger dark process band for a CPA /
 * accounting-firm site. The page's full ink inversion (foreground background,
 * background text): a mono uppercase meta rule with a primary square and a
 * tabular step count above a left-aligned oversized heading + lede, then a
 * 3-column collapsed-border step ledger — each cell sharing hairline rules with
 * a giant ghost numeral watermark, a mono primary step label, a title, and a
 * description — followed by a hairline-bordered booking strip whose
 * square-edged button inverts back to the light surface with press feedback.
 * Financial-broadsheet gravitas: the dark band anchors the page rhythm. The CTA
 * routes through section-kit route links. Use to explain engagement flow on
 * accounting firms, CPA practices, tax/bookkeeping providers, audit firms, or
 * advisory practices. Renders fully with no props via baked-in defaults.
 */
export const AccountingFirmProcess = defineCapsule({
  name: 'AccountingFirmProcess',
  description:
    'Swiss-ledger dark process band for a CPA / accounting-firm site: a full ink-inverted section (foreground background, background text) with a mono uppercase meta rule + tabular step count, a left-aligned oversized heading + lede, a 3-column collapsed-border step ledger whose cells share hairline rules and carry giant ghost numeral watermarks, mono primary step labels, titles, and descriptions, then a hairline-bordered booking strip with a square-edged light button with press feedback. The CTA routes through section-kit route links. Use to explain the engagement flow on accounting firms, CPA practices, tax/bookkeeping providers, audit firms, or advisory practices.',
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
        variant="inverted"
        className={cn(
          // Slanted top edge: the inverted band starts on a diagonal seam
          // (clip-path on the band itself keeps it neighbor-independent).
          'relative overflow-hidden py-16 pt-24 [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-28 lg:pt-36',
          props.className,
        )}
      >
        <Container className="relative">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Process
            </span>
            <span className="tabular-nums">
              {String(steps.length).padStart(2, '0')} steps
            </span>
          </div>

          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            className="mb-10 max-w-3xl gap-4 sm:mb-14 lg:mb-16"
            titleClassName="text-4xl font-semibold tracking-tight text-background sm:text-5xl"
            subtitleClassName="max-w-xl text-lg text-background/60"
          />

          <ProcessGrid
            columns={3}
            className="gap-0 border-l border-t border-background/20"
          >
            {steps.map((step, i) => (
              <ProcessStep
                key={step.title}
                className="relative border-b border-r border-background/20 p-6 sm:p-8 lg:p-10"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-5 top-5 select-none font-mono text-7xl font-bold tabular-nums leading-none text-background/15 sm:right-6 sm:top-6"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  Step {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-background">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-background/70">
                  {step.description}
                </p>
              </ProcessStep>
            ))}
          </ProcessGrid>

          <Card
            variant="outline"
            className="mt-10 rounded-none border-background/20 p-6 text-background sm:mt-16 sm:p-8"
          >
            <div className="flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h4 className="mb-2 text-xl font-semibold tracking-tight text-background">
                  {ctaHeading}
                </h4>
                <p className="text-background/70">{ctaDescription}</p>
              </div>
              <NavbarRouteLink
                className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-none bg-background px-7 py-3.5 text-base font-medium text-foreground transition-all duration-150 hover:bg-background/90 active:translate-y-px md:w-auto"
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
