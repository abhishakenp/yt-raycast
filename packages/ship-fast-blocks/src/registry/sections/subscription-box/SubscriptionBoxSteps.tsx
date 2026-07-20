import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * SubscriptionBoxSteps — playful-commerce "how it works" band for a
 * subscription-box brand. An asymmetric left-aligned header (mono eyebrow +
 * extrabold heading) sits over a staggered 3-column grid of chunky box-motif
 * step cards (Choose, Customize, Delivered): each card is a sharp-cornered
 * token-bordered box with a hard offset token shadow, a giant ghost index
 * numeral, a rounded-full number sticker, an inline outline icon in a squared
 * tile, a title, and a short description; alternating cards translate down for
 * a staggered rhythm. Theme-token only and renders complete with no props. Use
 * to explain the recurring-box flow on any subscription or membership-kit page.
 */
function PickIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 11 3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}
function TuneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="1" x2="7" y1="14" y2="14" />
      <line x1="9" x2="15" y1="8" y2="8" />
      <line x1="17" x2="23" y1="16" y2="16" />
    </svg>
  )
}
function TruckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}

const STEP_ICONS = [PickIcon, TuneIcon, TruckIcon]

export const SubscriptionBoxSteps = defineCapsule({
  name: 'SubscriptionBoxSteps',
  description:
    "Playful-commerce 'how it works' band for a subscription-box brand: an asymmetric left-aligned mono-eyebrow header over a staggered 3-column grid of chunky box-motif step cards (Choose, Customize, Delivered), each a sharp-cornered token-bordered box with a hard offset token shadow, a giant ghost index numeral, a rounded-full number sticker, an inline outline icon in a squared tile, a title, and a short description. Use to explain the recurring-box flow on any subscription or membership-kit page.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'How it works'
    const heading = props.heading ?? 'Three happy little steps'
    const subheading =
      props.subheading ??
      'From picking your vibe to ripping the tape off your first box — it could not be simpler.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Choose your box',
            description:
              'Pick the size and theme that fits you. Mini for a treat, Deluxe for the full haul.',
          },
          {
            title: 'Customize the goodies',
            description:
              "Tell us what you love and skip what you don't. Every box is tuned to your taste.",
          },
          {
            title: 'Delivered to your door',
            description:
              'Sit back and watch it arrive. Free shipping, every month, ready to unbox.',
          },
        ]

    return (
      <StepTimeline
        className={cn(
          'bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <Container>
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            className="max-w-2xl"
            titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          />
          <StepTimelineGrid
            columns={3}
            className="mt-14 grid-cols-1 items-start gap-6 sm:gap-7"
          >
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length]
              return (
                <StepItem
                  key={i}
                  className={cn(
                    'group relative flex flex-col gap-4 overflow-hidden rounded-none border-2 border-foreground bg-card p-6 shadow-[6px_6px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[8px_8px_0_0] motion-reduce:transform-none sm:p-7',
                    i % 2 === 1 && 'md:translate-y-8',
                  )}
                >
                  <span
                    className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-8xl font-extrabold leading-none tabular-nums text-foreground/[0.05]"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="relative flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-full border-2 border-foreground bg-primary font-mono text-sm font-bold tabular-nums text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="inline-flex size-11 items-center justify-center rounded-none border-2 border-foreground bg-background text-foreground">
                      <Icon className="size-6" />
                    </span>
                  </div>
                  <h3 className="relative text-lg font-bold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="relative text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </StepItem>
              )
            })}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
