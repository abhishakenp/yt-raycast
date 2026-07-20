import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
  StepBadge,
  StepConnector,
} from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MentalHealthSteps — a warm-editorial "how it works" / approach flow for a
 * therapy practice. An asymmetric header (left-aligned mono eyebrow + serif
 * heading + lede, mono step-count meta right) above a numbered 3-step row
 * (filled primary circular badges with dashed connectors on desktop, serif
 * step titles), followed by a soft muted help band pairing a "not sure where
 * to start?" prompt whose lede opens with an oversized drop cap and a square
 * phone CTA + square outline booking link on the left with a hairline-divided
 * pair of help stats on the right. Calm, reassuring wellness aesthetic. CTAs
 * route through section-kit route links. Use to explain the onboarding process
 * for therapists, counselors, psychologists or wellness centers.
 */
export const MentalHealthSteps = defineCapsule({
  name: 'MentalHealthSteps',
  description:
    "Warm-editorial 'how it works' / approach flow for a therapy practice: an asymmetric header (left-aligned mono eyebrow + serif heading + lede, mono step-count meta right) above a numbered 3-step row (filled primary circular badges with dashed connectors on desktop, serif step titles), then a soft muted help band pairing a 'not sure where to start?' prompt whose lede opens with an oversized drop cap plus a square phone CTA + square outline booking link on the left with a hairline-divided pair of help stats on the right. Calm, reassuring wellness aesthetic. CTAs route through section-kit route links. Use to explain the onboarding process for therapists, counselors, psychologists or wellness centers.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    helpHeading: z.string().optional(),
    helpDescription: z.string().optional(),
    helpPhone: z.string().optional(),
    helpCta: z.string().optional(),
    helpStats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Navigation target for the help band CTAs (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'How It Works'
    const heading = props.heading ?? 'Beginning therapy is simple'
    const description =
      props.description ??
      "We've streamlined our process to make starting therapy as comfortable and straightforward as possible."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Schedule a Consultation',
            description:
              "Book a free 15-minute phone consultation through our online calendar. We'll discuss your needs and match you with the best-fit therapist from our team.",
          },
          {
            title: 'Complete Intake Forms',
            description:
              'Fill out our secure online intake forms at your convenience. Insurance verification and payment setup happens automatically through our patient portal.',
          },
          {
            title: 'Begin Your Sessions',
            description:
              'Attend your first session in-person or via secure video. Your therapist will work with you to establish goals and create a personalized treatment plan.',
          },
        ]
    const helpHeading = props.helpHeading ?? 'Not sure where to start?'
    const helpDescription =
      props.helpDescription ??
      'Our client care team is available Monday through Friday, 8am to 6pm, to answer questions and help you find the right therapist for your specific concerns.'
    const helpPhone = props.helpPhone ?? '(503) 555-0147'
    const helpCta = props.helpCta ?? 'Book Online'
    const helpStats = props.helpStats?.length
      ? props.helpStats
      : [
          { value: '48h', label: 'Average response time' },
          { value: '95%', label: 'Match satisfaction' },
        ]
    const bookLabel = props.bookLabel ?? 'Book Session'

    const Phone = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )

    return (
      <StepTimeline
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container size="lg">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              subtitleClassName="text-base leading-relaxed text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(items.length).padStart(2, '0')} / steps
            </MonoTag>
          </div>

          <StepTimelineGrid asChild columns={3}>
            <ul className="lg:gap-12">
              {items.map((step, i) => (
                <StepItem key={step.title}>
                  <div className="flex flex-col items-start text-left">
                    <StepBadge
                      index={i}
                      variant="filled-circle-bold"
                      className="mb-6 rounded-full"
                    />
                    <h3 className="mb-3 font-serif text-xl font-medium tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {i < items.length - 1 ? (
                    <StepConnector variant="dashed" />
                  ) : null}
                </StepItem>
              ))}
            </ul>
          </StepTimelineGrid>

          <div className="mt-16 border border-border bg-muted/40 p-8 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <h3 className="mb-4 font-serif text-2xl font-medium tracking-tight text-foreground">
                  {helpHeading}
                </h3>
                <p className="mb-6 leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-5xl first-letter:font-medium first-letter:leading-[0.8] first-letter:text-foreground">
                  {helpDescription}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px"
                    href={bookLabel}
                  >
                    <Phone className="size-5" />
                    {helpPhone}
                  </NavbarRouteLink>
                  <NavbarRouteLink
                    className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground/25 bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted active:translate-y-px"
                    href={bookLabel}
                  >
                    {helpCta}
                  </NavbarRouteLink>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-0 border-l border-t border-border lg:col-span-5">
                {helpStats.map((s) => (
                  <div
                    key={s.label}
                    className="border-b border-r border-border p-5"
                  >
                    <p className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                      {s.value}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </StepTimeline>
    )
  },
})
