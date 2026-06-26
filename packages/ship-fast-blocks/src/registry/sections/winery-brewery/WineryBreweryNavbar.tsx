import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * WineryBreweryNavbar — sticky site header for a winery, vineyard estate, or
 * craft brewery / taproom. Thin configuration over the shared `SiteNav`
 * composite: a serif wordmark beside an inline grape-cluster mark, centered nav
 * links on desktop, a tasting-room phone number, a "Plan a Visit" CTA, and a
 * real mobile drawer (Sheet) on small screens. Use as the header for wineries,
 * cellar doors, vineyards, breweries, taprooms, cideries, or any rustic-premium
 * drinks brand where bookings and visits matter. Renders fully with no props.
 */
const GrapeClusterMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 4c1.2 0 2-1 2-2" />
    <path d="M12 7v0" />
    <circle cx="12" cy="9" r="2.1" />
    <circle cx="8.4" cy="12" r="2.1" />
    <circle cx="15.6" cy="12" r="2.1" />
    <circle cx="10.2" cy="15.4" r="2.1" />
    <circle cx="13.8" cy="15.4" r="2.1" />
    <circle cx="12" cy="19" r="2.1" />
  </svg>
)

export const WineryBreweryNavbar = defineComponent({
  name: 'WineryBreweryNavbar',
  description:
    "Sticky winery / brewery site header (vineyard estate or craft taproom) built on the shared SiteNav composite: serif wordmark + inline grape-cluster mark, centered desktop nav links, a tasting-room phone number, a 'Plan a Visit' CTA, and a real mobile drawer. Use as the header for wineries, cellar doors, vineyards, breweries, taprooms, cideries, or any rustic-premium drinks brand where bookings and visits matter.",
  props: z.object({
    /** Winery / brewery brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Tasting-room phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Wines', 'Visit', 'Events', 'Gallery', 'Contact']
    return (
      <SiteNav
        brand={props.brand ?? 'Cellar & Cask'}
        brandMark={<GrapeClusterMark className="size-8 text-primary" />}
        brandClassName="font-serif text-xl font-medium"
        nav={nav}
        phone={props.phone ?? '(707) 555-0148'}
        cta={{
          label: props.ctaLabel ?? 'Plan a Visit',
          target: props.ctaTarget ?? 'Visit',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
