import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CorporateSteps — Swiss-corporate phase ledger for an enterprise / corporate
 * B2B site. A muted wash band with a double-rule asymmetric header (mono
 * "03 / Method" index left, left-aligned heading + lede, tabular phase count
 * right) above a collapsed-border 1/2/4-column ledger of square-edged phase
 * cells. Each cell shares hairline rules and carries a mono primary
 * "Phase 01" label, a giant ghost numeral watermark, a title, and a
 * description; on desktop every other cell drops by a calculated offset — the
 * section's grid rupture. Use to present a methodology, onboarding flow, or
 * project roadmap for enterprise software vendors, consultancies, or managed
 * services.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'
export const CorporateSteps = defineCapsule({
  name: 'CorporateSteps',
  description:
    'Swiss-corporate phase ledger for an enterprise / corporate B2B site: a muted wash band with a double-rule asymmetric header (mono index + tabular phase count) above a collapsed-border 1/2/4-column ledger of square-edged phase cells carrying mono primary phase labels, giant ghost numeral watermarks, titles, and descriptions, with every other cell offset on desktop. Use to present a methodology, onboarding flow, or project roadmap for enterprise software, consultancies, or managed services.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Phase cards: title + description. */
    items: z
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
    const heading = props.heading ?? 'Implementation in four phases'
    const description =
      props.description ??
      'Our proven methodology ensures seamless deployment with minimal disruption to your operations.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Discovery',
            description:
              'Comprehensive assessment of your current infrastructure, workflows, and business objectives. We identify opportunities and define success metrics.',
          },
          {
            title: 'Design',
            description:
              'Custom architecture design tailored to your requirements. Security-first approach with scalability built into every component.',
          },
          {
            title: 'Deployment',
            description:
              'Phased rollout with parallel systems during transition. Our team manages the entire process with 24/7 support throughout.',
          },
          {
            title: 'Optimization',
            description:
              'Continuous monitoring and refinement post-deployment. Regular reviews ensure maximum ROI and alignment with evolving needs.',
          },
        ]
    return (
      <StepTimeline
        className={cn('bg-muted/40 py-16 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              03 / Method
            </span>
            <span className="tabular-nums">
              {String(items.length).padStart(2, '0')} phases
            </span>
          </div>
          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            className="mb-10 max-w-3xl gap-3 sm:mb-14 lg:mb-16"
            titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl"
            subtitleClassName="max-w-xl text-lg"
          />
          <StepTimelineGrid
            columns={2}
            className="gap-0 border-l border-t border-border md:grid-cols-2 lg:grid-cols-4"
          >
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className={cn(
                  'relative overflow-hidden border-b border-r border-border bg-background p-6 sm:p-8',
                  i % 2 === 1 && 'lg:translate-y-6',
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 select-none font-mono text-7xl font-bold tabular-nums leading-none text-foreground/[0.05]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  Phase {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
