import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * LendingStats — a stats / about split with a glowing photo and a floating review
 * card, for a lending or fintech marketing page. On the left: a heading,
 * supporting paragraph, and a 2x2 grid of muted stat tiles (big value + label).
 * On the right: a large rounded photo with an overlapping bottom-left review card
 * — five star icons, a quoted testimonial, an avatar, and a name/location. Use to
 * build trust with track-record numbers and a real-borrower quote on loan, about,
 * or fintech landing pages. All imagery uses the alt-driven Image component.
 * Renders fully with no props via baked-in defaults.
 */
export const LendingStats = defineComponent({
  name: "LendingStats",
  description:
    "Stats / about split with a photo and a floating review card for a lending or fintech marketing page: left column has a heading, supporting paragraph and a 2x2 grid of muted stat tiles (big value + label); right column is a large rounded photo with an overlapping bottom-left review card — five star icons, a quoted testimonial, an avatar and a name/location. Use to build trust with track-record numbers and a real-borrower quote on loan, about, or fintech landing pages. Imagery uses the alt-driven Image component.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    imageAlt: z.string().optional(),
    reviewQuote: z.string().optional(),
    reviewName: z.string().optional(),
    reviewMeta: z.string().optional(),
    reviewAvatarAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statsHeading =
      props.heading ?? "Trusted by over 250,000 borrowers"
    const statsDesc =
      props.description ??
      "Since 2019, we've helped people consolidate debt, fund major purchases, and achieve financial goals without the stress of traditional lending."
    const statsItems = props.items?.length
      ? props.items
      : [
          { value: "$1.2B+", label: "In loans funded" },
          { value: "4.9/5", label: "Average rating" },
          { value: "2 min", label: "Average application" },
          { value: "24 hrs", label: "Average funding time" },
        ]
    const statsImageAlt =
      props.imageAlt ??
      "diverse group of professionals collaborating in modern office setting"
    const statsReviewQuote =
      props.reviewQuote ??
      "ClearLoan helped me consolidate $18,000 in credit card debt. I'm saving $340/month and paying off 3 years sooner."
    const statsReviewName = props.reviewName ?? "Sarah Mitchell"
    const statsReviewMeta = props.reviewMeta ?? "San Francisco, CA"
    const statsReviewAvatarAlt =
      props.reviewAvatarAlt ??
      "professional headshot of a smiling woman with brown hair in business attire"

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn("py-24 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {statsHeading}
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                {statsDesc}
              </p>
              <div className="grid grid-cols-2 gap-6">
                {statsItems.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-muted p-6"
                  >
                    <div className="mb-1 text-3xl font-bold text-foreground">
                      {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                alt={statsImageAlt}
                w={800}
                h={600}
                loading="lazy"
                className="w-full rounded-2xl object-cover shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl border border-border bg-card p-6 shadow-lg">
                <div className="mb-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-5 text-chart-4" />
                  ))}
                </div>
                <p className="mb-3 text-sm text-card-foreground">
                  &ldquo;{statsReviewQuote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={statsReviewAvatarAlt}
                    w={100}
                    h={100}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-card-foreground">
                      {statsReviewName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {statsReviewMeta}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
