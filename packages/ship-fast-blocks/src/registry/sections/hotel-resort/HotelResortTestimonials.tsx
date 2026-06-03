import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * HotelResortTestimonials — guest testimonials grid for a luxury hotel /
 * resort & spa site. A muted-surface section with a centered eyebrow + thin
 * heading + paragraph, then a 3-up grid of cards, each with a 5-star rating row
 * in the primary color, a quote, and an avatar beside the guest name and
 * location/date meta. Warm and reassuring. Use to surface reviews and social
 * proof for hotels, resorts, spa retreats, inns, or wellness destinations.
 * Avatars use the alt-driven Image component. Renders fully with no props via
 * baked-in guest defaults.
 */
export const HotelResortTestimonials = defineComponent({
  name: "HotelResortTestimonials",
  description:
    "Guest testimonials grid for a luxury hotel / resort & spa site: a muted-surface section with a centered uppercase eyebrow + thin heading + paragraph, then a 3-up grid of cards each with a 5-star rating row in the primary color, a quote, and an avatar beside the guest name and location/date meta. Warm and reassuring; avatars use the alt-driven Image component. Use to surface reviews and social proof for hotels, resorts, spa retreats, inns, or wellness destinations.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? "Guest Experiences"
    const heading = props.heading ?? "What our guests say"
    const description =
      props.description ??
      "Rated 4.9/5 across 2,400+ reviews on TripAdvisor, Google, and Booking.com"
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "We celebrated our anniversary here and it exceeded every expectation. The Azure Suite was magnificent, the staff anticipated our needs before we even asked. Already planning our return.",
            name: "Margaret Chen",
            meta: "San Francisco, CA • March 2026",
            avatarAlt:
              "Professional headshot of a smiling woman with shoulder-length brown hair",
          },
          {
            quote:
              "The spa experience alone is worth the trip. I've visited wellness retreats worldwide and Azure's treatments are simply world-class. The heated pool at sunrise is pure magic.",
            name: "Robert Mitchell",
            meta: "London, UK • February 2026",
            avatarAlt:
              "Professional headshot of a smiling middle-aged man with short gray hair",
          },
          {
            quote:
              "We hosted our company retreat here and the service was impeccable. From the private dining setup to the team-building activities, everything was flawlessly executed.",
            name: "Sarah Johnson",
            meta: "Austin, TX • January 2026",
            avatarAlt:
              "Professional headshot of a confident woman with blonde hair and warm smile",
          },
        ]

    const StarIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn("bg-muted py-24 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-lg bg-card p-8 text-card-foreground"
              >
                <div className="mb-4 flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="size-5" />
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
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.meta}</p>
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
