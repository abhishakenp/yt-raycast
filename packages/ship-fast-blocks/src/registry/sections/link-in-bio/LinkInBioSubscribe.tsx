import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * LinkInBioSubscribe — a compact, centered email-capture band sized for a
 * mobile link-in-bio / link-hub page. It renders a single rounded card on a
 * card surface: a small mail icon tile, an uppercase eyebrow, a bold headline,
 * a short subtitle, then a stacked newsletter form (an email input + a full
 * width pill submit button) and a small reassurance note underneath. The form
 * routes through useNavigate on submit so it slots into the same flow as the
 * other link-hub bands. Use as the "Subscribe" / newsletter-capture role of a
 * Linktree / Bento style personal landing page, creator or influencer link hub,
 * or social-profile splash. Renders fully with no props.
 */
export const LinkInBioSubscribe = defineComponent({
  name: "LinkInBioSubscribe",
  description:
    "Compact, centered EMAIL-CAPTURE / newsletter-subscribe band sized for a mobile LINK-IN-BIO / link-hub page. Renders a single rounded card on a card surface with a small mail icon tile, an uppercase eyebrow, a bold headline, a short subtitle, a stacked subscribe form (an email input + a full-width pill submit button), and a small reassurance note. Use as the 'Subscribe' / 'Join my newsletter' / email-signup role of a Linktree / Bento style personal landing page, creator or influencer link hub, freelancer bio link, or social-profile splash. Supply copy only — eyebrow, heading, subheading, placeholder, CTA label, and note; the section owns all layout and styling.",
  props: z.object({
    /** Small uppercase label above the headline. */
    eyebrow: z.string().optional(),
    /** Main headline of the capture card. */
    heading: z.string().optional(),
    /** Supporting subtitle under the headline. */
    subheading: z.string().optional(),
    /** Placeholder text for the email input. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    ctaLabel: z.string().optional(),
    /** Routing key fired when the form is submitted. */
    ctaTarget: z.string().optional(),
    /** Small reassurance line under the form. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()

    const eyebrow = props.eyebrow ?? "Stay in the loop"
    const heading = props.heading ?? "Join my newsletter"
    const subheading =
      props.subheading ??
      "Get new drops, posts, and behind-the-scenes — straight to your inbox."
    const placeholder = props.placeholder ?? "you@example.com"
    const ctaLabel = props.ctaLabel ?? "Subscribe"
    const ctaTarget = props.ctaTarget ?? "Subscribe"
    const note = props.note ?? "No spam. Unsubscribe anytime."

    return (
      <section className={cn("mx-auto w-full max-w-md px-6 py-10", props.className)}>
        <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-accent">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
            {heading}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{subheading}</p>

          <form
            className="mt-6 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              go(ctaTarget)
            }}
          >
            <input
              type="email"
              placeholder={placeholder}
              aria-label="Email address"
              className="w-full rounded-full border border-input bg-background px-5 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {ctaLabel}
            </button>
          </form>

          <p className="mt-3 text-xs text-muted-foreground">{note}</p>
        </div>
      </section>
    )
  },
})
