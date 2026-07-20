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
 * ManufacturingProcess — a heavy-industrial quote-to-delivery process ledger for
 * a precision-manufacturing site. An asymmetric header (mono index eyebrow +
 * giant heading left, mono step count right) sits above a collapsed-border row of
 * slab step cells, each stamped with a giant mono ordinal, a title and copy,
 * followed by a hard-bordered lead-time spec panel: a mono ledger header over a
 * collapsed three-column grid of giant tabular-nums numerals with mono labels. A
 * giant ghost watermark bleeds behind. Tech-brutalist, binary-radius, industrial.
 * Use to explain the workflow from CAD upload to shipping on machine-shop,
 * fabricator or contract-manufacturer pages. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ProcessTimeline,
  ProcessGrid,
  ProcessStep,
} from '#/section-kit/ProcessTimeline.tsx'
export const ManufacturingProcess = defineCapsule({
  name: 'ManufacturingProcess',
  description:
    'A heavy-industrial quote-to-delivery process ledger for a precision-manufacturing site: an asymmetric header (mono index eyebrow + giant heading left, mono step count right) above a collapsed-border row of slab step cells stamped with giant mono ordinals, titles and copy, followed by a hard-bordered lead-time spec panel (mono ledger header over a collapsed three-column grid of giant tabular-nums numerals with mono labels) and a giant ghost watermark behind. Tech-brutalist, binary-radius, industrial. Use to explain the workflow from CAD upload to shipping on machine-shop, fabricator or contract-manufacturer pages.',
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
      <ProcessTimeline
        className={cn(
          'relative overflow-hidden bg-background py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-4 bottom-4 text-[8rem] leading-none sm:text-[12rem]">
          FLOW
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-3xl gap-0"
              eyebrowClassName="font-mono uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mt-3 font-extrabold uppercase tracking-tight sm:text-4xl"
              subtitleClassName="mt-4 text-lg"
            />
            <MonoTag
              aria-hidden="true"
              className="shrink-0 md:mb-2 md:text-right"
            >
              {String(steps.length).padStart(2, '0')} / Steps
            </MonoTag>
          </div>
          <ProcessGrid
            columns={4}
            className="grid-cols-1 gap-0 border-l-2 border-t-2 border-foreground sm:grid-cols-2 lg:grid-cols-5"
          >
            {steps.map((step, i) => (
              <ProcessStep
                key={step.title}
                className="border-b-2 border-r-2 border-foreground bg-card p-6"
              >
                <span className="block font-mono text-4xl font-extrabold tabular-nums leading-none text-foreground/15">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-bold uppercase tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </ProcessStep>
            ))}
          </ProcessGrid>
          <Card
            variant="muted"
            className="mt-14 rounded-none border-2 border-foreground bg-background p-0"
          >
            <div className="flex items-center justify-between border-b-2 border-foreground px-6 py-3">
              <MonoTag className="block">Lead Times</MonoTag>
              <MonoTag tone="faint" aria-hidden="true" className="block">
                [ ledger ]
              </MonoTag>
            </div>
            <StatGrid className="grid grid-cols-1 gap-0 sm:grid-cols-3">
              {stats.map((s, i) => (
                <StatItem
                  key={s.label}
                  className={cn(
                    'items-start p-6 text-left',
                    i > 0 &&
                      'border-t-2 border-foreground sm:border-l-2 sm:border-t-0',
                  )}
                >
                  <StatValue className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
                    {s.value}
                  </StatValue>
                  <StatLabel className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {s.label}
                  </StatLabel>
                </StatItem>
              ))}
            </StatGrid>
          </Card>
        </Container>
      </ProcessTimeline>
    )
  },
})
