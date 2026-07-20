import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
/**
 * KidsEducationNavbar — sticky, backdrop-blurred top navigation bar for a
 * playful-primary kids / family learning platform. A pinned header: a chunky
 * sharp-cornered open-book brand block (2px foreground border, bg-primary mark
 * that tilts on hover) beside the extrabold wordmark on the left, whitespace-
 * nowrap nav links in the center (desktop), and a ghost "Sign In" link plus a
 * sharp dark pill CTA with a hard primary offset shadow and mechanical press
 * feedback on the right. Every link and CTA route through route hrefs so labels
 * drive page-switching; auth wiring is preserved. Use as the sticky site header
 * for kids-education startups, children's e-learning platforms, family learning
 * apps, tutoring or homeschool services, and playful course marketplaces.
 * Renders fully with no props via baked-in "WonderLearn" defaults.
 */
export const KidsEducationNavbar = defineCapsule({
  name: 'KidsEducationNavbar',
  description:
    "Sticky backdrop-blurred top navigation bar for a playful-primary kids / family learning platform: a chunky sharp-cornered open-book brand block (2px foreground border, bg-primary mark that tilts on hover) beside an extrabold wordmark on the left, whitespace-nowrap nav links in the center (desktop), and a ghost 'Sign In' link plus a sharp dark pill CTA with a hard primary offset shadow and mechanical press feedback on the right. Every link and CTA route through route hrefs for page-switching; auth wiring is preserved. Use as the sticky site header for kids-education startups, children's e-learning platforms, family learning apps, tutoring or homeschool services, and playful course marketplaces.",
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
          'grid place-items-center rounded-none border-2 border-foreground bg-primary text-primary-foreground',
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
        <NavbarBrand href={homeTarget} className="group gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={
                <BookMark className="size-7 transition-transform duration-200 group-hover:-rotate-6" />
              }
            />
            <LogoLabel className="text-xl font-extrabold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="[&>button]:font-medium">
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signInLabel}
            className="hidden sm:block"
          />
          <NavbarCta
            variant="dark-pill"
            href={ctaTarget}
            className="border-2 border-foreground px-5 py-2.5 font-semibold shadow-[3px_3px_0_0] shadow-primary/40 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-primary/40 active:translate-y-px active:shadow-none motion-reduce:transform-none"
          >
            {ctaLabel}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
