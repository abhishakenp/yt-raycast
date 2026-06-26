import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * EcommerceNavbar — sticky store header for a general online marketplace or
 * retail shop. Thin configuration over the shared `SiteNav` composite: a bold
 * sans-serif wordmark, a category nav (Shop, Categories, Deals, New, Sale), a
 * primary "Shop" CTA pill, and a real mobile drawer (Sheet) on small screens.
 * Every nav item and the CTA route through useNavigate so labels can drive
 * page-switching. Use as the site header for online stores, marketplaces,
 * electronics/home-goods shops, or any clean modern retail storefront. Renders
 * fully with no props via baked-in "Marketplace" defaults.
 */
export const EcommerceNavbar = defineComponent({
  name: 'EcommerceNavbar',
  description:
    "Sticky store header for a general online marketplace or retail shop built on the shared SiteNav composite: a bold sans-serif wordmark, a category nav (Shop, Categories, Deals, New, Sale), a primary 'Shop' CTA pill, and a real mobile drawer. Every nav item and the CTA route through useNavigate and labels match the nav array so PageSwitch can swap pages. Use as the site header for online stores, marketplaces, electronics, home goods, multi-category retail, or any clean modern storefront.",
  props: z.object({
    /** Brand / store name shown as the bold wordmark. */
    brand: z.string().optional(),
    /** Top-level category nav labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Label for the primary call-to-action button. */
    shopCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    shopTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Shop', 'Categories', 'Deals', 'New', 'Sale']
    const shopCta = props.shopCta ?? 'Shop'
    return (
      <SiteNav
        brand={props.brand ?? 'Marketplace'}
        brandClassName="text-xl font-bold tracking-tight lg:text-2xl"
        nav={nav}
        cta={{ label: shopCta, target: props.shopTarget ?? shopCta }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
