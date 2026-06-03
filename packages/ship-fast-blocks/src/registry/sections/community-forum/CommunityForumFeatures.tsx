import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * CommunityForumFeatures — capabilities grid for a community-platform / discussion-forum
 * landing page. A centered section heading + description above a responsive 3-column grid
 * of rounded card tiles; each tile has a tinted inline SVG icon, a title, and a description.
 * Cards slightly lift on hover. No links — presentation only. Use as the feature section for
 * community platforms, forums, knowledge bases, or SaaS products showcasing organized topics,
 * search, permissions, real-time updates, insights, and rich text editing.
 */
export const CommunityForumFeatures = defineComponent({
  name: "CommunityForumFeatures",
  description:
    "Capabilities grid for a community-platform / discussion-forum landing page: a centered section heading and description above a responsive 3-column grid of rounded card tiles, each with a tinted inline SVG icon, a title, and a description; cards slightly lift on hover. No links — presentation only. Use as the feature section for community platforms, forums, knowledge bases, or SaaS products showcasing organized topics, search, permissions, real-time updates, insights, and rich text editing.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? "Everything you need for thriving discussions"
    const description =
      props.description ??
      "Purpose-built features that make community management effortless and conversations delightful."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Organized Topics",
            description:
              "Create unlimited categories and subcategories. Keep discussions structured so members can find exactly what they need without endless scrolling.",
          },
          {
            title: "Powerful Search",
            description:
              "Instant full-text search across all posts, comments, and member profiles. Find that specific conversation from months ago in seconds.",
          },
          {
            title: "Granular Permissions",
            description:
              "Control who can view, post, moderate, and manage. Create private spaces for premium members or open discussions for everyone.",
          },
          {
            title: "Real-time Updates",
            description:
              "See new posts and replies instantly without refreshing. Stay in the flow of conversation with live notifications and typing indicators.",
          },
          {
            title: "Community Insights",
            description:
              "Track engagement metrics, popular topics, member growth, and activity patterns. Make data-driven decisions to nurture your community.",
          },
          {
            title: "Rich Text Editor",
            description:
              "Compose beautiful posts with markdown support, code blocks, embeds, and file attachments. Express ideas clearly with formatting that just works.",
          },
        ]

    const featureIcons: ReactNode[] = [
      // organized topics — list/lines
      <svg key="topics" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>,
      // powerful search
      <svg key="search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>,
      // granular permissions — lock
      <svg key="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>,
      // real-time updates — bolt
      <svg key="bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // community insights — chart
      <svg key="chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // rich text editor — lines
      <svg key="editor" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6" aria-hidden="true">
        <path d="M10 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>,
    ]

    return (
      <section className={cn("py-24 lg:py-32", props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="group rounded-xl border border-border bg-card p-8 transition-colors hover:border-foreground/20"
              >
                <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-muted text-foreground/80">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
