import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * JobBoardJobs — a featured-jobs listings feed for a job-board / careers site. A
 * header row pairing a heading + description with a "view all" arrow link, a row
 * of pill filter chips (first active), then a vertical stack of rich job cards —
 * each with a company logo thumbnail, role title, optional New/Featured badge,
 * company + location line, skill/salary tag pills, a clamped description, a
 * posted-date and an Apply button — closing with a centered "load more" button.
 * Filters, view-all, apply and load-more route through useNavigate. Use as the
 * primary listings feed on job boards, hiring marketplaces or talent networks.
 * Renders fully with no props.
 */
export const JobBoardJobs = defineComponent({
  name: "JobBoardJobs",
  description:
    "Featured-jobs listings feed for a job-board / careers site: a header row pairing a heading + description with a 'view all' arrow link, a row of pill filter chips (first active), then a vertical stack of rich job cards — each with a company logo thumbnail, role title, optional New/Featured badge, company + location line, skill/salary tag pills, a clamped description, a posted-date and an Apply button — closing with a centered 'load more' button. Filters, view-all, apply and load-more route through useNavigate. Use as the primary listings feed on job boards, hiring marketplaces or talent networks.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** "View all" arrow link label. */
    viewAll: z.string().optional(),
    /** Pill filter chip labels (first renders active). */
    filters: z.array(z.string()).optional(),
    /** Bottom "load more" button label. */
    loadMore: z.string().optional(),
    /** Per-card Apply button label. */
    applyLabel: z.string().optional(),
    /** Job cards. */
    items: z
      .array(
        z.object({
          role: z.string(),
          company: z.string(),
          logoAlt: z.string(),
          tags: z.array(z.string()),
          description: z.string(),
          posted: z.string(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Featured jobs"
    const description =
      props.description ?? "Hand-picked opportunities from top companies"
    const viewAll = props.viewAll ?? "View all 12,483 jobs"
    const loadMore = props.loadMore ?? "Load more jobs"
    const applyLabel = props.applyLabel ?? "Apply Now"
    const filters = props.filters?.length
      ? props.filters
      : ["All Jobs", "Remote", "Engineering", "Design", "Full-time", "Contract"]
    const items = props.items?.length
      ? props.items
      : [
          {
            role: "Senior Frontend Engineer",
            company: "Stripe — San Francisco, CA or Remote",
            logoAlt: "Stripe company logo mark",
            tags: ["React", "TypeScript", "Remote", "$140k–$190k"],
            description:
              "Join our payments platform team building the future of internet commerce. Work on high-scale systems processing billions in transactions annually.",
            posted: "2 days ago",
            badge: "New",
          },
          {
            role: "Product Designer",
            company: "Notion — New York, NY (Hybrid)",
            logoAlt: "Notion productivity app logo mark",
            tags: ["Figma", "Design Systems", "Hybrid", "$120k–$160k"],
            description:
              "Shape the future of connected workspaces. Design intuitive features that help millions of users organize their work and lives.",
            posted: "4 days ago",
          },
          {
            role: "Engineering Manager",
            company: "Figma — San Francisco, CA or Remote",
            logoAlt: "Figma collaborative design tool logo mark",
            tags: ["Leadership", "TypeScript", "Remote", "$180k–$240k"],
            description:
              "Lead a team of 8-10 engineers building the multiplayer editing experience. Drive technical strategy and mentorship.",
            posted: "1 week ago",
          },
          {
            role: "Senior Backend Engineer",
            company: "Shopify — Toronto, ON or Remote",
            logoAlt: "Shopify e-commerce platform logo mark",
            tags: ["Ruby on Rails", "MySQL", "Remote", "$130k–$175k"],
            description:
              "Build commerce infrastructure used by millions of merchants worldwide. Scale systems handling peak loads during Black Friday and flash sales.",
            posted: "3 days ago",
            badge: "Featured",
          },
          {
            role: "Full Stack Developer",
            company: "Linear — Remote (Global)",
            logoAlt: "Linear project management tool logo mark",
            tags: ["React", "GraphQL", "Remote", "$150k–$200k"],
            description:
              "Help build the future of issue tracking and project management. Work across the stack to deliver fast, keyboard-first experiences.",
            posted: "5 days ago",
          },
          {
            role: "Developer Relations Engineer",
            company: "Vercel — Remote (US)",
            logoAlt: "Vercel deployment platform logo mark",
            tags: ["Next.js", "Community", "Remote", "$110k–$150k"],
            description:
              "Educate and inspire developers building on the Next.js ecosystem. Create content, speak at events, and build meaningful community connections.",
            posted: "1 week ago",
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <section className={cn("bg-background py-20", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
                {heading}
              </h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center gap-2 font-medium text-foreground hover:underline"
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {filters.map((filter, i) => (
              <button
                key={filter}
                type="button"
                onClick={() => go(filter)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {items.map((job) => (
              <article
                key={job.role}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/30 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <Image
                    alt={job.logoAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <h3 className="text-lg font-semibold text-card-foreground transition-colors group-hover:text-foreground/70">
                        {job.role}
                      </h3>
                      {job.badge ? (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            job.badge === "New"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {job.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mb-3 text-muted-foreground">{job.company}</p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {job.description}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-row items-center gap-3 sm:mt-0 sm:flex-col sm:items-end sm:gap-2">
                    <span className="text-sm text-muted-foreground">
                      {job.posted}
                    </span>
                    <button
                      type="button"
                      onClick={() => go(`${applyLabel}: ${job.role}`)}
                      className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      {applyLabel}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => go(loadMore)}
              className="rounded-xl border border-input px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
            >
              {loadMore}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
