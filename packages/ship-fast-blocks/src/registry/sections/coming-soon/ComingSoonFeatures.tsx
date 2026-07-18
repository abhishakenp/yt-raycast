import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * ComingSoonFeatures — product capabilities grid for a "launching soon" / waitlist
 * pre-launch landing page. A centered heading and lead paragraph above a responsive
 * 1/2/3-column grid of bordered card panels; each card has a tinted icon tile
 * (rotating through six inline line-icons), a title, and a description. Use to
 * present product features, platform capabilities, or "what's included" on SaaS
 * waitlists, app pre-launch pages, or beta sign-up landers. Renders fully with
 * no props via six baked-in default features.
 */
export const ComingSoonFeatures = defineCapsule({
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

    return (
      <section
        className={cn(
          'w-full px-4 py-24 sm:px-6 lg:py-28 lg:px-8 xl:px-12',
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

          <FeatureGrid columns={3}>
            {items.map((f) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </div>
      </section>
    )
  },
})
