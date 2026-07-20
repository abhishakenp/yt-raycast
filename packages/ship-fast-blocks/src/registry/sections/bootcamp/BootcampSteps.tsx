import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * BootcampSteps — "Terminal Classroom" admissions log for a coding bootcamp /
 * career-school landing page. An asymmetric 4:8 split on a muted wash: the
 * left rail holds a left-aligned mono-labeled header, a decorative
 * `$ admissions --start` prompt line, and a bracketed step-count tag; the
 * right column runs a session-log list of hairline-divided step rows — each
 * with a sharp square mono number badge, a mono `STEP 01 / 04` index label, a
 * title, and a description — alternate rows offset rightward on desktop with
 * a dashed vertical rail threading the badges. Use to explain the
 * application-to-placement journey for bootcamps, academies, or cohort-based
 * education programs.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
  StepBadge,
  StepConnector,
} from '#/section-kit/StepTimeline.tsx'
export const BootcampSteps = defineCapsule({
  name: 'BootcampSteps',
  description:
    "Terminal-styled admissions log for a coding bootcamp / career-school landing page: asymmetric 4:8 split on a muted wash with a left rail (mono-labeled header, decorative '$ admissions --start' prompt, bracketed step-count tag) beside a session-log list of hairline-divided step rows. Each row has a sharp square mono number badge, a mono 'STEP 01 / 04' index label, a title, and a description; alternate rows offset rightward on desktop with a dashed vertical rail threading the badges. Use to explain the application-to-placement journey for bootcamps, academies, or cohort-based education programs.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Steps: title + description. */
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
    const stepsEyebrow = props.eyebrow ?? 'How It Works'
    const stepsHeading = props.heading ?? 'Your path to a tech career'
    const stepsDesc =
      props.description ??
      'From application to job offer — we support you every step of the way.'
    const stepItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Apply Online',
            description:
              'Complete our 15-minute application. No prior experience required — just logical thinking and determination.',
          },
          {
            title: 'Admission Call',
            description:
              'Chat with our admissions team about your goals. We ensure the program is right for your career aspirations.',
          },
          {
            title: 'Complete Bootcamp',
            description:
              '16 weeks of intensive, hands-on learning. Daily standups, code reviews, and 1:1 mentorship sessions.',
          },
          {
            title: 'Land Your Job',
            description:
              'Work with our career team to land interviews. Average graduate salary: $78,000 — $95,000 first year.',
          },
        ]
    const total = String(stepItems.length).padStart(2, '0')
    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <SectionHeading
                align="left"
                eyebrow={stepsEyebrow}
                title={stepsHeading}
                subtitle={stepsDesc}
                className="gap-0"
                eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                subtitleClassName="text-base text-muted-foreground sm:text-lg"
              />
              <p
                aria-hidden="true"
                className="mt-6 font-mono text-sm text-muted-foreground"
              >
                <span className="text-primary">$</span> admissions --start
              </p>
              <MonoTag tone="faint" className="mt-2 block">
                [ {total} steps · rolling intake ]
              </MonoTag>
            </div>
            <StepTimelineGrid
              asChild
              columns={2}
              className="grid-cols-1 gap-0 md:grid-cols-1 lg:col-span-8"
            >
              <ol className="relative">
                <StepConnector
                  variant="dashed"
                  className="bottom-10 left-6 top-10 h-auto w-px translate-x-0 border-l border-t-0 border-dashed border-primary/30 sm:left-7"
                />
                {stepItems.map((step, i) => (
                  <StepItem
                    key={step.title}
                    className={cn(
                      'relative grid grid-cols-[3rem_1fr] items-start gap-x-4 gap-y-1 border-t border-border py-6 text-left sm:grid-cols-[3.5rem_1fr] sm:gap-x-6 lg:py-7',
                      i === stepItems.length - 1 && 'border-b',
                      i % 2 === 1 && 'lg:gap-x-20',
                    )}
                  >
                    <StepBadge
                      index={i}
                      variant="filled-square"
                      className="col-start-1 row-span-3 row-start-1 size-12 rounded-none border border-foreground bg-background font-mono text-lg font-semibold text-foreground tabular-nums ring-4 ring-background sm:size-14"
                    />
                    <MonoTag tone="primary" className="col-start-2">
                      step {String(i + 1).padStart(2, '0')} / {total}
                    </MonoTag>
                    <h3 className="col-start-2 text-lg font-semibold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="col-start-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </StepItem>
                ))}
              </ol>
            </StepTimelineGrid>
          </div>
        </Container>
      </StepTimeline>
    )
  },
})
