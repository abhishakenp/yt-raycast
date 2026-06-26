import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * DevToolFeatures — a 6-up product features grid for a developer tool / API
 * platform. A centered heading + intro paragraph above a responsive 1/2/3-column
 * grid of bordered cards, each with a tinted square icon tile, a title, a
 * description, and a "Learn more" chevron link. Icons rotate through a built-in
 * developer set (auth, database, real-time, serverless, edge, observability).
 * Every card link routes through useNavigate. Use to showcase platform
 * capabilities for developer tools, API platforms, backend-as-a-service, or
 * technical SaaS.
 */
export const DevToolFeatures = defineComponent({
  name: 'DevToolFeatures',
  description:
    "6-up product features grid for a developer tool / API platform: a centered heading + intro paragraph above a responsive 1/2/3-column grid of bordered cards, each with a tinted square icon tile, title, description, and a 'Learn more' chevron link. Built-in developer icon set (auth, database, real-time, serverless, edge, observability) rotates across cards. Card links route through useNavigate. Use to showcase platform capabilities for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    learnMore: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Everything you need to ship'
    const description =
      props.description ??
      'One platform for authentication, storage, real-time events, and serverless functions. No more stitching together multiple services.'
    const learnMore = props.learnMore ?? 'Learn more'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Authentication',
            description:
              'Complete auth with email, OAuth, SSO, and MFA. Support for React, Vue, Svelte, and native mobile SDKs.',
          },
          {
            title: 'Database & Storage',
            description:
              'Auto-scaling PostgreSQL with real-time subscriptions. Key-value store with sub-10ms latency. Object storage with CDN.',
          },
          {
            title: 'Real-time Events',
            description:
              'WebSocket-based pub/sub with 99.99% uptime. Broadcast to millions of connections instantly. Presence detection built-in.',
          },
          {
            title: 'Serverless Functions',
            description:
              'Deploy functions in Node.js, Python, Go, or Rust. Cold starts under 50ms. Automatic scaling from zero to thousands.',
          },
          {
            title: 'Edge Functions',
            description:
              'Run code at 250+ edge locations worldwide. Cache at the edge. Geolocation, bot detection, and A/B testing utilities.',
          },
          {
            title: 'Observability',
            description:
              'Built-in logging, metrics, and tracing. Custom dashboards. Alerts via Slack, PagerDuty, or webhook. 30-day retention.',
          },
        ]

    const ChevronRight = () => (
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
        <polyline points="9 5 16 12 9 19" />
      </svg>
    )

    const featureIcons: ReactNode[] = [
      <svg
        key="auth"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        <line x1="12" y1="15" x2="12" y2="17" />
      </svg>,
      <svg
        key="db"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      </svg>,
      <svg
        key="rt"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="fn"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.5A4.5 4.5 0 0 1 17 18H7z" />
      </svg>,
      <svg
        key="edge"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <polyline points="14 3 14 8 19 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>,
      <svg
        key="obs"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="18" y1="20" x2="18" y2="10" />
      </svg>,
    ]

    return (
      <section
        className={cn('py-20 lg:py-28', props.className)}
        aria-labelledby="features-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="features-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <article
                key={item.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="mb-4 grid size-12 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <button
                  type="button"
                  onClick={() => go(item.title)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  {learnMore}
                  <ChevronRight />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
