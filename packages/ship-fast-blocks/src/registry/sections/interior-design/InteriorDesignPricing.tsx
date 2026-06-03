import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * InteriorDesignPricing — inverted (foreground-surface) services + pricing list
 * for an upscale interior-design / architecture studio. A dramatic two-column
 * band on the dark foreground surface: on the left an uppercase eyebrow, a
 * light-weight heading, a supporting paragraph and a filled inverted CTA; on the
 * right a divided vertical list of service tiers, each with a title, a right-
 * aligned price and a short description. Editorial, refined and high-contrast.
 * The CTA routes through useNavigate. Use to present service packages and
 * pricing for interior designers, design studios or architecture firms. Renders
 * fully with no props via baked-in defaults.
 */
export const InteriorDesignPricing = defineComponent({
  name: "InteriorDesignPricing",
  description:
    "Inverted (foreground-surface) services + pricing list for an upscale interior-design / architecture studio: a dramatic two-column band on the dark foreground surface with an uppercase eyebrow, light-weight heading, supporting paragraph and a filled inverted CTA on the left, and a divided vertical list of service tiers — each with a title, right-aligned price and short description — on the right. Editorial, refined and high-contrast; the CTA routes through useNavigate. Use to present service packages and pricing for interior designers, design studios or architecture firms.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    cta: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          price: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Services"
    const heading = props.heading ?? "Comprehensive design services"
    const description =
      props.description ??
      "From initial concept to final installation, we offer a full spectrum of interior design services tailored to projects of every scale."
    const cta = props.cta ?? "Request Service Guide"
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Full-Service Design",
            price: "From $25,000",
            description:
              "Complete interior design from concept through installation. Includes space planning, material selection, custom furniture design, and project management.",
          },
          {
            title: "Design Consultation",
            price: "$500/hour",
            description:
              "Professional guidance for DIY projects or renovation planning. Includes detailed recommendations, material suggestions, and vendor referrals.",
          },
          {
            title: "Furniture Procurement",
            price: "Project-based",
            description:
              "Access to trade-only furniture and decor with designer discounts. We source, procure, and coordinate delivery and placement.",
          },
          {
            title: "Styling & Accessories",
            price: "From $5,000",
            description:
              "The finishing touches that make a house a home. Art curation, accessory selection, and professional styling for photography or living.",
          },
        ]

    return (
      <section
        className={cn(
          "bg-foreground px-4 py-20 text-background sm:px-6 md:py-32 lg:px-8",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-background/60">
                {eyebrow}
              </p>
              <h2 className="mb-8 text-3xl font-light md:text-4xl">
                {heading}
              </h2>
              <p className="mb-12 max-w-lg leading-relaxed text-background/70">
                {description}
              </p>
              <button
                type="button"
                onClick={() => go(cta)}
                className="inline-flex items-center bg-background px-8 py-4 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
              >
                {cta}
              </button>
            </div>

            <div className="space-y-8">
              {items.map((item, i) => (
                <div
                  key={item.title}
                  className={cn(
                    "pb-8",
                    i < items.length - 1 && "border-b border-background/20",
                  )}
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-medium">{item.title}</h3>
                    <span className="whitespace-nowrap text-sm text-background/60">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-background/70">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
