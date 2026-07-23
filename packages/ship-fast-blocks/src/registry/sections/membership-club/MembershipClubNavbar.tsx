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
 * MembershipClubNavbar — sticky, backdrop-blurred vitrine top navigation bar for
 * a private membership club / exclusive community site. A hairline-bottomed
 * translucent header pinned to the top on the airiest chrome in the family: a
 * thin concentric club mark beside a serif club wordmark on the left as the
 * members-only signature, quietly spaced mono micro-label uppercase nav links on
 * the center-right (desktop), and a solid square bg-foreground "Apply Now" CTA
 * with press feedback on the right. Every nav item and the CTA route through
 * route hrefs so labels drive page switching. Use as the refined, quietly
 * exclusive site header for members clubs, founders/social clubs, professional
 * networks, curated communities, alumni collectives or paid community
 * subscriptions. Renders fully with no props via baked-in "The Guild" defaults.
 */
export const MembershipClubNavbar = defineCapsule({
  name: 'MembershipClubNavbar',
  description:
    "Sticky, backdrop-blurred vitrine top navigation bar for a private membership club / exclusive community site: a hairline-bottomed translucent header pinned to the top with a thin concentric club mark + serif club wordmark on the left, quietly spaced mono micro-label uppercase nav links on the center-right (desktop), and a solid square bg-foreground 'Apply Now' CTA with press feedback on the right. Nav items and CTA route through route hrefs for page switching. Use as the refined, quietly exclusive site header for members clubs, founders/social clubs, professional networks, curated communities, alumni collectives, coworking/clubhouse memberships or paid community subscriptions.",
  props: z.object({
    /** Brand / club name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Primary CTA label on the right. */
    cta: z.string().optional(),
    /** Route target fired by the primary CTA (application flow). */
    ctaTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'The Guild'
    const nav = props.nav?.length
      ? props.nav
      : ['Benefits', 'Membership', 'About', 'FAQ']
    const cta = props.cta ?? 'Apply Now'
    const ctaTarget = props.ctaTarget ?? 'Apply for Membership'
    const signIn = props.signIn ?? 'Sign in'

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2L12 12L19 19" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/80', props.className)}
      >
        <NavbarBrand
          href={nav[0]}
          className="flex items-center gap-2"
          aria-label={`${brand} Home`}
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7 text-foreground" />}
            />
            <LogoLabel className="font-serif text-xl font-normal tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-8">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-0 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.24em] hover:bg-transparent hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <NavbarCta
            variant="primary-pill"
            href={ctaTarget}
            className="rounded-none bg-foreground px-6 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px"
          >
            {cta}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
