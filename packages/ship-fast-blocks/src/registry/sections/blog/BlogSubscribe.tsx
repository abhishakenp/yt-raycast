import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * BlogSubscribe — centered newsletter signup band for an editorial blog or
 * publication. A rounded card holds an eyebrow pill, a large headline, a
 * supporting subtitle, and an email-capture form (an email input plus a submit
 * button laid out as a responsive flex — stacked on mobile, inline on larger
 * screens), followed by a small reassurance note. Submitting the form routes
 * through useNavigate so it can hand off to a subscribe destination. Use as the
 * Subscribe section near the foot of blog homepages, magazine indexes, or
 * editorial landing pages to grow the mailing list.
 */
export const BlogSubscribe = defineComponent({
  name: "BlogSubscribe",
  description:
    "Centered newsletter signup band for an editorial blog or publication: a rounded card with an eyebrow pill, a large headline, a supporting subtitle, and an email-capture form (email input plus submit button laid out as a responsive flex — stacked on mobile, inline on larger screens), followed by a small reassurance note. Submitting the form routes through useNavigate to a subscribe destination. Use as the Subscribe section near the foot of blog homepages, magazine indexes, or editorial landing pages to grow the mailing list.",
  props: z.object({
    /** Small uppercase pill above the heading. */
    eyebrow: z.string().optional(),
    /** Main headline of the signup band. */
    heading: z.string().optional(),
    /** Supporting subtitle below the heading. */
    subheading: z.string().optional(),
    /** Email input placeholder. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    ctaLabel: z.string().optional(),
    /** Navigation target when the form is submitted. */
    ctaTarget: z.string().optional(),
    /** Small reassurance line below the form. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Newsletter"
    const heading = props.heading ?? "Get our best essays in your inbox"
    const subheading =
      props.subheading ??
      "Join 12,000+ readers. One thoughtful email a week — no noise."
    const placeholder = props.placeholder ?? "you@example.com"
    const ctaLabel = props.ctaLabel ?? "Subscribe"
    const ctaTarget = props.ctaTarget ?? "Subscribe"
    const note = props.note ?? "No spam. Unsubscribe anytime."

    return (
      <section
        aria-label="Newsletter signup"
        className={cn("mx-auto w-full max-w-4xl px-6 py-16", props.className)}
      >
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)] md:p-12">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-accent">
            {eyebrow}
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {subheading}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              go(ctaTarget)
            }}
            className="mx-auto mt-7 flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder={placeholder}
              aria-label="Email address"
              className="w-full flex-1 rounded-full border border-input bg-background px-5 py-3 text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {ctaLabel}
            </button>
          </form>
          <p className="mt-4 text-[0.8rem] text-muted-foreground">{note}</p>
        </div>
      </section>
    )
  },
})
