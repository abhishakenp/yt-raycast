import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * NewsTopics — browse-by-topic / section nav grid for a news outlet. On a card
 * surface: a heading with a "View all" link on the right, then a responsive grid
 * of clickable topic tiles. Each tile is a square-ish photo card with a dark
 * gradient scrim over the image and an overlaid section name, a one-line blurb
 * and a story count at the bottom — World, Politics, Business, Tech, Culture,
 * Science, Health, Sports and the like. The view-all link and every topic tile
 * route through useNavigate. Use as a section-discovery band on a newspaper,
 * magazine or publication homepage to let readers jump into top sections.
 * Renders fully with no props via baked-in defaults.
 */
export const NewsTopics = defineComponent({
  name: "NewsTopics",
  description:
    "Browse-by-topic / section nav grid for a news outlet on a card surface: a heading with a 'View all' link on the right, then a responsive grid of clickable topic tiles. Each tile is a square-ish photo card with a dark gradient scrim and an overlaid section name, a short blurb and a story count at the bottom (World, Politics, Business, Tech, Culture, Science, Health, Sports). The view-all link and every tile route through useNavigate. Use as a section-discovery band on a newspaper, magazine or publication homepage so readers can jump straight into top sections.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** View-all link label. */
    viewAll: z.string().optional(),
    /** Topic tiles. */
    items: z
      .array(
        z.object({
          name: z.string(),
          blurb: z.string().optional(),
          count: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Browse by Topic"
    const viewAll = props.viewAll ?? "View all sections"
    const items = props.items?.length
      ? props.items
      : [
          {
            name: "World",
            blurb: "Global affairs, conflict and diplomacy",
            count: "1,247 stories",
            imageAlt: "World map with connected city points across continents",
          },
          {
            name: "Politics",
            blurb: "Campaigns, policy and the halls of power",
            count: "892 stories",
            imageAlt: "United States Capitol building dome in Washington DC",
          },
          {
            name: "Business",
            blurb: "Markets, deals and the global economy",
            count: "654 stories",
            imageAlt:
              "Business analytics dashboard with financial charts and graphs",
          },
          {
            name: "Technology",
            blurb: "Innovation, AI and the platforms shaping life",
            count: "1,532 stories",
            imageAlt: "Computer circuit board with glowing processor chip",
          },
          {
            name: "Culture",
            blurb: "Film, music, books and the arts",
            count: "421 stories",
            imageAlt:
              "Movie theater with red velvet seats and classic cinema interior",
          },
          {
            name: "Science",
            blurb: "Discovery, research and the natural world",
            count: "378 stories",
            imageAlt:
              "Scientific laboratory with researcher examining microscope samples",
          },
          {
            name: "Health",
            blurb: "Medicine, wellbeing and public health",
            count: "536 stories",
            imageAlt:
              "Doctor reviewing patient charts in a bright modern clinic",
          },
          {
            name: "Sports",
            blurb: "Scores, transfers and the big games",
            count: "987 stories",
            imageAlt:
              "Floodlit stadium packed with fans during an evening match",
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    )

    return (
      <section className={cn("bg-card py-12 lg:py-16", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground lg:text-2xl">
              {heading}
            </h2>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((topic) => (
              <button
                key={topic.name}
                type="button"
                onClick={() => go(topic.name)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted text-left"
              >
                <Image
                  alt={topic.imageAlt}
                  w={300}
                  h={225}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-sm font-semibold text-background lg:text-base">
                    {topic.name}
                  </h3>
                  {topic.blurb ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-background/80">
                      {topic.blurb}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs font-medium text-background/70">
                    {topic.count}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
