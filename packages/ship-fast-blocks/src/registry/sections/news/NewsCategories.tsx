import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * NewsCategories — browse-by-category image-tile grid for a news / editorial
 * homepage. On a card surface: a heading with a "View all" link on the right,
 * then a responsive grid of square-ish photo tiles, each with a dark gradient
 * scrim over the image and an overlaid category name + story count at the bottom.
 * The view-all link and every tile route through useNavigate. Use as a section
 * discovery band on a newspaper, magazine or publication homepage to let readers
 * jump into top sections. Renders fully with no props via baked-in defaults.
 */
export const NewsCategories = defineComponent({
  name: "NewsCategories",
  description:
    "Browse-by-category image-tile grid for a news / editorial homepage on a card surface: a heading with a 'View all' link on the right, then a responsive grid of square-ish photo tiles each with a dark gradient scrim and an overlaid category name + story count at the bottom. The view-all link and tiles route through useNavigate. Use as a section-discovery band on a newspaper, magazine or publication homepage to let readers jump into top sections.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** View-all link label. */
    viewAll: z.string().optional(),
    /** Category tiles. */
    items: z
      .array(
        z.object({
          name: z.string(),
          count: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Browse by Category"
    const viewAll = props.viewAll ?? "View all"
    const items = props.items?.length
      ? props.items
      : [
          {
            name: "News",
            count: "1,247 stories",
            imageAlt: "News desk with journalists working in modern newsroom",
          },
          {
            name: "Politics",
            count: "892 stories",
            imageAlt: "United States Capitol building dome in Washington DC",
          },
          {
            name: "Business",
            count: "654 stories",
            imageAlt:
              "Business analytics dashboard with financial charts and graphs",
          },
          {
            name: "Technology",
            count: "1,532 stories",
            imageAlt: "Computer circuit board with glowing processor chip",
          },
          {
            name: "Culture",
            count: "421 stories",
            imageAlt:
              "Movie theater with red velvet seats and classic cinema interior",
          },
          {
            name: "Science",
            count: "378 stories",
            imageAlt:
              "Scientific laboratory with researcher examining microscope samples",
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

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {items.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => go(cat.name)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted"
              >
                <Image
                  alt={cat.imageAlt}
                  w={300}
                  h={225}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                  <h3 className="text-sm font-semibold text-background lg:text-base">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-background/80">
                    {cat.count}
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
