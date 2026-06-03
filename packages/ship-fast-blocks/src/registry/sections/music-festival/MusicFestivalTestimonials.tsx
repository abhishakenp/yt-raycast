import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * MusicFestivalTestimonials — a three-up starred testimonial grid for a music /
 * arts festival landing page. A centered eyebrow + heading above a row of three
 * bordered cards, each with a circular headshot avatar + name + role, a five-
 * star rating row, and a quote. Avatars use the alt-driven Image component. Use
 * for social proof on music festivals, arts festivals, concert series, or any
 * multi-day live event with returning attendees.
 */
export const MusicFestivalTestimonials = defineComponent({
  name: "MusicFestivalTestimonials",
  description:
    "Three-up starred testimonial grid for a music / arts festival landing page: a centered eyebrow + heading above a row of three bordered cards, each with a circular headshot avatar plus name and role, a five-star rating row, and a quote in smart quotes. Avatars use the alt-driven Image component. Use for community social proof on music festivals, arts festivals, concert series, raves, or any multi-day live event with returning attendees.",
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          quote: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Community"
    const heading = props.heading ?? "What People Say"
    const items = props.items?.length
      ? props.items
      : [
          {
            name: "Maya Thompson",
            role: "Festival veteran, 4 years",
            quote:
              "Horizon changed my life. The curation is impeccable — I've discovered at least five artists each year that are now in my daily rotation. The desert setting makes it magical.",
            avatarAlt:
              "Professional headshot of a smiling young woman with curly hair and natural makeup",
          },
          {
            name: "David Chen",
            role: "Photographer, LA",
            quote:
              "As a photographer, I've shot dozens of festivals. Horizon stands out for its attention to detail — the art installations, the lighting design, even the way the stages are positioned for golden hour. Pure visual poetry.",
            avatarAlt:
              "Professional headshot of a bearded man in his 30s with a friendly smile",
          },
          {
            name: "Sarah Williams",
            role: "First-timer, Portland",
            quote:
              "I was nervous about my first camping festival, but the Horizon community made me feel at home immediately. The wellness programs were a lifesaver, and I made friends for life. Already bought my 2025 ticket!",
            avatarAlt:
              "Professional headshot of a blonde woman with a warm smile and casual style",
          },
        ]

    const Star = () => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-primary" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn("py-24 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-4xl font-bold tracking-tight lg:text-5xl">
              {heading}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-card p-8 text-card-foreground"
              >
                <div className="mb-6 flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-card-foreground/60">{t.role}</p>
                  </div>
                </div>
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="leading-relaxed text-card-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
