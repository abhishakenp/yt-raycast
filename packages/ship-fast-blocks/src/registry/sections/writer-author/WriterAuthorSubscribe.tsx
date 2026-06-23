import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { SectionHeading } from "#/section-kit/SectionHeading.tsx"

/**
 * WriterAuthorSubscribe — bespoke newsletter signup band for a literary author
 * site. Composes a centered SectionHeading (eyebrow pill + serif headline +
 * inviting subtitle) above an inline email form (email input + filled Subscribe
 * button) seated on a rounded token card band, with reassuring privacy microcopy
 * beneath. Elegant, serif-forward, and fully token-driven. Use on an author or
 * writer homepage / about page to collect newsletter subscribers and invite
 * readers to follow new books and essays. Renders fully with no props via
 * baked-in defaults.
 */
export const WriterAuthorSubscribe = defineComponent({
  name: "WriterAuthorSubscribe",
  description:
    "Bespoke newsletter signup band for a literary author site: a centered SectionHeading (uppercase eyebrow, elegant serif headline, inviting subtitle) sits above an inline email form (email input + filled Subscribe button) on a rounded token card / muted band, with reassuring privacy microcopy underneath. Serif-forward and fully token-based. Use on an author, writer, novelist, or essayist homepage or about page to capture newsletter subscribers and invite readers to follow new books, essays, and announcements.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Serif headline for the newsletter band. */
    heading: z.string().optional(),
    /** Supporting subtitle inviting readers to subscribe. */
    subheading: z.string().optional(),
    /** Placeholder text inside the email input. */
    placeholder: z.string().optional(),
    /** Label on the filled submit button. */
    buttonLabel: z.string().optional(),
    /** Privacy reassurance microcopy beneath the form. */
    privacy: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Newsletter"
    const heading = props.heading ?? "Letters from Eleanor"
    const subheading =
      props.subheading ??
      "Join Eleanor Vance's readers for occasional letters on new books, work-in-progress essays, and the stories behind the writing — delivered straight to your inbox."
    const placeholder = props.placeholder ?? "you@example.com"
    const buttonLabel = props.buttonLabel ?? "Subscribe"
    const privacy = props.privacy ?? "No spam. Unsubscribe anytime."

    return (
      <section className={cn("bg-background py-20 sm:py-24", props.className)}>
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-card-foreground sm:p-12">
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
              titleClassName="font-serif"
            />
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder={placeholder}
                aria-label="Email address"
                className="w-full flex-1 rounded-full border border-border bg-background px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {buttonLabel}
              </button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">{privacy}</p>
          </div>
        </div>
      </section>
    )
  },
})
