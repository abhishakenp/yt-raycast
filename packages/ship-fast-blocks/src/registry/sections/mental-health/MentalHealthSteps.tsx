import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MentalHealthSteps — a "how it works" / approach flow for a therapy practice.
 * A centered eyebrow + heading + intro above a numbered 3-step row (filled
 * primary circular badges with dashed connectors on desktop), followed by a
 * primary-tinted help band pairing a "not sure where to start?" prompt with a
 * phone CTA + secondary booking button on the left and a divided pair of help
 * stats on the right. Calm, reassuring wellness aesthetic. CTAs route through
 * useNavigate. Use to explain the onboarding process for therapists, counselors,
 * psychologists or wellness centers.
 */
export const MentalHealthSteps = defineComponent({
  name: 'MentalHealthSteps',
  description:
    "'How it works' / approach flow for a therapy practice: a centered eyebrow + heading + intro above a numbered 3-step row (filled primary circular badges with dashed connectors on desktop), then a primary-tinted help band pairing a 'not sure where to start?' prompt with a phone CTA + secondary booking button on the left and a divided pair of help stats on the right. Calm, reassuring wellness aesthetic. CTAs route through useNavigate. Use to explain the onboarding process for therapists, counselors, psychologists or wellness centers.",
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
    const go = useNavigate()
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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 grid size-16 place-items-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {i < items.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-8 hidden w-full -translate-x-1/2 border-t-2 border-dashed border-primary/30 md:block"
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl bg-primary/10 p-8 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h3 className="mb-4 text-2xl font-semibold text-foreground">
                  {helpHeading}
                </h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {helpDescription}
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => go(bookLabel)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Phone className="size-5" />
                    {helpPhone}
                  </button>
                  <button
                    type="button"
                    onClick={() => go(bookLabel)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {helpCta}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-8 text-center">
                {helpStats.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-8">
                    {i > 0 ? (
                      <span
                        aria-hidden="true"
                        className="h-12 w-px bg-border"
                      />
                    ) : null}
                    <div>
                      <p className="text-3xl font-semibold text-primary">
                        {s.value}
                      </p>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
