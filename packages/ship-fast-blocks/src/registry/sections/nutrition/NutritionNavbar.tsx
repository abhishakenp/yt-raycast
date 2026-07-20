import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
/**
 * NutritionNavbar — fresh clean-editorial sticky navigation header for a
 * nutrition-coaching / wellness site, built on the shared SiteNav kit
 * composite. A backdrop-blurred, hairline-bordered bar: a square primary leaf
 * logo tile + wordmark with a mono "wellness" micro-label behind a hairline
 * divider on the left, quiet muted nav links, a sharp-cornered filled-primary
 * pill CTA with press feedback on the right, and a real square hairline mobile
 * drawer (Sheet) trigger on small screens. All links and the CTA route through
 * SiteNav's route hrefs so PageSwitch can swap pages. Use as the sticky site
 * header for nutrition coaches, registered dietitians, meal-plan subscriptions,
 * diet / wellness programs, weight-loss or healthy-eating services and
 * fitness-nutrition apps.
 */
export const NutritionNavbar = defineCapsule({
  name: 'NutritionNavbar',
  description:
    'Fresh clean-editorial sticky navigation header for a nutrition-coaching / wellness site, built on the shared SiteNav kit composite: a backdrop-blurred, hairline-bordered bar with a square primary leaf logo tile + wordmark and a mono micro-label behind a hairline divider on the left, quiet muted desktop nav links, a sharp-cornered filled-primary pill CTA with press feedback on the right, and a real square hairline mobile drawer on small screens. All links and the CTA route through route hrefs. Use as the sticky site header for nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs, weight-loss or healthy-eating services and fitness-nutrition apps.',
  props: z.object({
    /** Brand name shown beside the leaf mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Accepted for backward compatibility; SiteNav has no sign-in slot, so it is not rendered. */
    signInLabel: z.string().optional(),
    /** Filled primary pill CTA label. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA (defaults to the Pricing route). */
    ctaTarget: z.string().optional(),
    /** Navigation target for the brand / home click. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nourish'
    const nav = props.nav?.length
      ? props.nav
      : ['Approach', 'Plans', 'Stories', 'FAQ']
    const ctaLabel = props.ctaLabel ?? 'Start Now'
    const ctaTarget = props.ctaTarget ?? 'Pricing'
    const homeTarget = props.homeTarget ?? nav[0]

    const LeafBadge = ({ className }: { className?: string }) => (
      <span
        aria-hidden="true"
        className={cn(
          'grid place-items-center rounded-none bg-primary text-primary-foreground',
          className,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/90', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-3 text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LeafBadge className="size-7" />}
            />
            <LogoLabel className="text-lg font-bold tracking-tight text-foreground" />
          </BrandLogo>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-border lg:block"
          />
          <MonoTag className="hidden lg:inline-block">Wellness</MonoTag>
        </NavbarBrand>
        <NavbarNav className="gap-7 [&>button]:font-medium">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions className="gap-2">
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 transition-colors active:translate-y-px sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
