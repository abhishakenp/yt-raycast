import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * HealthcareSteps — collapsed-border "how it works" booking ledger for a
 * medical-clinic page. An asymmetric header (left-aligned mono eyebrow +
 * heading + lede, mono "[ booking ]" meta right) above a hairline
 * collapsed-border 1-to-3 column ledger of numbered steps; each square cell
 * pairs a giant ghost zero-padded index numeral with a step title and a
 * description, and a short primary tick dash under the number. Tokens-only, no
 * links. Use for a booking / onboarding / "getting started" section of a
 * doctors' office, primary-care practice or telehealth clinic. Renders fully
 * with no props via baked-in 3-step booking defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'
export const HealthcareSteps = defineCapsule({
  name: 'HealthcareSteps',
  description:
    "Collapsed-border 'how it works' booking ledger for a medical-clinic page: an asymmetric header (left-aligned mono eyebrow + heading + lede, mono booking meta right) above a hairline collapsed-border 1-to-3 column ledger of numbered steps, each square cell pairing a giant ghost zero-padded index numeral with a step title, a description, and a short primary tick dash. Tokens-only, no links. Use for a booking / onboarding / 'getting started' section of a doctors' office, primary-care practice or telehealth clinic.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Steps: title + description (numbered automatically). */
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
    const eyebrow = props.eyebrow ?? 'How It Works'
    const heading = props.heading ?? 'Book your visit in 3 simple steps'
    const description =
      props.description ??
      'Getting quality healthcare has never been easier. Same-day appointments available for urgent needs.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Book online or call',
            description:
              'Choose your preferred time slot through our secure booking system or call us directly at (415) 555-1234. Virtual visits available.',
          },
          {
            title: 'Complete intake',
            description:
              'Fill out your medical history and insurance information through our patient portal before your visit. Takes just 5 minutes.',
          },
          {
            title: 'See your doctor',
            description:
              'Arrive 10 minutes early (or join your video call). Your physician will review your history, address concerns, and create a personalized care plan.',
          },
        ]
    return (
      <StepTimeline
        id="booking"
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
        aria-labelledby="booking-heading"
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              titleId="booking-heading"
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              [ booking ]
            </MonoTag>
          </div>

          <StepTimelineGrid
            columns={3}
            className="gap-0 border-l border-t border-border"
          >
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className="relative gap-4 border-b border-r border-border p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="text-[clamp(3rem,5vw,4.5rem)] font-extrabold leading-none tracking-tight text-foreground/[0.08] tabular-nums"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="h-px w-8 bg-primary" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
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
