import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * FintechNavbar — sticky site header for a fintech / neobank / digital-banking
 * landing page. A thin configuration over the shared `SiteNav` composite: an
 * inline shield brand mark beside the product wordmark, a horizontal row of
 * nav links on desktop, a primary "Get Started" pill CTA on the right, and a
 * real mobile drawer (Sheet) on small screens. Every link and CTA routes
 * through useNavigate so labels drive page-switching. Use as the header for
 * banking apps, digital wallets, payments products, lending platforms, or any
 * finance startup landing page. Renders fully with no props via baked-in
 * "Vault" defaults.
 */
const ShieldMark = ({ className }: { className?: string }) => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const FintechNavbar = defineComponent({
  name: 'FintechNavbar',
  description:
    "Sticky fintech / neobank site header built on the shared SiteNav composite: an inline shield brand mark + product wordmark, horizontal desktop nav links, a primary 'Get Started' pill CTA, and a real mobile drawer. All links and CTA route through useNavigate for page-switching. Use as the header for banking apps, digital wallets, payment products, lending platforms, or finance startup landing pages.",
  props: z.object({
    /** Brand / product name shown beside the shield mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Primary pill CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Security', 'Pricing', 'FAQ']
    return (
      <SiteNav
        brand={props.brand ?? 'Vault'}
        brandMark={<ShieldMark className="size-8 text-primary" />}
        brandClassName="text-xl font-semibold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'Get Started',
          target: props.ctaTarget ?? 'Open an Account',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
