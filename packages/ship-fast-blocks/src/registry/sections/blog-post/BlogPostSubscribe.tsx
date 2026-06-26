import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BlogPostSubscribe — newsletter signup band for an editorial blog/article
 * page. A soft card/muted surface with a bold heading, a short supporting line,
 * an email input + Subscribe button (stacked on mobile, side-by-side on
 * desktop), and a small reassurance footnote. The Subscribe button routes
 * through useNavigate. The input id is namespaced to avoid collisions. Uses
 * semantic tokens only. Use as the newsletter signup section on blogs,
 * magazines, journals, or any publication page.
 */
export const BlogPostSubscribe = defineComponent({
  name: 'BlogPostSubscribe',
  description:
    'Newsletter signup band for a blog/article page: a soft card/muted surface with a bold heading, a short supporting line, an email input + Subscribe button (stacked on mobile, side-by-side on desktop), and a small reassurance footnote. The Subscribe button routes through useNavigate. Use as the newsletter signup section on blogs, magazines, journals, or any publication page.',
  props: z.object({
    /** Band heading. */
    heading: z.string().optional(),
    /** Short supporting line under the heading. */
    subheading: z.string().optional(),
    /** Email input placeholder text. */
    placeholder: z.string().optional(),
    /** Subscribe button label. */
    ctaLabel: z.string().optional(),
    /** Small reassurance footnote under the form. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Subscribe to Studio Journal'
    const subheading =
      props.subheading ??
      'Get weekly articles on design craft, strategy, and team culture, delivered every Tuesday.'
    const placeholder = props.placeholder ?? 'your@email.com'
    const ctaLabel = props.ctaLabel ?? 'Subscribe'
    const note = props.note ?? 'No spam. Unsubscribe anytime.'

    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <div className="rounded-2xl bg-muted px-6 py-12 text-center sm:px-12">
            <h2 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">
              {heading}
            </h2>
            <p className="mb-8 text-muted-foreground">{subheading}</p>
            <form
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                go(ctaLabel)
              }}
            >
              <label htmlFor="subscribe-email-blogpost" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="subscribe-email-blogpost"
                placeholder={placeholder}
                required
                className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {ctaLabel}
              </button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">{note}</p>
          </div>
        </div>
      </section>
    )
  },
})
