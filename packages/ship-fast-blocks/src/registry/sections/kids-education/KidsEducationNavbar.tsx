import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * KidsEducationNavbar — sticky, translucent top navigation bar for a bright,
 * playful kids / family learning platform. A backdrop-blurred header pinned to
 * the top: an animated open-book brand mark + platform name on the left,
 * horizontal nav links in the center (desktop), and a "Sign In" text link plus
 * a rounded pill primary CTA on the right. Every link and CTA route through
 * useNavigate so labels drive page-switching. Use as the sticky site header for
 * kids-education startups, children's e-learning platforms, family learning
 * apps, tutoring or homeschool services, and playful course marketplaces.
 * Renders fully with no props via baked-in "WonderLearn" defaults.
 */
export const KidsEducationNavbar = defineCapsule({
  name: 'KidsEducationNavbar',
  description:
    "Sticky translucent top navigation bar for a bright, playful kids / family learning platform: backdrop-blurred header with an animated open-book brand mark + platform name on the left, horizontal nav links in the center (desktop), and a 'Sign In' text link plus a rounded pill primary CTA on the right. Every link and CTA route through useNavigate for page-switching. Use as the sticky site header for kids-education startups, children's e-learning platforms, family learning apps, tutoring or homeschool services, and playful course marketplaces.",
  props: z.object({
    /** Brand / platform name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo click. */
    homeTarget: z.string().optional(),
    /** Sign-in text-link label. */
    signInLabel: z.string().optional(),
    /** Rounded pill CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'WonderLearn'
    const nav = props.nav?.length
      ? props.nav
      : ['Activities', 'How It Works', 'Pricing', 'Stories', 'FAQ']
    const homeTarget = props.homeTarget ?? nav[0]
    const signInLabel = props.signInLabel ?? 'Sign In'
    const ctaLabel = props.ctaLabel ?? 'Start Free Trial'
    const ctaTarget = props.ctaTarget ?? 'Start Free 14-Day Trial'

    const BookMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/90 backdrop-blur-md', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="group gap-2"
          >
            <BrandLogo brand={brand}>
              <LogoImage
                fallback={
                  <BookMark className="size-10 transition-transform duration-300 group-hover:rotate-12" />
                }
              />
              <LogoLabel className="text-xl font-bold text-foreground" />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav className="[&>button]:font-medium">
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <button
            type="button"
            onClick={() => go(signInLabel)}
            className="hidden font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {signInLabel}
          </button>
          <NavbarCta
            variant="dark-pill"
            onClick={() => go(ctaTarget)}
            className="px-5 py-2.5 shadow-sm"
          >
            {ctaLabel}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
