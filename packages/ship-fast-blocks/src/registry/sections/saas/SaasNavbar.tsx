import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * SaasNavbar — glassy sticky top navigation bar for an AI-product / SaaS landing
 * page. Thin configuration over the shared `SiteNav` composite: a gradient-tile
 * clock-glyph logo mark beside the product wordmark, horizontal desktop nav
 * links, a pill "Get Started" CTA, and a real mobile drawer (Sheet) on small
 * screens. Every nav item and the CTA route through useNavigate so labels can
 * drive page-switching. Use as the sticky site header for AI tools, SaaS apps,
 * productivity/scheduling products, developer tools, or modern B2B startups.
 * Renders fully with no props via baked-in "Chronos AI" defaults.
 */
const ClockMark = ({ className }: { className?: string }) => (
  <span
    className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
    aria-hidden="true"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  </span>
)

export const SaasNavbar = defineComponent({
  name: 'SaasNavbar',
  description:
    'Glassy sticky top navigation bar for an AI-product / SaaS landing page built on the shared SiteNav composite: a gradient-tile clock-glyph logo and product wordmark, horizontal desktop nav links, a pill primary CTA, and a real mobile drawer. Nav items and CTA route through useNavigate for page-switching. Use as the sticky site header for AI tools, SaaS apps, productivity/scheduling products, developer tools, or modern B2B startups.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Label of the gradient pill CTA on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How It Works', 'Pricing', 'Testimonials', 'FAQ']
    return (
      <SiteNav
        brand={props.brand ?? 'Chronos AI'}
        brandMark={<ClockMark className="size-[18px]" />}
        brandClassName="text-xl font-extrabold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'Get Started',
          target: props.ctaTarget ?? 'Start free trial',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
