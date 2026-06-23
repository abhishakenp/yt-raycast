import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * LinkInBioFeatures — the core link hub of a Linktree / Bento style link-in-bio
 * page: a centered narrow column holding a vertical stack of big, bold,
 * full-width tappable link buttons. An optional small uppercase eyebrow ("My
 * Links") sits above the stack. Each button is large and chunky — a leading
 * rounded icon tile tinted in the brand/primary color, a prominent title plus a
 * supporting subtitle, and a trailing open-link arrow chevron, or a small pill
 * badge (e.g. "New") when set. Every button routes through useNavigate. This is
 * the centerpiece / main call-to-action area of a creator, influencer, or
 * personal "all my links in one place" landing page. Renders fully with no
 * props.
 */
export const LinkInBioFeatures = defineComponent({
  name: "LinkInBioFeatures",
  description:
    "Core LINK HUB of a Linktree / Bento style LINK-IN-BIO page — a centered narrow column with a vertical stack of BIG, bold, full-width tappable link buttons (the whole point of the page). An optional small uppercase eyebrow ('My Links') sits on top. Each large link button has a leading rounded icon tile tinted in the primary/brand color (globe | shop | mail | calendar | music | video), a prominent title + supporting subtitle, and a trailing open-link arrow chevron, or a small pill badge (e.g. 'New') when set. Every button routes through useNavigate. Use as the centerpiece / primary call-to-action area of a creator, influencer, musician, or personal 'all my links in one place' landing page, bio-link hub, or social-profile splash. Supply content only — the eyebrow and the links list; the section owns all layout and styling.",
  props: z.object({
    /** Small uppercase label above the link stack (e.g. "My Links"). */
    eyebrow: z.string().optional(),
    /** The stacked link buttons — the core of the page. */
    links: z
      .array(
        z.object({
          /** Icon key: globe | shop | mail | calendar | music | video. */
          icon: z.enum(["globe", "shop", "mail", "calendar", "music", "video"]),
          title: z.string(),
          subtitle: z.string(),
          /** Optional pill (e.g. "New") shown instead of the trailing arrow. */
          badge: z.string().optional(),
        }),
      )
      .optional(),
    /** Routing keys for each link button (falls back to each link title). */
    linkTargets: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()

    const eyebrow = props.eyebrow ?? "My Links"

    const links = props.links?.length
      ? props.links
      : [
          {
            icon: "globe" as const,
            title: "Portfolio",
            subtitle: "See my latest work",
          },
          {
            icon: "shop" as const,
            title: "Latest Drop",
            subtitle: "Shop the new collection",
            badge: "New",
          },
          {
            icon: "mail" as const,
            title: "Newsletter",
            subtitle: "Weekly notes to your inbox",
          },
          {
            icon: "calendar" as const,
            title: "Book a Call",
            subtitle: "30 min — let's chat",
          },
          {
            icon: "music" as const,
            title: "Listen on Spotify",
            subtitle: "New single out now",
          },
          {
            icon: "video" as const,
            title: "Watch on YouTube",
            subtitle: "Behind the scenes",
          },
        ]

    const linkTargets = props.linkTargets?.length
      ? props.linkTargets
      : [
          "Portfolio",
          "Latest Drop",
          "Newsletter",
          "Book a Call",
          "Listen on Spotify",
          "Watch on YouTube",
        ]

    const linkIcons: Record<string, ReactNode> = {
      globe: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      shop: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      mail: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      calendar: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      music: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      video: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 9l5 3-5 3V9z" />
          <path d="M2 12a10 10 0 0110-10 10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12z" />
        </svg>
      ),
    }

    const ExternalArrow = () => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    )

    return (
      <section
        className={cn("mx-auto w-full max-w-md px-6 py-10", props.className)}
      >
        {eyebrow ? (
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}

        <nav aria-label="Links" className="space-y-4">
          {links.map((link, i) => (
            <button
              key={link.title}
              type="button"
              onClick={() => go(linkTargets[i] ?? link.title)}
              className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                {linkIcons[link.icon]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-foreground">
                  {link.title}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {link.subtitle}
                </span>
              </span>
              {link.badge ? (
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  {link.badge}
                </span>
              ) : (
                <span className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
                  <ExternalArrow />
                </span>
              )}
            </button>
          ))}
        </nav>
      </section>
    )
  },
})
