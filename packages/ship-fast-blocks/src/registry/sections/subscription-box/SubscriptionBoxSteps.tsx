import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * SubscriptionBoxSteps — bespoke "how it works" band for a subscription-box
 * brand. A padded section composes the shared SectionHeading over a 3-column
 * grid of numbered step cards (Choose, Customize, Delivered), each with a
 * playful number badge, an inline outline icon, a title, and a short
 * description. Theme-token only and renders complete with no props. Use to
 * explain the recurring-box flow on any subscription or membership-kit page.
 */
const PickIcon = ({ className }: { className?: string }) => (
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
const TuneIcon = ({ className }: { className?: string }) => (
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
const TruckIcon = ({ className }: { className?: string }) => (
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

const STEP_ICONS = [PickIcon, TuneIcon, TruckIcon]

export const SubscriptionBoxSteps = defineCapsule({
  name: 'SubscriptionBoxSteps',
  description:
    "Bespoke 'how it works' band for a subscription-box brand: a padded section with the shared SectionHeading over a 3-column grid of numbered step cards (Choose, Customize, Delivered), each with a playful number badge, an inline outline icon, a title, and a short description. Use to explain the recurring-box flow on any subscription or membership-kit page.",
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
      <section
        className={cn(
          'bg-background py-20 text-foreground sm:py-24',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length]
              return (
                <Card
                  key={i}
                  rounded="2xl"
                  padding="lg"
                  className="relative flex flex-col gap-4"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
})
