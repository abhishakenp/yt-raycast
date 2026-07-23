import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
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
 * LandscapingNavbar — sticky, backdrop-blurred site header for a landscaping /
 * outdoor-design company in the "Organic editorial" language. A hairline-
 * bottomed bar on an adaptive translucent surface: a layered-diamond line mark
 * beside a tight-tracked wordmark on the left (exact BrandLogo compound
 * pattern), a horizontal row of quiet mono-hover nav links in the center, and a
 * calm sage-accent pill CTA with mechanical press feedback on the right; a
 * hamburger drawer takes over on mobile. Every link and the CTA route through
 * route hrefs so labels can drive page-switching. Use as the sticky site header
 * for landscapers, lawn-care and yard-maintenance services, garden designers,
 * hardscaping/patio contractors, irrigation specialists or grounds-keeping
 * companies. Renders fully with no props via baked-in "Earth & Edge" defaults.
 */
export const LandscapingNavbar = defineCapsule({
  name: 'LandscapingNavbar',
  description:
    'Sticky, backdrop-blurred site header for a landscaping / outdoor-design company in an organic-editorial language: a hairline-bottomed bar on an adaptive translucent surface with a layered-diamond line mark beside a tight-tracked wordmark on the left, a horizontal row of quiet nav links in the center, and a calm sage-accent pill CTA with mechanical press feedback on the right (desktop), plus a hamburger drawer on mobile. Links and CTA route through route hrefs for page-switching. Use as the sticky site header for landscapers, lawn-care and yard-maintenance services, garden designers, hardscaping/patio contractors, irrigation specialists or grounds-keeping companies.',
  props: z.object({
    /** Brand / company name shown beside the mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Pill-shaped primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the CTA (defaults to the last nav item / "Get a Quote"). */
    contactTarget: z.string().optional(),
    /** Navigation target for the brand mark and mobile menu button. */
    homeTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Earth & Edge'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Portfolio', 'Pricing', 'About', 'Get a Quote']
    const cta = props.cta ?? nav[nav.length - 1] ?? 'Get a Quote'
    const contactTarget =
      props.contactTarget ?? nav[nav.length - 1] ?? 'Get a Quote'
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Services'
    const signIn = props.signIn ?? 'Sign in'

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('text-primary', className)}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/90 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={homeTarget}>
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7" />}
            />
            <LogoLabel className="text-lg font-semibold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-6">
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground hover:bg-transparent hover:text-primary"
            >
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta
            variant="primary-pill"
            href={contactTarget}
            className="px-5 py-2.5 transition-[transform,background-color] duration-150 active:translate-y-px motion-reduce:transform-none"
          >
            {cta}
          </NavbarCta>
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
        </NavbarActions>

        <MobileNavDrawer
          brand={brand}
          nav={nav}
          homeTarget={homeTarget}
          cta={{ label: cta, target: contactTarget }}
          buttonClassName="p-2 text-muted-foreground md:hidden"
        />
      </SiteNav>
    )
  },
})
