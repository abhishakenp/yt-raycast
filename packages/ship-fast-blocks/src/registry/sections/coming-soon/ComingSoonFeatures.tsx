import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * ComingSoonFeatures — product capabilities grid for a "launching soon" / waitlist
 * pre-launch landing page. A centered heading and lead paragraph above a responsive
 * 1/2/3-column grid of bordered card panels; each card has a tinted icon tile
 * (rotating through six inline line-icons), a title, and a description. Use to
 * present product features, platform capabilities, or "what's included" on SaaS
 * waitlists, app pre-launch pages, or beta sign-up landers. Renders fully with
 * no props via six baked-in default features.
 */
export const ComingSoonFeatures = defineComponent({
  name: 'ComingSoonFeatures',
  description:
    "Product capabilities grid for a 'launching soon' / waitlist pre-launch landing page: centered heading and lead paragraph above a responsive 1/2/3-column grid of bordered card panels, each with a tinted icon tile (rotating through six inline line-icons), a title and a description. Use to present product features, platform capabilities, or 'what\'s included' on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
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
    const heading = props.heading ?? 'Everything you need'
    const description =
      props.description ??
      'Built for modern teams who value clarity, speed, and thoughtful design.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Real-time Sync',
            description:
              'Changes appear instantly across all devices. No refresh needed, no version conflicts.',
          },
          {
            title: 'Enterprise Security',
            description:
              'SOC 2 Type II certified with end-to-end encryption. Your data stays yours.',
          },
          {
            title: 'Smart Boards',
            description:
              'Visual canvases that connect to your data. Drag, drop, and watch ideas come alive.',
          },
          {
            title: 'Contextual Chat',
            description:
              'Discuss work where it happens. Comments, DMs, and channels unified in one stream.',
          },
          {
            title: 'Living Documents',
            description:
              'Docs that stay current. Embed data, automate updates, track changes effortlessly.',
          },
          {
            title: 'Workflow Automations',
            description:
              'Build custom workflows without code. Connect 100+ apps and automate the routine.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="bolt"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>,
      <svg
        key="lock"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>,
      <svg
        key="boards"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>,
      <svg
        key="chat"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
        />
      </svg>,
      <svg
        key="document"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>,
      <svg
        key="automations"
        className="size-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>,
    ]

    return (
      <section
        className={cn(
          'w-full px-4 py-24 sm:px-6 sm:py-32 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-xl font-light text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-8 shadow-sm"
              >
                <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-medium text-card-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
