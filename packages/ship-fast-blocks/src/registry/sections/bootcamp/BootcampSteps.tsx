import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * BootcampSteps — 4-step "how it works" admissions path for a coding bootcamp /
 * career-school landing page. A centered eyebrow, heading and description
 * above a responsive 4-column grid of numbered step cards; each card features a
 * large numbered circle in primary, a step title, and a description. Horizontal
 * connector lines appear between steps on desktop (lg). Use to explain the
 * application-to-placement journey for bootcamps, academies, or cohort-based
 * education programs.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
    "4-step 'how it works' admissions path for a coding bootcamp / career-school landing page: centered eyebrow, heading and description above a responsive 4-column grid of numbered step cards. Each card has a large numbered circle in primary, a step title, and a description. Horizontal connector lines appear between steps on desktop. Use to explain the application-to-placement journey for bootcamps, academies, or cohort-based education programs.",
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
    return (
      <StepTimeline
        className={cn('bg-muted/40 py-20 lg:py-28', props.className)}
      >
        <Container>
          <SectionHeading
            eyebrow={stepsEyebrow}
            title={stepsHeading}
            subtitle={stepsDesc}
            className="mb-16 lg:mb-20 max-w-3xl gap-0"
            eyebrowClassName="mb-4 inline-block text-xs font-semibold tracking-wider text-primary"
            titleClassName="mb-4 text-3xl font-bold sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <StepTimelineGrid asChild columns={4}>
            <ul className="md:grid-cols-2 lg:grid-cols-4">
              {stepItems.map((step, i) => (
                <StepItem key={step.title}>
                  <StepBadge
                    index={i}
                    variant="filled-square"
                    className="mb-6 rounded-full"
                  />
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  {i < stepItems.length - 1 ? (
                    <StepConnector
                      variant="solid"
                      className="left-full top-6 w-full md:hidden lg:block"
                    />
                  ) : null}
                </StepItem>
              ))}
            </ul>
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
