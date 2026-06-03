import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * InsuranceSteps — "how it works" 3-step process band for an insurance page. On
 * a soft muted canvas: a centered eyebrow chip + heading + lede above a
 * responsive grid of numbered step cards, each with a solid brand-colored
 * number tile, a title and a description, connected by right-pointing arrows
 * between cards on desktop. Use to explain a simple get-covered flow for
 * insurance carriers, insurtech, brokers, or financial-protection products.
 * Renders fully with no props via baked-in defaults.
 */
export const InsuranceSteps = defineComponent({
  name: "InsuranceSteps",
  description:
    "'How it works' 3-step process band for an insurance page on a soft muted canvas: a centered eyebrow chip + heading + lede above a responsive grid of numbered step cards, each with a solid brand-colored number tile, a title and a description, connected by right-pointing arrows between cards on desktop. Use to explain a simple get-covered / get-a-quote flow for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Step cards (numbered automatically). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Simple Process"
    const heading = props.heading ?? "Get covered in 3 easy steps"
    const description =
      props.description ??
      "No paperwork, no hassle. Start protecting what matters in under 2 minutes."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Get Your Quote",
            description:
              "Answer a few quick questions about yourself and what you need to protect. Our smart system instantly calculates your personalized rate.",
          },
          {
            title: "Customize Coverage",
            description:
              "Adjust deductibles, add riders, and tailor your policy to fit your exact needs and budget. See price changes in real-time.",
          },
          {
            title: "You're Protected",
            description:
              "Purchase instantly and download your policy documents immediately. Coverage begins the moment you need it.",
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section className={cn("bg-muted py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-primary">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="h-full rounded-2xl border border-border bg-background p-8 shadow-sm">
                  <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {i < items.length - 1 && (
                  <div className="absolute top-1/2 -right-6 hidden -translate-y-1/2 md:block lg:-right-8">
                    <ArrowRight className="size-6 text-border lg:size-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
