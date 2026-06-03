import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DirectoryCta — dark inverted conversion CTA band for a local-business
 * directory. A foreground-on-background inverted section with a large centered
 * headline, a supporting paragraph in muted inverted text, and a centered pair
 * of CTAs (a filled background-surface primary button + an outlined secondary
 * button). Both CTAs route through useNavigate. Use as the closing
 * list-your-business / sign-up conversion band on local directories,
 * marketplaces, or find-a-service platforms.
 */
export const DirectoryCta = defineComponent({
  name: "DirectoryCta",
  description:
    "Dark inverted conversion CTA band for a local-business DIRECTORY: a foreground-on-background inverted section with a large centered headline, a supporting paragraph in muted inverted text, and a centered pair of CTAs (a filled background-surface primary button plus an outlined secondary button). Both CTAs route through useNavigate. Use as the closing list-your-business or sign-up conversion band on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.",
  props: z.object({
    /** CTA heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Ready to Grow Your Business?"
    const description =
      props.description ??
      "Join 12,000+ local businesses already connecting with customers on LocalFindr. Start your free listing today."
    const primaryCta = props.primaryCta ?? "List Your Business Free"
    const secondaryCta = props.secondaryCta ?? "Contact Sales"

    return (
      <section
        className={cn(
          "bg-foreground py-16 text-background lg:py-24",
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-background/70">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="rounded-lg bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="rounded-lg border border-background/40 px-8 py-4 font-medium text-background transition-colors hover:border-background/70"
            >
              {secondaryCta}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
