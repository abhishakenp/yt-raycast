import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MembershipClubCta — full-width primary-surface conversion CTA for a private
 * membership club / exclusive community page. A centered narrow column on the
 * inverted primary surface: a thin display heading, a relaxed supporting line,
 * dual rounded-pill CTAs (solid light primary + outlined secondary) and a small
 * contact footnote (with email) below. CTAs route through useNavigate. Use as the
 * closing "Ready to join" band for members clubs, professional networks, founders
 * communities, mastermind groups or paid community subscriptions. Renders fully
 * with no props.
 */
export const MembershipClubCta = defineComponent({
  name: "MembershipClubCta",
  description:
    "Full-width primary-surface conversion CTA for a private membership club / exclusive community page: a centered narrow column on the inverted primary surface with a thin display heading, a relaxed supporting line, dual rounded-pill CTAs (solid light primary + outlined secondary) and a small contact footnote (with email) below. CTAs route through useNavigate. Use as the closing 'Ready to join' band for members clubs, professional networks, founders communities, mastermind groups or paid community subscriptions.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    /** Contact email surfaced in the footnote. */
    email: z.string().optional(),
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Ready to join us?"
    const description =
      props.description ??
      "Applications are reviewed on a rolling basis. We keep membership intentionally small to preserve the quality of connections. Join 487 members who've found their people."
    const primaryCta = props.primaryCta ?? "Apply for Membership"
    const secondaryCta = props.secondaryCta ?? "Contact Us"
    const email = props.email ?? "hello@theguild.club"
    const footnote =
      props.footnote ??
      `Questions? Email us at ${email} — we reply within 24 hours.`

    return (
      <section
        className={cn(
          "w-full bg-primary py-20 text-primary-foreground lg:py-32",
          props.className,
        )}
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            id="cta-heading"
            className="mb-6 text-3xl font-light text-primary-foreground sm:text-4xl lg:text-5xl"
          >
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              {secondaryCta}
            </button>
          </div>
          <p className="mt-8 text-sm text-primary-foreground/60">{footnote}</p>
        </div>
      </section>
    )
  },
})
