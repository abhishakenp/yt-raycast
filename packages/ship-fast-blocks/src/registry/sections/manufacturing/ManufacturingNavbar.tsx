import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * ManufacturingNavbar — sticky, translucent top navigation bar for a precision-
 * manufacturing / industrial-fabrication B2B site. A backdrop-blurred, border-
 * bottomed header pinned to the top: an initials brand tile (filled foreground
 * square with two-letter mark) plus wordmark on the left, a horizontal set of
 * nav links in the center, and a solid foreground primary CTA on the right
 * (desktop), with a hamburger menu button on mobile. Every link and the CTA
 * route through useNavigate so labels can drive page-switching; the CTA uses the
 * last nav item. Clean, neutral, industrial. Use as the sticky site header for
 * CNC machine shops, metal fabricators, contract manufacturers or industrial
 * engineering firms. Renders fully with no props via baked-in "Vertex
 * Manufacturing" defaults.
 */
export const ManufacturingNavbar = defineCapsule({
  name: 'ManufacturingNavbar',
  description:
    'Sticky translucent top navigation bar for a precision-manufacturing / industrial-fabrication B2B site: backdrop-blurred, border-bottomed header pinned to the top with an initials brand tile plus wordmark on the left, horizontal nav links in the center, and a solid foreground primary CTA on the right (desktop), plus a hamburger menu on mobile. Links and CTA route through useNavigate for page-switching; the CTA uses the last nav item. Clean, neutral and industrial. Use as the sticky site header for CNC machine shops, metal fabricators, contract manufacturers or industrial engineering firms.',
  props: z.object({
    /** Brand / company name shown in the navbar; initials tile derives from it. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching); last item is the CTA. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Vertex Manufacturing'
    const nav = props.nav?.length
      ? props.nav
      : [
          'Capabilities',
          'Industries',
          'Process',
          'Work',
          'Clients',
          'Get a Quote',
        ]

    const brandInitials = brand
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('')

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav
          aria-label="Main navigation"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
              aria-label={`${brand} Home`}
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-md bg-foreground text-sm font-bold text-background"
              >
                {brandInitials}
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {brand}
              </span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                {nav[nav.length - 1]}
              </button>
            </div>
            <MobileNavDrawer
              brand={brand}
              nav={nav}
              homeTarget={nav[0]}
              cta={{ label: nav[nav.length - 1], target: nav[nav.length - 1] }}
              buttonClassName="p-2 text-muted-foreground md:hidden"
            />
          </div>
        </nav>
      </header>
    )
  },
})
