import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * ChurchEvents — featured-events grid for a church or faith-community site. A
 * responsive 6-card grid (2-col tablet, 3-col desktop) with header row (eyebrow +
 * heading + "View all" CTA), and event cards that each show a date badge, time,
 * title, description, and a CTA with arrow. Images lazily load and scale on hover.
 * All CTAs route through useNavigate. Use for upcoming events, classes, workshops,
 * baptisms, or outreach drives on church, ministry, or community organization pages.
 * Renders fully with no props via baked-in defaults.
 */
export const ChurchEvents = defineComponent({
  name: "ChurchEvents",
  description:
    "Featured-events grid for a church or faith-community site: a responsive 6-card grid with header row (eyebrow + heading + 'View all' CTA) and event cards that each show a date badge, time, title, description, and a CTA with arrow. Images lazily load and scale on hover. All CTAs route through useNavigate. Use for upcoming events, classes, workshops, baptisms, or outreach drives on church, ministry, or community organization pages.",
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Label for the top-right 'View all' link. */
    viewAll: z.string().optional(),
    /** Event cards; each has date, time, title, description, CTA label, and image alt. */
    items: z
      .array(
        z.object({
          date: z.string(),
          time: z.string(),
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
    const eyebrow = props.eyebrow ?? "Coming Up"
    const heading = props.heading ?? "Featured Events"
    const viewAll = props.viewAll ?? "View all events"
    const items = props.items?.length
      ? props.items
      : [
          {
            date: "June 15, 2025",
            time: "2:00 PM",
            title: "Summer Baptism Celebration",
            description:
              "Join us at Sellwood Riverfront Park as we celebrate new life in Christ. Picnic and fellowship to follow.",
            cta: "Register free",
            imageAlt:
              "Outdoor summer baptism celebration at a lake with people gathered on the shore",
          },
          {
            date: "June 22, 2025",
            time: "6:00 PM",
            title: "Parenting Teens Workshop",
            description:
              "A three-hour interactive seminar with licensed counselor Sarah Mitchell. Childcare provided.",
            cta: "$15 per family",
            imageAlt:
              "Parents and teenagers having discussion in a circle at a youth group meeting",
          },
          {
            date: "July 5, 2025",
            time: "8:00 AM",
            title: "CityServe Food Drive",
            description:
              "Our quarterly citywide service day. Help distribute 5,000 meals to families in need across Portland.",
            cta: "Sign up to serve",
            imageAlt:
              "Volunteers packing boxes of food donations at a community food bank",
          },
          {
            date: "July 18-19, 2025",
            time: "Evening sessions",
            title: "Worship Nights Conference",
            description:
              "Two nights of extended worship with special guests Phil Wickham and Charity Gayle. Free admission.",
            cta: "Reserve seats",
            imageAlt:
              "Worship band performing on stage with warm stage lighting and raised hands in the audience",
          },
          {
            date: "August 9, 2025",
            time: "11:00 AM",
            title: "Men's BBQ & Fellowship",
            description:
              "Annual men's gathering at Mount Tabor Park. Bring your own meat; sides and drinks provided.",
            cta: "RSVP required",
            imageAlt:
              "Fathers and children enjoying a picnic barbecue together on a sunny day",
          },
          {
            date: "September 8, 2025",
            time: "6:30 PM",
            title: "Bible Study Launch Night",
            description:
              "Fall semester small groups kickoff. Meet leaders, preview studies, and find your group for the season.",
            cta: "Learn more",
            imageAlt: "Woman reading Bible in morning light with coffee cup nearby",
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
          <div className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center text-sm font-medium text-foreground hover:text-muted-foreground"
            >
              {viewAll}
              <ArrowRight className="ml-1 size-4" />
            </button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((ev) => (
              <button
                key={ev.title}
                type="button"
                onClick={() => go(ev.title)}
                className="group block w-full cursor-pointer text-left"
              >
                <div className="mb-5 aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                  <Image
                    alt={ev.imageAlt}
                    w={800}
                    h={500}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">
                    {ev.date}
                  </span>
                  <span>{ev.time}</span>
                </div>
                <h3 className="mb-2 text-xl font-medium text-foreground transition-colors group-hover:text-muted-foreground">
                  {ev.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {ev.description}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-foreground">
                  {ev.cta}
                  <ArrowRight className="ml-1 size-4" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
