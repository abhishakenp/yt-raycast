import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * NoCodeTemplates — filterable templates GALLERY on a bright canvas. A centered
 * header (eyebrow, heading, paragraph) sits above a row of pill filter chips
 * (first active), then a 1-to-3 column grid of 4:3 thumbnail cards with
 * hover-zoom images and a gradient overlay that reveals a tinted category tag,
 * title, and description on hover, finished by a "view all" text link with
 * arrow. Every chip, card, and link route through useNavigate. Use as the
 * template marketplace / gallery section for a no-code builder or theme
 * marketplace. Renders fully with no props.
 */
export const NoCodeTemplates = defineComponent({
  name: 'NoCodeTemplates',
  description:
    "Filterable templates GALLERY on a bright canvas: a centered header (eyebrow, heading, paragraph) above a row of pill filter chips (first active), then a 1-to-3 column grid of 4:3 thumbnail cards with hover-zoom images and a gradient overlay revealing a tinted category tag, title, and description on hover, finished by a 'view all' text link with arrow. Chips, cards, and link route through useNavigate. Use as the template marketplace / gallery section for a no-code / website-builder product or theme marketplace.",
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Pill filter chip labels (first is shown active). */
    filters: z.array(z.string()).optional(),
    /** "View all" link label below the grid. */
    viewAll: z.string().optional(),
    /** Template cards. */
    items: z
      .array(
        z.object({
          title: z.string(),
          tag: z.string(),
          description: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Templates Gallery'
    const heading = props.heading ?? 'Start with a proven design'
    const description =
      props.description ??
      'Browse our collection of 200+ templates designed by industry experts. Each one is fully customizable and ready to make your own.'
    const filters = props.filters?.length
      ? props.filters
      : [
          'All Templates',
          'SaaS',
          'E-commerce',
          'Portfolio',
          'Blog',
          'Landing Page',
        ]
    const viewAll = props.viewAll ?? 'View all 200+ templates'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Analytics Dashboard',
            tag: 'SaaS',
            description: 'Perfect for data-driven apps',
            imageAlt: 'Modern SaaS dashboard template with analytics charts',
          },
          {
            title: 'Modern Shop',
            tag: 'E-commerce',
            description: 'Sell products with style',
            imageAlt: 'E-commerce store template with product grid',
          },
          {
            title: 'Creative Portfolio',
            tag: 'Portfolio',
            description: 'Showcase your best work',
            imageAlt: 'Creative portfolio template for designers',
          },
          {
            title: 'Minimal Blog',
            tag: 'Blog',
            description: 'Content-first design',
            imageAlt: 'Minimal blog template with clean typography',
          },
          {
            title: 'Startup Launch',
            tag: 'Landing Page',
            description: 'Convert visitors to users',
            imageAlt: 'Startup landing page template',
          },
          {
            title: 'Event Registration',
            tag: 'Events',
            description: 'Manage events seamlessly',
            imageAlt: 'Event registration template with calendar',
          },
        ]

    const tagTints = [
      'bg-chart-1 text-background',
      'bg-chart-2 text-background',
      'bg-chart-3 text-background',
      'bg-chart-4 text-background',
      'bg-primary text-primary-foreground',
      'bg-chart-5 text-background',
    ]

    const ArrowRight = ({ className }: { className?: string }) => (
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
        className={className}
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 5 21 12 14 19" />
      </svg>
    )

    return (
      <section
        className={cn('bg-background py-24', props.className)}
        aria-labelledby="nc-templates"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2
              id="nc-templates"
              className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">{description}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {filters.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => go(f)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    i === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((tpl, i) => (
              <button
                key={tpl.title}
                type="button"
                onClick={() => go(tpl.title)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-border text-left transition-all hover:shadow-xl"
              >
                <div className="aspect-[4/3] bg-muted">
                  <Image
                    alt={tpl.imageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 translate-y-4 p-6 text-background transition-transform group-hover:translate-y-0">
                  <span
                    className={cn(
                      'mb-2 inline-block rounded px-2 py-1 text-xs font-medium',
                      tagTints[i % tagTints.length],
                    )}
                  >
                    {tpl.tag}
                  </span>
                  <h3 className="text-lg font-semibold">{tpl.title}</h3>
                  <p className="text-sm text-background/80">
                    {tpl.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-muted-foreground"
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    )
  },
})
