import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
import {
  SaasAccountButton,
  SaasIntentBadge,
  SaasMobileMenu,
  SaasMutationSpinner,
  SaasPlanActionButton,
  SaasSearchButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * MobileAppNavbar — a fixed, backdrop-blurred top navigation bar for a clean,
 * minimalist mobile-app / consumer-product marketing site. A bordered-bottom
 * header pinned to the top: a decorative check-in-circle logo mark + app name on
 * the left, a horizontal set of nav links in the center, and a primary pill CTA
 * button (e.g. "Download App") plus a mobile hamburger on the right. The brand
 * button, links and CTA all route through route hrefs for page-switching. Use as
 * the sticky site header for a habit tracker, fitness / wellness / meditation
 * app, productivity or to-do app, or any App-Store-distributed consumer product.
 * Renders fully with no props via baked-in "DailyFlow" defaults.
 */
export const MobileAppNavbar = defineCapsule({
  name: 'MobileAppNavbar',
  description:
    'Fixed, backdrop-blurred top navigation bar for a clean, minimalist mobile-app / consumer-product marketing site: a bordered-bottom header pinned to the top with a check-in-circle logo mark + app name, horizontal nav links, command plan search, Shoo profile dropdown, selected-plan badge, scoped download CTA, and a reusable Sheet mobile drawer. Nav links route through route hrefs while conversion CTAs write to shared Lakebed state.',
  props: z.object({
    /** Brand / app name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Center nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Primary pill CTA button label on the right. */
    ctaLabel: z.string().optional(),
    /** Route the brand/logo + hamburger return to (usually the homepage). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'DailyFlow'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'How It Works', 'Pricing', 'Reviews']
    const ctaLabel = props.ctaLabel ?? 'Download App'
    const homeTarget = props.homeTarget ?? 'Features'
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn('text-foreground', className)}
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 16L14 20L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
    return (
      <SiteNav
        position="fixed"
        height="compact"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={homeTarget} className="flex items-center gap-2">
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark className="size-8" />} />
            <LogoLabel className="text-xl font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <SaasIntentBadge lakebed={lakebed} />
          <SaasSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <SaasAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <SaasPlanActionButton
            lakebed={lakebed}
            intentLabel={ctaLabel}
            plan={ctaLabel}
            source="navbar"
            pendingChildren={
              <>
                <SaasMutationSpinner className="size-4" />
                Opening
              </>
            }
            className="hidden items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {ctaLabel}
          </SaasPlanActionButton>
          <SaasMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
