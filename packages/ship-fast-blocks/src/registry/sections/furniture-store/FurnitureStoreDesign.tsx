import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FurnitureStoreDesign — a dark, primary-background design-service band. A
 * two-column section (stacks on mobile): a left copy column with an eyebrow,
 * heading, paragraph, a numbered 3-step process list (each step a circular index
 * chip + title + caption) and an inverted CTA button; a right column with a tall
 * image and a floating card pinned to its corner showing a stat callout (label,
 * big value, caption). The CTA routes through useNavigate. Use to promote a
 * complimentary / paid interior-design or consultation service for furniture,
 * home-decor, or interiors brands. Renders fully with no props via baked-in
 * "Haven & Home" defaults.
 */
export const FurnitureStoreDesign = defineComponent({
  name: "FurnitureStoreDesign",
  description:
    "Dark primary-background design-service band: a two-column section (stacks on mobile) with a left copy column (eyebrow, heading, paragraph, numbered 3-step process list of circular index chip + title + caption, and an inverted CTA button) beside a right column with a tall image and a floating corner card showing a stat callout (label, big value, caption); CTA routes through useNavigate. Use to promote a complimentary or paid interior-design / consultation service for furniture, home-decor, or interiors brands.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    cta: z.string().optional(),
    imageAlt: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    statLabel: z.string().optional(),
    statValue: z.string().optional(),
    statCaption: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Complimentary Design Service"
    const heading = props.heading ?? "Not sure where to start? We'll help."
    const description =
      props.description ??
      "Our design experts will work with you to create a space you'll love. From mood boards to floor plans, we're with you every step of the way—completely free."
    const cta = props.cta ?? "Book free consultation"
    const imageAlt =
      props.imageAlt ??
      "Interior designer consulting with clients in a bright modern showroom with furniture samples"
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: "Book a free consultation",
            description:
              "Schedule a 30-minute video call with one of our design experts.",
          },
          {
            title: "Share your space",
            description:
              "Upload photos and measurements. Tell us about your lifestyle and budget.",
          },
          {
            title: "Get your custom plan",
            description:
              "Receive a personalized design board, floor plan, and curated product list.",
          },
        ]
    const statLabel = props.statLabel ?? "Designer consultations"
    const statValue = props.statValue ?? "12,000+"
    const statCaption = props.statCaption ?? "Completed this year"

    const ArrowLong = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section
        className={cn(
          "bg-primary py-16 text-primary-foreground lg:py-24",
          props.className,
        )}
        aria-labelledby="furniture-design-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
                {eyebrow}
              </p>
              <h2
                id="furniture-design-heading"
                className="mb-6 text-3xl font-medium lg:text-4xl"
              >
                {heading}
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                {description}
              </p>

              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                      <span className="text-sm font-medium">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="mb-1 font-medium">{step.title}</h3>
                      <p className="text-sm text-primary-foreground/70">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(cta)}
                className="mt-8 inline-flex items-center rounded-md bg-primary-foreground px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90"
              >
                {cta}
                <ArrowLong className="ml-2 size-4" />
              </button>
            </div>

            <div className="relative">
              <Image
                alt={imageAlt}
                w={800}
                h={900}
                loading="lazy"
                className="h-auto w-full rounded-lg object-cover"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-lg bg-card p-6 text-card-foreground shadow-xl sm:block">
                <p className="mb-1 text-sm font-medium text-muted-foreground">
                  {statLabel}
                </p>
                <p className="text-3xl font-semibold">{statValue}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {statCaption}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
