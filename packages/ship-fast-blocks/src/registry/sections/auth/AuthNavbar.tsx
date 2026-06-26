import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * AuthNavbar — sticky site header for Authly, a developer authentication-as-a-service
 * product (think Clerk / Auth0). Thin configuration over the shared `SiteNav`
 * composite: a sharp sans wordmark beside an inline keyhole / shield line mark,
 * centered nav links on desktop (Product, Docs, Pricing, Customers), and a
 * high-contrast "Start Free" CTA that routes to sign-up. Use as the header for
 * auth platforms, identity APIs, login SDKs, or any developer-first SaaS where
 * getting started fast matters. Renders fully with no props.
 */
const KeyholeMark = ({ className }: { className?: string }) => (
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
    <path d="M12 2a7 7 0 0 0-7 7c0 2.9 1.76 5.39 4.27 6.46L8 22h8l-1.27-6.54A7 7 0 0 0 12 2Z" />
    <circle cx="12" cy="9" r="2.2" />
  </svg>
)

export const AuthNavbar = defineComponent({
  name: 'AuthNavbar',
  description:
    "Sticky developer-auth product header (Authly, an authentication-as-a-service like Clerk / Auth0) built on the shared SiteNav composite: sharp sans wordmark + keyhole/shield mark, centered desktop nav links (Product, Docs, Pricing, Customers), a high-contrast 'Start Free' CTA routing to sign-up, and a real mobile drawer. Use as the header for auth platforms, identity APIs, login SDKs, or any developer-first SaaS landing page.",
  props: z.object({
    /** Product / brand name shown beside the logo mark. */
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
    const nav = props.nav?.length
      ? props.nav
      : ['Product', 'Docs', 'Pricing', 'Customers']
    return (
      <SiteNav
        brand={props.brand ?? 'Authly'}
        brandMark={<KeyholeMark className="size-7 text-primary" />}
        brandClassName="text-xl font-semibold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'Start Free',
          target: props.ctaTarget ?? 'Sign Up',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        sticky
        className={props.className}
      />
    )
  },
})
