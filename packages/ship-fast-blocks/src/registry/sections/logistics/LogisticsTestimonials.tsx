import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * LogisticsTestimonials — a three-up customer testimonials grid for a global-
 * logistics / freight-forwarding company on a subtle muted band. A centered
 * heading + lede over a 1 → 2 → 3 column grid of bordered cards; each card shows a
 * five-star row, a quoted paragraph, and an avatar photo beside a name + role.
 * Clean and corporate on a light surface. Use as social proof for logistics,
 * freight-forwarding, shipping, courier, warehousing or cargo/transport companies.
 * Renders fully with no props via alt-driven avatars.
 */
export const LogisticsTestimonials = defineComponent({
  name: "LogisticsTestimonials",
  description:
    "Three-up customer testimonials grid for a global-logistics / freight-forwarding company on a subtle muted band: a centered heading + lede over a 1 → 2 → 3 column grid of bordered cards, each showing a five-star row, a quoted paragraph, and an avatar photo beside a name + role. Clean and corporate on a light surface. Use as social proof for logistics, freight-forwarding, shipping, courier, warehousing, supply-chain or cargo/transport companies.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const heading = props.heading ?? "Trusted by shippers worldwide"
    const description =
      props.description ??
      "What our customers say about working with SwiftFreight."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "SwiftFreight has been our logistics partner for 6 years. Their real-time tracking and proactive communication have eliminated the 'where's my shipment?' anxiety completely.",
            name: "Sarah Chen",
            role: "VP Operations, TechFlow Inc.",
            avatarAlt:
              "Professional headshot of a smiling businesswoman in a navy blazer",
          },
          {
            quote:
              "When we needed to move 40 containers from Ningbo to Rotterdam in 48 hours, SwiftFreight chartered a vessel. That level of responsiveness is why we've tripled our volume with them.",
            name: "Marcus Weber",
            role: "Director of Logistics, Globex Trading",
            avatarAlt:
              "Professional headshot of a middle-aged businessman with glasses and a confident smile",
          },
          {
            quote:
              "Their customs brokerage team saved us from a $15,000 duty miscalculation. They caught the HS code error before the shipment left Shanghai. That's partnership.",
            name: "Elena Rodriguez",
            role: "Import Manager, Acme Corporation",
            avatarAlt:
              "Professional headshot of a young woman with dark hair wearing a white blouse",
          },
        ]

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-5", className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn("bg-muted/50 py-16 lg:py-24", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight lg:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <div className="mb-4 flex items-center gap-1 text-chart-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground/90">
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
                    <p className="font-semibold text-card-foreground">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
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
