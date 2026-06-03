import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * CorporateTestimonials — 3-up customer testimonial grid for an enterprise /
 * corporate B2B site. A centered section heading above a responsive 1/2/3-column
 * grid of cards with star ratings, a quote, and an avatar + name + role footer.
 * Use to build social proof on SaaS, consultancy, or managed services landing pages.
 */
export const CorporateTestimonials = defineComponent({
  name: "CorporateTestimonials",
  description:
    "3-up customer testimonial grid for an enterprise / corporate B2B site: centered heading above a responsive 1/2/3-column grid of cards with a 5-star rating row, a quote, and an avatar + name + role footer. Use to build social proof on SaaS, consultancy, or managed services landing pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? "Trusted by industry leaders"
    const description =
      props.description ??
      "See how leading organizations transformed their operations with Nexus."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Nexus transformed our infrastructure in just 90 days. We reduced operational costs by 40% while improving system reliability. Their team's expertise is unmatched in the industry.",
            name: "Michael Chen",
            role: "CTO, Meridian Financial Group",
            avatarAlt:
              "Professional headshot of a smiling male executive in business attire",
          },
          {
            quote:
              "The security and compliance features gave our board complete confidence. We passed our SOC 2 audit with zero findings—a first for our company. Nexus made it possible.",
            name: "Sarah Williams",
            role: "CISO, Horizon Healthcare Systems",
            avatarAlt:
              "Professional headshot of a female executive with confident expression",
          },
          {
            quote:
              "We evaluated 12 vendors before choosing Nexus. Their analytics platform helped us identify $3.2M in operational inefficiencies within the first quarter.",
            name: "David Park",
            role: "COO, Pacific Logistics Inc.",
            avatarAlt:
              "Professional headshot of a middle-aged male business leader with glasses",
          },
        ]

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-chart-4"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn("bg-background py-20 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-muted/50 p-8"
              >
                <div className="mb-6 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
