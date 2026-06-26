import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * AeoNavbar — sticky site header for an Answer-Engine-Optimization (AEO) SaaS.
 * Thin configuration over the shared SiteNav composite: a citation-spark brand
 * mark beside the product name, desktop nav links (Features, How it works,
 * Pricing, FAQ), and a single "Start Free" pill CTA that routes to pricing. A
 * real mobile drawer (Sheet) appears on small screens and every link routes via
 * useNavigate. Use as the sticky header for AEO, generative-search, or
 * brand-citation analytics products. Renders fully with no props via "Citeable"
 * defaults.
 */
const BrandMark = () => (
  <span
    className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"
    aria-hidden="true"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />
      <path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </svg>
  </span>
)

export const AeoNavbar = defineComponent({
  name: 'AeoNavbar',
  description:
    "Sticky site header for an Answer-Engine-Optimization (AEO) SaaS built on the shared SiteNav composite: a citation-spark brand mark beside the product name, centered desktop nav links (Features, How it works, Pricing, FAQ), and a single 'Start Free' pill CTA that routes to pricing, plus a real mobile drawer. All links route through useNavigate. Use as the sticky header for AEO platforms, generative-search visibility tools, or brand-citation analytics products.",
  props: z.object({
    /** Brand / product name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Citeable'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How it works', 'Pricing', 'FAQ']
    return (
      <SiteNav
        brand={brand}
        brandMark={<BrandMark />}
        brandClassName="text-lg font-semibold"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'Start Free',
          target: props.ctaTarget ?? 'Pricing',
        }}
        homeTarget={props.homeTarget ?? brand}
        className={props.className}
      />
    )
  },
})
