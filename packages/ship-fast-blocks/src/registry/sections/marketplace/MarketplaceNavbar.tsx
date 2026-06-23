import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * MarketplaceNavbar — sticky site header for a multi-vendor marketplace /
 * e-commerce destination. Thin configuration over the shared `SiteNav`
 * composite: a solid brand-square logo tile beside the marketplace name,
 * centered category nav links on desktop, and a vibrant "Sell on …" CTA that
 * routes sellers to onboarding, plus a real mobile drawer (Sheet) on small
 * screens. SiteNav is the canonical header here, so the legacy bespoke search
 * bar and cart are intentionally dropped. Every nav item and the CTA route
 * through the kit's useNavigate. Use as the sticky site header for online
 * marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores,
 * and retail aggregators. Renders fully with no props via baked-in "MarketHub"
 * defaults.
 */
export const MarketplaceNavbar = defineComponent({
  name: "MarketplaceNavbar",
  description:
    "Sticky site header for a multi-vendor marketplace / e-commerce destination built on the shared SiteNav composite: a solid brand-square logo tile beside the marketplace name, centered category nav links on desktop, a vibrant 'Sell on …' seller-onboarding CTA, and a real mobile drawer on small screens. SiteNav is the canonical header, so the legacy bespoke search bar and cart are dropped. Every nav item and the CTA route through useNavigate. Use as the sticky site header for online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, and retail aggregators.",
  props: z.object({
    /** Brand / marketplace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Category nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand logo button. */
    homeTarget: z.string().optional(),
    /** Override the auto-generated "Sell on {brand}" CTA label. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the seller-onboarding CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? "MarketHub"
    const nav = props.nav?.length
      ? props.nav
      : ["Categories", "Featured Sellers", "Trending", "Reviews"]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <SiteNav
        brand={brand}
        brandMark={<LogoMark className="size-8 text-sm" />}
        nav={nav}
        cta={{
          label: props.ctaLabel ?? `Sell on ${brand}`,
          target: props.ctaTarget ?? "Sell",
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
