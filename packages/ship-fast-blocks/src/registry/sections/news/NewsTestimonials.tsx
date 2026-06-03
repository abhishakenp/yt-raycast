import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * NewsTestimonials — reader testimonials band for a news / editorial site. On a
 * muted section: a centered heading + subheading, then a three-column grid of
 * bordered quote cards, each with a five-star rating, the reader's quote, and an
 * avatar + name + role footer. Static social proof — no links. Use to build trust
 * on a newspaper, magazine or subscription publication homepage, typically before
 * the subscribe CTA. Renders fully with no props via baked-in defaults.
 */
export const NewsTestimonials = defineComponent({
  name: "NewsTestimonials",
  description:
    "Reader testimonials band for a news / editorial site on a muted section: a centered heading + subheading, then a three-column grid of bordered quote cards each with a five-star rating, the reader's quote, and an avatar + name + role footer. Static social proof (no links). Use to build trust on a newspaper, magazine or subscription publication homepage, typically before the subscribe CTA.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section subheading. */
    subheading: z.string().optional(),
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
    const heading = props.heading ?? "What Readers Say"
    const subheading =
      props.subheading ?? "Trusted by over 2 million subscribers worldwide"
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "The Chronicle's investigative reporting on climate policy helped me understand complex legislation better than any other source. Their journalists actually read the bills.",
            name: "Prof. Robert Chen",
            role: "Environmental Policy, Stanford",
            avatarAlt:
              "Professional headshot of Professor Robert Chen with glasses",
          },
          {
            quote:
              "I started my day with The Chronicle's briefing three years ago and haven't stopped. It's the perfect balance of depth and brevity for a busy executive.",
            name: "Jennifer Walsh",
            role: "CEO, Horizon Ventures",
            avatarAlt:
              "Professional headshot of Jennifer Walsh CEO in business attire",
          },
          {
            quote:
              "Finally, a news source that doesn't treat readers like attention-deficient children. Long-form journalism done right. Worth every penny of the subscription.",
            name: "David Park",
            role: "Software Architect, Seattle",
            avatarAlt:
              "Professional headshot of David Park software engineer",
          },
        ]

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
      <section className={cn("bg-muted py-12 lg:py-16", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-bold text-foreground lg:text-2xl">
              {heading}
            </h2>
            <p className="mt-2 text-muted-foreground">{subheading}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 text-chart-4" />
                  ))}
                </div>
                <p className="leading-relaxed text-card-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
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
