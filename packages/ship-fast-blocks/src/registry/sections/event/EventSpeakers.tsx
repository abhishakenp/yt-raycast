import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * EventSpeakers — a featured-speakers grid for a conference or event page. A muted
 * band with a heading + description on the left and a "view all" link (with arrow)
 * on the right, above a responsive 4-up grid of bordered speaker cards. Each card
 * shows a circular alt-driven headshot, name, role, and short bio, and routes
 * through useNavigate. Use to showcase keynote and session speakers on tech
 * conference, summit, meetup, or festival pages.
 */
export const EventSpeakers = defineComponent({
  name: "EventSpeakers",
  description:
    "Featured-speakers grid for a conference or event page: a muted band with a heading + description on the left and a 'view all' link (with arrow) on the right, above a responsive 4-up grid of bordered speaker cards. Each card shows a circular alt-driven headshot, the speaker name, role, and a short bio, and routes through useNavigate on click. Use to showcase keynote and session speakers on tech conference, summit, meetup, festival, or workshop pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description beneath the heading. */
    description: z.string().optional(),
    /** "View all" link label (top-right). */
    viewAll: z.string().optional(),
    /** Speaker cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Featured Speakers"
    const description =
      props.description ??
      "Learn from the engineers and designers shaping the future of web development."
    const viewAll = props.viewAll ?? "View full agenda"
    const items = props.items?.length
      ? props.items
      : [
          {
            name: "Sarah Chen",
            role: "Design Systems Lead",
            bio: 'Previously led design systems at Airbnb and Pinterest. Author of "Scaling Design Systems."',
          },
          {
            name: "Marcus Rodriguez",
            role: "Frontend Architect",
            bio: "Core contributor to React and Next.js. Previously engineering lead at Vercel.",
          },
          {
            name: "Emily Watson",
            role: "VP of Product Design",
            bio: "Leading design at Linear. Previously built design teams at Dropbox and Figma.",
          },
          {
            name: "David Park",
            role: "Staff Engineer",
            bio: "Web performance expert at Shopify. Created widely-adopted performance tooling.",
          },
          {
            name: "James Mitchell",
            role: "Design Engineering",
            bio: "Pioneering design-to-code workflows at Framer. Formerly at Apple Special Projects.",
          },
          {
            name: "Priya Sharma",
            role: "Accessibility Lead",
            bio: "Accessibility advocate at Microsoft. W3C contributor and conference keynote speaker.",
          },
          {
            name: "Alex Thompson",
            role: "Creative Developer",
            bio: "Award-winning creative technologist. Awwwards Site of the Day x12 recipient.",
          },
          {
            name: "Lisa Nakamura",
            role: "UX Research Director",
            bio: "Leading user research at Notion. Stanford HCI PhD, published researcher.",
          },
        ]

    const ArrowRight = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    return (
      <section className={cn("bg-muted py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {heading}
              </h2>
              <p className="max-w-xl text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-muted-foreground"
            >
              {viewAll}
              <ArrowRight />
            </button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((sp) => (
              <button
                key={sp.name}
                type="button"
                onClick={() => go(sp.name)}
                className="group rounded-2xl border border-border bg-card p-6 text-left transition-colors hover:border-primary/40"
              >
                <Image
                  alt={`Professional headshot portrait of ${sp.name}, ${sp.role}`}
                  w={200}
                  h={200}
                  className="mb-4 size-20 rounded-full object-cover"
                />
                <h3 className="font-semibold text-card-foreground">
                  {sp.name}
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">{sp.role}</p>
                <p className="text-sm text-muted-foreground">{sp.bio}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
