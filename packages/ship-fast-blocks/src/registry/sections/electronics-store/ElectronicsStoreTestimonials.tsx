import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * ElectronicsStoreTestimonials — a 3-up verified-buyer testimonials row for an
 * electronics storefront. A centered heading above muted rounded cards, each with
 * a 5-star rating, a quoted review, and a footer pairing a round customer avatar
 * with the name and a verified-buyer meta line. Avatars are alt-driven images.
 * Use for social proof on electronics stores, gadget shops, consumer-tech
 * retailers, or audio/camera storefronts.
 */
export const ElectronicsStoreTestimonials = defineComponent({
  name: "ElectronicsStoreTestimonials",
  description:
    "3-up verified-buyer testimonials row for an electronics storefront: a centered heading above muted rounded cards, each with a 5-star rating, a quoted review, and a footer pairing a round customer avatar with the name and a verified-buyer meta line (e.g. 'Verified Buyer • 3 orders'). Avatars are alt-driven images. Use for social proof on electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "What Our Customers Say"
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Ordered the Sony WH-1000XM5 headphones and they arrived in 2 days. The noise cancellation is incredible for my commute. Customer service was helpful when I had questions about setup.",
            name: "Marcus Chen",
            meta: "Verified Buyer • 3 orders",
            avatarAlt:
              "Professional headshot of a smiling male customer with short brown hair",
          },
          {
            quote:
              "TechNova has become my go-to for all tech purchases. Bought the DJI Mini 4 Pro and the iPad Air M2 bundle deal saved me over $200. Everything arrived perfectly packaged.",
            name: "Sarah Mitchell",
            meta: "Verified Buyer • 8 orders",
            avatarAlt:
              "Professional headshot of a smiling female customer with blonde hair",
          },
          {
            quote:
              "As a professional photographer, I rely on quality gear. The Canon EOS R6 Mark II I purchased was competitively priced and came with full warranty. Their trade-in program is also fantastic.",
            name: "David Park",
            meta: "Verified Buyer • 12 orders",
            avatarAlt:
              "Professional headshot of a smiling male photographer with beard and glasses",
          },
        ]

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={cn("size-4", className)}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn("py-16 lg:py-24", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground">
            {heading}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((t) => (
              <div key={t.name} className="rounded-xl bg-muted/50 p-6">
                <div className="mb-4 flex items-center gap-1 text-chart-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-5" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.meta}
                    </div>
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
