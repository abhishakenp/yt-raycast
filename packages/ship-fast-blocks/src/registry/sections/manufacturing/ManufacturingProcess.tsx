import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'

/**
 * ManufacturingProcess — a numbered quote-to-delivery process band for a
 * precision-manufacturing site. A centered eyebrow + heading + description intro
 * sits above a horizontal five-column step row, each step a numbered foreground
 * circle with title and copy joined by connector lines on desktop, followed by a
 * bordered lead-time stats panel (three big numbers). Clean, neutral,
 * industrial. Use to explain the workflow from CAD upload to shipping on
 * machine-shop, fabricator or contract-manufacturer pages. Renders fully with no
 * props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'
export const ManufacturingProcess = defineCapsule({
  name: 'ManufacturingProcess',
  description:
    'A numbered quote-to-delivery process band for a precision-manufacturing site: a centered eyebrow + heading + description intro above a horizontal five-column step row (each step a numbered foreground circle with title and copy joined by connector lines on desktop), followed by a bordered lead-time stats panel with three big numbers. Clean, neutral, industrial. Use to explain the workflow from CAD upload to shipping on machine-shop, fabricator or contract-manufacturer pages.',
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
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Process'
    const heading = props.heading ?? 'From Quote to Delivery in Five Steps'
    const description =
      props.description ??
      'Our streamlined workflow ensures clear communication, on-time delivery, and parts that meet your exact specifications.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Upload & Quote',
            description:
              'Submit CAD files (STEP, IGES, SolidWorks) through our secure portal. Receive detailed quote within 24 hours.',
          },
          {
            title: 'DFM Review',
            description:
              'Our engineers review for manufacturability, suggest cost optimizations, and confirm materials and finishes.',
          },
          {
            title: 'Production',
            description:
              'Parts enter our production queue. Real-time status updates via customer portal with photos at key stages.',
          },
          {
            title: 'Inspection',
            description:
              '100% dimensional inspection with CMM. FAIR documentation, material certs, and test reports included.',
          },
          {
            title: 'Ship & Support',
            description:
              'Carefully packaged and shipped worldwide. Engineering support for assembly questions or design revisions.',
          },
        ]
    const stats = props.stats?.length
      ? props.stats
      : [
          {
            value: '24hr',
            label: 'Standard Quote Turnaround',
          },
          {
            value: '2-3 Days',
            label: 'Prototype Lead Time',
          },
          {
            value: '2-4 Weeks',
            label: 'Production Lead Time',
          },
        ]
    return (
      <StepTimeline
        className={cn('bg-background py-20 lg:py-28', props.className)}
      >
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="tracking-wider text-muted-foreground"
            titleClassName="mt-3 tracking-tight sm:text-4xl"
            subtitleClassName="mt-4 text-lg"
          />
          <StepTimelineGrid columns={4} className="gap-8">
            {steps.map((step, i) => (
              <StepItem key={step.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 grid size-12 place-items-center rounded-full bg-foreground text-lg font-semibold text-background">
                    {i + 1}
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute left-full top-6 hidden h-px w-full -translate-x-1/2 bg-border md:block" />
                )}
              </StepItem>
            ))}
          </StepTimelineGrid>
          <Card variant="muted" rounded="lg" padding="lg" className="mt-16">
            <StatGrid className="grid gap-8 text-center md:grid-cols-3">
              {stats.map((s) => (
                <StatItem key={s.label}>
                  <StatValue className="text-3xl font-semibold text-foreground">
                    {s.value}
                  </StatValue>
                  <StatLabel className="mt-1 text-sm">{s.label}</StatLabel>
                </StatItem>
              ))}
            </StatGrid>
          </Card>
        </Container>
      </StepTimeline>
    )
  },
})
