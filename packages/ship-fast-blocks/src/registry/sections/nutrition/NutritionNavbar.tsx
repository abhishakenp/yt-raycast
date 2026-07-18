import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * NutritionNavbar — sticky top navigation header for a nutrition-coaching /
 * wellness site, built on the shared SiteNav kit composite. Renders a fresh
 * leaf brand mark + wordmark on the left, prop-driven desktop nav links, and a
 * filled primary pill CTA on the right, with a real mobile drawer (Sheet) on
 * small screens. All links and the CTA route through SiteNav's useNavigate so
 * PageSwitch can swap pages. Use as the site header for nutrition coaches,
 * registered dietitians, meal-plan subscriptions, diet / wellness programs,
 * weight-loss or healthy-eating services and fitness-nutrition apps.
 */
export const NutritionNavbar = defineCapsule({
  name: 'NutritionNavbar',
  description:
    'Sticky top navigation header for a nutrition-coaching / wellness site, built on the shared SiteNav kit composite: a fresh leaf brand mark + wordmark on the left, prop-driven desktop nav links, and a filled primary pill CTA on the right, with a real mobile drawer on small screens. All links and the CTA route through useNavigate. Use as the sticky site header for nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs, weight-loss or healthy-eating services and fitness-nutrition apps.',
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
    const go = useNavigate()
    const brand = props.brand ?? 'Nourish'
    const nav = props.nav?.length
      ? props.nav
      : ['Approach', 'Plans', 'Stories', 'FAQ']
    const ctaLabel = props.ctaLabel ?? 'Start Now'
    const ctaTarget = props.ctaTarget ?? 'Pricing'
    const homeTarget = props.homeTarget ?? nav[0]

    const LeafMark = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="size-8 text-primary"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    )

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            {LeafMark}
            <Logo brand={brand}>
              <LogoImage />
              <LogoLabel className="text-xl font-medium text-foreground" />
            </Logo>
          </button>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
            onClick={() => go(ctaTarget)}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
