import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NewsletterCta — inverted final-CTA subscribe band for an editorial newsletter.
 * A full-width dark foreground band, centered: a large serif headline, a relaxed
 * lede, an inline email subscribe form (translucent email input + solid
 * background submit button that stacks on mobile), and a small note line with an
 * inline upgrade link. Warm, calm, literary mood inverted for emphasis. The form
 * submit and the note link route through useNavigate. Use as the closing
 * conversion band for newsletters, publications, blogs, or content creators.
 * Renders fully with no props via baked-in defaults.
 */
export const NewsletterCta = defineComponent({
  name: "NewsletterCta",
  description:
    "Inverted final-CTA subscribe band for an editorial newsletter: a full-width dark foreground band, centered, with a large serif headline, a relaxed lede, an inline email subscribe form (translucent email input + solid background submit button that stacks on mobile), and a small note line with an inline upgrade link. Warm, calm, literary mood inverted for emphasis. The form submit and the note link route through useNavigate. Use as the closing conversion band for newsletters, publications, blogs, or content creators.",
  props: z.object({
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting lede under the headline. */
    description: z.string().optional(),
    /** Email input placeholder. */
    emailPlaceholder: z.string().optional(),
    /** Submit button label (also the navigate target on submit). */
    submit: z.string().optional(),
    /** Note prefix before the inline link. */
    notePrefix: z.string().optional(),
    /** Note inline link label (also the navigate target). */
    noteLink: z.string().optional(),
    /** Note suffix after the inline link. */
    noteSuffix: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Start your Sunday with insight"
    const description =
      props.description ??
      "Join 12,000+ readers who make The Quiet Observer part of their weekend ritual. No spam. Unsubscribe anytime."
    const emailPlaceholder = props.emailPlaceholder ?? "your@email.com"
    const submit = props.submit ?? "Subscribe Free"
    const notePrefix = props.notePrefix ?? "Or "
    const noteLink = props.noteLink ?? "upgrade to paid"
    const noteSuffix = props.noteSuffix ?? " for the full experience."

    return (
      <section
        className={cn(
          "bg-foreground py-16 md:py-24",
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-serif text-3xl font-medium text-background sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-background/70">
            {description}
          </p>

          <form
            className="mx-auto max-w-md"
            onSubmit={(e) => {
              e.preventDefault()
              go(submit)
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                placeholder={emailPlaceholder}
                aria-label="Email address for newsletter subscription"
                className="flex-1 rounded-lg border border-background/20 bg-background/10 px-4 py-3 text-background placeholder-background/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-background"
              />
              <button
                type="submit"
                className="rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90 focus:outline-none focus:ring-2 focus:ring-background focus:ring-offset-2"
              >
                {submit}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-background/60">
            {notePrefix}
            <button
              type="button"
              onClick={() => go(noteLink)}
              className="text-background/80 underline hover:no-underline"
            >
              {noteLink}
            </button>
            {noteSuffix}
          </p>
        </div>
      </section>
    )
  },
})
