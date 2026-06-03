import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ChurchPathways — a 3-up "next step" pathways grid for a church or faith-community
 * site. Heading + description on the left, then a responsive grid of photo-card
 * articles with image, title, description, and a text CTA with arrow. Each card
 * image lazily loads and subtly scales on hover. CTAs route through useNavigate.
 * Use for small-groups, kids/youth, serve-together, or any multi-pathway onboarding
 * flow for churches, ministries, or community organizations. Renders fully with no
 * props via baked-in defaults.
 */
export const ChurchPathways = defineComponent({
  name: "ChurchPathways",
  description:
    "3-up next-step pathways grid for a church or faith-community site: heading + description on the left, then a responsive grid of photo-card articles with image, title, description, and a text CTA with arrow. Each image lazily loads and subtly scales on hover. CTAs route through useNavigate. Use for small-groups, kids/youth, serve-together, or any multi-pathway onboarding flow for churches, ministries, or community organizations.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Paragraph under the heading. */
    description: z.string().optional(),
    /** Pathway cards; each has a title, description, CTA label, and image alt. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          cta: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Everyone has a next step"
    const description =
      props.description ??
      "Whether you're taking your first steps in faith or have been walking with Jesus for decades, we have pathways designed to help you grow, connect, and serve."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Small Groups",
            description:
              "Meet weekly in homes across the Portland metro area. Share life, study scripture, and build lasting friendships with 8-12 people.",
            cta: "Find a group",
            imageAlt:
              "Young adults laughing together during a small group Bible study in a cozy living room",
          },
          {
            title: "Kids & Youth",
            description:
              "Nursery through high school programs every Sunday. Safe, fun environments where young people discover faith at their level.",
            cta: "Learn more",
            imageAlt:
              "Children smiling and raising hands during a colorful Sunday school worship session",
          },
          {
            title: "Serve Together",
            description:
              "Join one of 40+ volunteer teams. From greeting guests to global missions, there's a place for your gifts to make a difference.",
            cta: "Explore teams",
            imageAlt:
              "Volunteers wearing matching t-shirts distributing food at a community outreach event",
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section className={cn("py-24 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-20 max-w-3xl">
            <h2 className="mb-6 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {items.map((item) => (
              <article key={item.title} className="group">
                <div className="mb-6 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  <Image
                    alt={item.imageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-3 text-xl font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <button
                  type="button"
                  onClick={() => go(item.cta)}
                  className="inline-flex items-center text-sm font-medium text-foreground hover:text-muted-foreground"
                >
                  {item.cta}
                  <ArrowRight className="ml-1 size-4" />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
