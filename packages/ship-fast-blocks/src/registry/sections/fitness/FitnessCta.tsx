import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * FitnessCta — bold primary-filled email-capture call-to-action for a gym or fitness
 * studio. A centered heading + supporting paragraph over an inline email input +
 * submit button, a "questions?" line with click-to-call phone and email buttons, and
 * a footer row of a pin-icon location and a clock-icon hours. The form and contact
 * links route through useNavigate. Use as the closing trial / sign-up banner above
 * the footer on gyms, fitness studios, yoga / pilates / boxing / spin studios.
 */
export const FitnessCta = defineComponent({
  name: "FitnessCta",
  description:
    "Bold primary-filled email-capture call-to-action for a gym or fitness studio: a centered heading and supporting paragraph over an inline email input + submit button, a 'questions?' line with click-to-call phone and email buttons, and a footer row of a pin-icon location and a clock-icon hours. The form submit and contact links route through useNavigate. Use as the closing free-trial / sign-up conversion banner above the footer on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    submit: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    location: z.string().optional(),
    hours: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const ctaHeading = props.heading ?? "Start your 7-day free trial"
    const ctaDesc =
      props.description ??
      "Experience everything Base has to offer—no commitment, no credit card required. Join 3,200+ members building strength together."
    const ctaPlaceholder = props.placeholder ?? "Enter your email"
    const ctaSubmit = props.submit ?? "Get Started"
    const ctaPhone = props.phone ?? "(415) 555-1234"
    const ctaEmail = props.email ?? "hello@basefitness.com"
    const ctaLocation =
      props.location ?? "1240 Mission St, San Francisco, CA 94103"
    const ctaHours = props.hours ?? "Mon–Fri: 5:30am–10pm, Sat–Sun: 7am–8pm"

    return (
      <section className={cn("bg-primary py-20 md:py-32", props.className)}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold text-primary-foreground md:text-4xl lg:text-5xl">
            {ctaHeading}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/70">
            {ctaDesc}
          </p>

          <form
            className="mx-auto mb-8 flex max-w-md flex-col gap-4 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              go(ctaSubmit)
            }}
          >
            <input
              type="email"
              required
              placeholder={ctaPlaceholder}
              aria-label={ctaPlaceholder}
              className="flex-1 rounded-sm border-0 bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="rounded-sm bg-primary-foreground px-6 py-3 font-medium text-primary transition-colors hover:bg-primary-foreground/90"
            >
              {ctaSubmit}
            </button>
          </form>

          <p className="text-sm text-primary-foreground/60">
            Questions? Call us at{" "}
            <button
              type="button"
              onClick={() => go(ctaPhone)}
              className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              {ctaPhone}
            </button>{" "}
            or email{" "}
            <button
              type="button"
              onClick={() => go(ctaEmail)}
              className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              {ctaEmail}
            </button>
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{ctaLocation}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{ctaHours}</span>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
