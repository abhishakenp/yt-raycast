import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * MentalHealthTestimonials — a 3-up testimonials grid for a therapy practice. A
 * centered eyebrow + heading + intro above a responsive 1/2/3-column grid of
 * rounded bordered cards, each with a 5-star primary rating row, a quoted client
 * testimonial, and a footer pairing a round client avatar with name + therapy
 * detail. Calm, warm, sage-and-sand wellness aesthetic with soft card shadow.
 * Use as social proof for therapists, counselors, psychologists or wellness
 * centers.
 */
export const MentalHealthTestimonials = defineComponent({
  name: "MentalHealthTestimonials",
  description:
    "3-up testimonials grid for a therapy practice: a centered eyebrow + heading + intro above a responsive 1/2/3-column grid of rounded bordered cards, each with a 5-star primary rating row, a quoted client testimonial, and a footer pairing a round client avatar with name + therapy detail. Calm, warm, sage-and-sand wellness aesthetic with soft card shadow. Use as social proof for therapists, counselors, psychologists or wellness centers.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          detail: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Testimonials"
    const heading = props.heading ?? "Words from our clients"
    const description =
      props.description ??
      "Real stories from people who have found support and healing through our services."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "After years of struggling with anxiety, I finally found a therapist who truly understands me. Dr. Chen helped me develop tools I use every day. My life has changed in ways I never thought possible.",
            name: "David Mitchell",
            detail: "Individual Therapy • 18 months",
            avatarAlt:
              "Professional headshot of David Mitchell, a client with warm genuine smile",
          },
          {
            quote:
              "Marcus saved our marriage. We were on the verge of separating, and six months of couples therapy gave us the communication tools we desperately needed. We're closer now than we've been in years.",
            name: "Rebecca & James Torres",
            detail: "Couples Therapy • 8 months",
            avatarAlt:
              "Professional headshot of Rebecca Torres, a client with confident friendly expression",
          },
          {
            quote:
              "As a parent of a teenager struggling with depression, finding the right help felt overwhelming. The team here made the process simple and my daughter actually looks forward to her sessions with Jennifer.",
            name: "Michael Chen",
            detail: "Family Services • 6 months",
            avatarAlt:
              "Professional headshot of Michael Chen, a parent client with thoughtful caring expression",
          },
        ]

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn("py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border bg-card p-8 shadow-sm"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-5 text-primary" />
                  ))}
                </div>
                <blockquote className="mb-6 leading-relaxed text-card-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.detail}</p>
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
