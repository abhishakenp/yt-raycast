import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

const brandMark = (
  <svg
    className="size-8 text-primary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 3v18h18" />
    <rect x="7" y="11" width="3" height="6" rx="0.5" />
    <rect x="12" y="7" width="3" height="10" rx="0.5" />
    <rect x="17" y="4" width="3" height="13" rx="0.5" />
  </svg>
)

/**
 * AnalyticsNavbar — sharp, data-forward top navigation header for an analytics
 * product marketing site. Composes the shared SiteNav kit composite to render a
 * bar-chart brand mark, a crisp wordmark, a desktop link row (Product, Features,
 * Pricing, Docs), and a sticky filled-primary "Start Free" call to action with a
 * real mobile drawer. Every link and CTA routes through useNavigate. Use it as
 * the first band of any analytics, BI, dashboard, or data-product landing page
 * for a consistent, route-aware site header. Renders fully with no props.
 */
export const AnalyticsNavbar = defineComponent({
  name: 'AnalyticsNavbar',
  description:
    "Sharp, data-forward top navigation header for an analytics product marketing site, composing the shared SiteNav kit composite. Renders a bar-chart brand mark, a crisp wordmark, a desktop link row (Product, Features, Pricing, Docs), and a sticky filled-primary 'Start Free' call to action with a real mobile drawer. Every link and CTA routes through useNavigate. Use it as the first band of any analytics, BI, dashboard, or data-product landing page for a consistent, route-aware site header.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    homeTarget: z.string().optional(),
    sticky: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Pulse Analytics'
    const nav = props.nav?.length
      ? props.nav
      : ['Product', 'Features', 'Pricing', 'Docs']
    const ctaLabel = props.ctaLabel ?? 'Start Free'
    const ctaTarget = props.ctaTarget ?? 'Pricing'

    return (
      <SiteNav
        brand={brand}
        brandMark={brandMark}
        brandClassName="font-semibold tracking-tight"
        nav={nav}
        phone={props.phone}
        cta={{ label: ctaLabel, target: ctaTarget, variant: 'primary' }}
        homeTarget={props.homeTarget ?? nav[0]}
        sticky={props.sticky ?? true}
        className={props.className}
      />
    )
  },
})
