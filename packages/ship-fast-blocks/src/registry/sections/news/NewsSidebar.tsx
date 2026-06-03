import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * NewsSidebar — content discovery sidebar for a news / editorial homepage. A
 * vertical stack of cards: a "Trending Now" numbered ranked list (big index
 * numbers + headline + read count), a "Most Discussed" list with comment counts,
 * a dark inverted-surface newsletter / Daily Briefing email signup (title,
 * description, email field, subscribe button and a fine-print note), a "Popular
 * Topics" tag-cloud of pill chips, and a "Writer Spotlight" author card (avatar,
 * name, role, bio and a profile link). Every headline, topic, the form submit and
 * the profile link route through useNavigate. Use as the right-hand companion
 * column beside the latest-stories feed. Renders fully with no props via baked-in
 * defaults.
 */
export const NewsSidebar = defineComponent({
  name: "NewsSidebar",
  description:
    "Content discovery sidebar for a news / editorial homepage: a vertical stack of cards — a 'Trending Now' numbered ranked list (big index numbers + headline + read count), a 'Most Discussed' list with comment counts, a dark inverted-surface newsletter / Daily Briefing email signup (title, description, email field, subscribe button, fine-print note), a 'Popular Topics' tag-cloud of pill chips, and a 'Writer Spotlight' author card (avatar, name, role, bio, profile link). Headlines, topics, the form submit and the profile link route through useNavigate. Use as the right-hand companion column beside a latest-stories feed on a publication homepage.",
  props: z.object({
    /** Trending list heading. */
    trendingHeading: z.string().optional(),
    /** Trending ranked items. */
    trending: z
      .array(z.object({ title: z.string(), reads: z.string() }))
      .optional(),
    /** Most-discussed list heading. */
    discussedHeading: z.string().optional(),
    /** Most-discussed items with comment counts. */
    discussed: z
      .array(z.object({ title: z.string(), comments: z.string() }))
      .optional(),
    /** Newsletter card title. */
    newsletterTitle: z.string().optional(),
    /** Newsletter card description. */
    newsletterDesc: z.string().optional(),
    /** Newsletter subscribe button label. */
    newsletterCta: z.string().optional(),
    /** Newsletter fine-print note. */
    newsletterNote: z.string().optional(),
    /** Popular topics heading. */
    topicsHeading: z.string().optional(),
    /** Popular topic tag labels. */
    topics: z.array(z.string()).optional(),
    /** Writer spotlight heading. */
    writerHeading: z.string().optional(),
    /** Spotlighted writer name. */
    writerName: z.string().optional(),
    /** Spotlighted writer role. */
    writerRole: z.string().optional(),
    /** Spotlighted writer bio. */
    writerBio: z.string().optional(),
    /** Writer profile link label. */
    writerCta: z.string().optional(),
    /** Writer avatar alt (drives the image search). */
    writerAvatarAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const trendingHeading = props.trendingHeading ?? "Trending Now"
    const trending = props.trending?.length
      ? props.trending
      : [
          {
            title:
              "Russia-Ukraine Peace Talks Resume in Geneva After Months of Silence",
            reads: "24.5K reads",
          },
          {
            title:
              "Tesla Cybertruck Deliveries Begin as Waitlist Reaches 2 Million",
            reads: "18.2K reads",
          },
          {
            title: "Taylor Swift Announces Surprise Album Release for Next Month",
            reads: "15.8K reads",
          },
          {
            title: "Manchester United Confirm New Manager Appointment",
            reads: "12.4K reads",
          },
          {
            title: "Bitcoin Breaks $75,000 as ETF Inflows Reach Record Highs",
            reads: "9.7K reads",
          },
        ]

    const discussedHeading = props.discussedHeading ?? "Most Discussed"
    const discussed = props.discussed?.length
      ? props.discussed
      : [
          {
            title:
              "Should Remote Workers Be Paid Based on Location? Silicon Valley Debates",
            comments: "847 comments",
          },
          {
            title: "The End of Free Returns? Retailers Rethink Generous Policies",
            comments: "623 comments",
          },
          {
            title: "University Admissions: Is the SAT Making a Comeback?",
            comments: "512 comments",
          },
        ]

    const newsletterTitle = props.newsletterTitle ?? "The Daily Briefing"
    const newsletterDesc =
      props.newsletterDesc ??
      "Essential news, expert analysis, and exclusive features delivered to your inbox every morning."
    const newsletterCta = props.newsletterCta ?? "Subscribe Free"
    const newsletterNote =
      props.newsletterNote ??
      "Join 145,000+ subscribers. No spam, unsubscribe anytime."

    const topicsHeading = props.topicsHeading ?? "Popular Topics"
    const topics = props.topics?.length
      ? props.topics
      : [
          "Artificial Intelligence",
          "Climate Change",
          "2026 Elections",
          "Gaza Conflict",
          "CEOs Under Pressure",
          "Streaming Wars",
          "Space Exploration",
          "Mental Health",
        ]

    const writerHeading = props.writerHeading ?? "Writer Spotlight"
    const writerName = props.writerName ?? "Maria Santos"
    const writerRole = props.writerRole ?? "Foreign Correspondent"
    const writerBio =
      props.writerBio ??
      "Reporting from conflict zones for 15 years. Recent coverage includes Gaza, Ukraine, and Sudan."
    const writerCta = props.writerCta ?? "View profile"
    const writerAvatarAlt =
      props.writerAvatarAlt ??
      "Professional headshot of journalist Maria Santos, smiling in professional attire"

    const CommentIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )

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
      <aside className={cn("space-y-8", props.className)}>
        {/* Trending */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-5 text-destructive"
              aria-hidden="true"
            >
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {trendingHeading}
          </h3>
          <div className="space-y-5">
            {trending.map((item, i) => (
              <button
                key={item.title}
                type="button"
                onClick={() => go(item.title)}
                className="group flex w-full gap-4 text-left"
              >
                <span className="text-2xl font-bold text-muted-foreground/40 transition-colors group-hover:text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
                    {item.title}
                  </h4>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {item.reads}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Most discussed */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
            <CommentIcon className="size-5 text-primary" />
            {discussedHeading}
          </h3>
          <div className="space-y-4">
            {discussed.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => go(item.title)}
                className="group block w-full border-b border-border pb-4 text-left last:border-0 last:pb-0"
              >
                <h4 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
                  {item.title}
                </h4>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CommentIcon className="size-4" />
                    {item.comments}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="rounded-xl bg-foreground p-6 text-background">
          <h3 className="mb-2 text-lg font-bold">{newsletterTitle}</h3>
          <p className="mb-4 text-sm text-background/70">{newsletterDesc}</p>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              go(newsletterCta)
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              aria-label="Email address"
              className="w-full rounded-lg border border-border/40 bg-background/10 px-4 py-2.5 text-sm text-background placeholder-background/50 focus:border-background/60 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-background px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {newsletterCta}
            </button>
          </form>
          <p className="mt-3 text-xs text-background/50">{newsletterNote}</p>
        </div>

        {/* Topics */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-foreground">
            {topicsHeading}
          </h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => go(topic)}
                className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Writer spotlight */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-foreground">
            {writerHeading}
          </h3>
          <div className="flex items-start gap-4">
            <Image
              alt={writerAvatarAlt}
              w={100}
              h={100}
              className="size-14 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-foreground">{writerName}</h4>
              <p className="text-sm text-muted-foreground">{writerRole}</p>
              <p className="mt-2 text-sm text-muted-foreground">{writerBio}</p>
              <button
                type="button"
                onClick={() => go(writerCta)}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
              >
                {writerCta}
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    )
  },
})
