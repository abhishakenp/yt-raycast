import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * HealthcareSteps — "how it works" booking flow for a medical-clinic page. A
 * centered eyebrow chip, heading and intro above a responsive 1/3-column row of
 * numbered steps; each step has a solid primary rounded-square number tile, a
 * title and a description, with a faint connecting rule running between tiles on
 * desktop. Tokens-only, no links. Use for a booking / onboarding / "getting
 * started" section of a doctors' office, primary-care practice or telehealth
 * clinic. Renders fully with no props via baked-in 3-step booking defaults.
 */
export const HealthcareSteps = defineComponent({
  name: "HealthcareSteps",
  description:
    "'How it works' booking flow for a medical-clinic page: a centered eyebrow chip, heading and intro above a responsive 1/3-column row of numbered steps, each with a solid primary rounded-square number tile, a title and a description, and a faint connecting rule running between tiles on desktop. Tokens-only, no links. Use for a booking / onboarding / 'getting started' section of a doctors' office, primary-care practice or telehealth clinic.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Steps: title + description (numbered automatically). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "How It Works"
    const heading = props.heading ?? "Book your visit in 3 simple steps"
    const description =
      props.description ??
      "Getting quality healthcare has never been easier. Same-day appointments available for urgent needs."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Book online or call",
            description:
              "Choose your preferred time slot through our secure booking system or call us directly at (415) 555-1234. Virtual visits available.",
          },
          {
            title: "Complete intake",
            description:
              "Fill out your medical history and insurance information through our patient portal before your visit. Takes just 5 minutes.",
          },
          {
            title: "See your doctor",
            description:
              "Arrive 10 minutes early (or join your video call). Your physician will review your history, address concerns, and create a personalized care plan.",
          },
        ]

    return (
      <section
        id="booking"
        className={cn("bg-background py-20 lg:py-28", props.className)}
        aria-labelledby="booking-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              {eyebrow}
            </span>
            <h2
              id="booking-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground md:mx-0">
                  {i + 1}
                </div>
                {i < items.length - 1 ? (
                  <div
                    className="absolute left-20 right-0 top-8 hidden h-0.5 bg-primary/20 md:block"
                    aria-hidden="true"
                  />
                ) : null}
                <h3 className="mb-3 text-center text-xl font-bold text-foreground md:text-left">
                  {step.title}
                </h3>
                <p className="text-center leading-relaxed text-muted-foreground md:text-left">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
