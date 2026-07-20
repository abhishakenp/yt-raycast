import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * NoCodeTemplates — block-builder-kinetic templates GALLERY for a no-code /
 * app-builder SaaS landing page. An asymmetric header (mono eyebrow, a
 * left-aligned heading with a tilted primary marker block behind the key word,
 * mono meta right) sits above a row of rounded-full mono sticker filter chips
 * (first active on primary, gently rotated), then a 2/3-column grid of sharp,
 * chunky border-2 thumbnail cards with hover-zoom images and a gradient overlay
 * that reveals a tinted category sticker, title and description on hover; cards
 * lift on a hard offset shadow. A mono "view all" link with arrow closes the
 * section. Every chip, card, and link route through section-kit route links.
 * Use as the template marketplace / gallery section for a no-code /
 * website-builder product or theme marketplace. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { TemplateGrid, TemplateCard } from '#/section-kit/TemplateGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const NoCodeTemplates = defineCapsule({
  name: 'NoCodeTemplates',
  description:
    'Block-builder-kinetic templates GALLERY for a no-code / app-builder SaaS landing page: an asymmetric header (mono eyebrow, marker-highlighted heading left, mono meta right) above a row of rounded-full mono sticker filter chips (first active on primary), then a 2/3-column grid of sharp chunky border-2 thumbnail cards with hover-zoom images and a gradient overlay revealing a tinted category sticker, title and description on hover, closed by a mono view-all link with arrow. Chips, cards, and link route through section-kit route links. Use as the template marketplace / gallery section for a no-code / website-builder product or theme marketplace.',
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
    const chipRotations = [
      '-rotate-1',
      'rotate-1',
      '-rotate-2',
      'rotate-2',
      '-rotate-1',
      'rotate-1',
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
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
        aria-labelledby="nc-templates"
      >
        <Container>
          {/* Asymmetric header: mono eyebrow, marker heading left, mono meta right. */}
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-10">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 200+
                </span>
              </MonoTag>
              <h2
                id="nc-templates"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {(() => {
                  const words = heading.split(' ')
                  return (
                    <>
                      {words.slice(0, -1).join(' ')}{' '}
                      <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-[-0.15em] inset-y-[0.05em] rotate-1 bg-primary"
                        />
                        <span className="relative text-primary-foreground">
                          {words.at(-1) ?? ''}
                        </span>
                      </span>
                    </>
                  )
                })()}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ gallery ] fully editable
            </p>
          </div>

          {/* Sticker filter chips — rounded-full mono, first active, gently rotated. */}
          <div className="mb-10 flex flex-wrap gap-2.5">
            {filters.map((f, i) => (
              <NavbarRouteLink
                key={f}
                className={cn(
                  'rounded-full border font-mono text-[11px] uppercase tracking-[0.14em] transition-colors',
                  chipRotations[i % chipRotations.length],
                  'px-4 py-2',
                  i === 0
                    ? 'border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground',
                )}
                href={f}
              >
                {f}
              </NavbarRouteLink>
            ))}
          </div>

          <TemplateGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((tpl, i) => (
              <TemplateCard asChild key={tpl.title}>
                <NavbarRouteLink
                  className="group relative block w-full overflow-hidden rounded-none border-2 border-border text-left transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-[8px_8px_0_0] hover:shadow-foreground"
                  href={tpl.title}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 text-background transition-transform group-hover:translate-y-0">
                    <span
                      className={cn(
                        'mb-2 inline-block rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]',
                        tagTints[i % tagTints.length],
                      )}
                    >
                      {tpl.tag}
                    </span>
                    <h3 className="text-lg font-bold tracking-tight">
                      {tpl.title}
                    </h3>
                    <p className="text-sm text-background/80">
                      {tpl.description}
                    </p>
                  </div>
                </NavbarRouteLink>
              </TemplateCard>
            ))}
          </TemplateGrid>
          <div className="mt-12">
            <NavbarRouteLink
              className="inline-flex items-center gap-2 border-b-2 border-foreground pb-0.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-muted-foreground"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="size-4" />
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
