import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * EventCta — a final call-to-action band for a conference or event page. A
 * centered, large heading with a supporting paragraph, dual primary/secondary
 * CTAs (get ticket / download brochure), and a closing email line with an inline
 * mailto-style link. All actions route through useNavigate. Use as the closing
 * conversion band before the footer on tech conference, summit, festival, or
 * workshop pages.
 */
export const EventCta = defineComponent({
  name: "EventCta",
  description:
    "Final call-to-action band for a conference or event page: a centered large heading with a supporting paragraph, dual primary/secondary CTAs (get ticket / download brochure), and a closing email line with an inline contact link. All actions route through useNavigate. Use as the closing conversion band before the footer on tech conference, summit, festival, meetup, or workshop pages.",
  props: z.object({
    /** Heading text. */
    heading: z.string().optional(),
    /** Supporting paragraph beneath the heading. */
    description: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Label preceding the contact email. */
    emailLabel: z.string().optional(),
    /** Contact email shown as an inline link. */
    email: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Ready to join us in San Francisco?"
    const description =
      props.description ??
      "Early bird tickets sold out in 48 hours last year. Secure your spot at DesignFront 2024 before prices increase."
    const primaryCta = props.primaryCta ?? "Get Your Ticket — $649"
    const secondaryCta = props.secondaryCta ?? "Download Brochure"
    const emailLabel = props.emailLabel ?? "Questions? Email us at"
    const email = props.email ?? "hello@designfront.io"

    return (
      <section className={cn("py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-8 py-4 text-lg font-medium text-foreground transition-colors hover:bg-muted"
            >
              {secondaryCta}
            </button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            {emailLabel}{" "}
            <button
              type="button"
              onClick={() => go(email)}
              className="text-foreground underline hover:no-underline"
            >
              {email}
            </button>
          </p>
        </div>
      </section>
    )
  },
})
