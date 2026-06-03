import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * BlogPostNewsletter — centered email-subscribe band for an editorial blog post
 * detail page. A clean centered section with a bold heading, supporting
 * paragraph, an email input + submit button (stacked on mobile, side-by-side
 * on desktop), and a small footnote. Form submit routes through useNavigate.
 * The input id is namespaced to avoid collisions. Use as the newsletter signup
 * section on blogs, magazines, journals, or any publication page.
 */
export const BlogPostNewsletter = defineComponent({
  name: "BlogPostNewsletter",
  description:
    "Centered email-subscribe band for an editorial blog post detail page: a clean centered section with a bold heading, supporting paragraph, an email input + submit button (stacked on mobile, side-by-side on desktop), and a small footnote. Form submit routes through useNavigate. Use as the newsletter signup section on blogs, magazines, journals, or any publication page.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Email input placeholder text. */
    placeholder: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Small footnote under the form. */
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading =
      props.heading ?? "Subscribe to Studio Journal"
    const description =
      props.description ??
      "Get weekly articles on design craft, strategy, and team culture. No spam, unsubscribe anytime."
    const placeholder = props.placeholder ?? "your@email.com"
    const submit = props.submit ?? "Subscribe"
    const footnote =
      props.footnote ?? "Join 12,400+ designers. Delivered every Tuesday."

    return (
      <section
        className={cn("py-16 lg:py-24", props.className)}
      >
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mb-8 text-muted-foreground">{description}</p>
          <form
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              go(submit)
            }}
          >
            <label htmlFor="newsletter-email-blogpost" className="sr-only">
              Email address
            </label>
            <input
              type="email"
              id="newsletter-email-blogpost"
              placeholder={placeholder}
              required
              className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {submit}
            </button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">{footnote}</p>
        </div>
      </section>
    )
  },
})
