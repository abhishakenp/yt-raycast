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
 * BootcampNavbar — "Terminal Classroom" sticky top navigation for a coding
 * bootcamp / career-school landing page. A blurred, hairline-bordered header
 * pinned to the top of the viewport: a sharp square brand-initial tile in
 * primary beside the academy wordmark on the left, mono uppercase
 * wide-tracked nav links in the center (desktop), and a square hard-offset-
 * shadow "Apply Now" CTA with press feedback on the right. The brand button
 * routes to `homeTarget`, nav links route to their own labels, and the CTA
 * routes to `ctaTarget`. Every link routes through route hrefs so labels can
 * drive page-switching. Use as the sticky site header for coding bootcamps,
 * dev academies, vocational tech schools, or any cohort-based education brand.
 */
export const BootcampNavbar = defineCapsule({
  name: 'BootcampNavbar',
  description:
    'Terminal-styled sticky top navigation bar for a coding bootcamp / career-school landing page: blurred hairline-bordered header pinned to the top with a sharp square brand-initial tile + academy wordmark on the left, mono uppercase nav links in the center (desktop), and a square hard-offset-shadow primary "Apply Now" CTA with press feedback on the right. Brand button routes to homeTarget, nav links route to their own labels, and the CTA routes to ctaTarget through route hrefs. Use as the sticky site header for coding bootcamps, dev academies, vocational tech schools, or cohort-based education brands.',
  props: z.object({
    /** Brand / academy name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels; each drives its own route target. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand button (first nav item). */
    homeTarget: z.string().optional(),
    /** CTA button route target. */
    ctaTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'CodeCraft Academy'
    const nav = props.nav?.length
      ? props.nav
      : ['Curriculum', 'Outcomes', 'Mentors', 'Pricing', 'FAQ']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaTarget = props.ctaTarget ?? 'Start Your Application'
    const signIn = props.signIn ?? 'Sign in'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-primary font-mono font-bold text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand
          .split(' ')
          .map((w) => w.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn(
          'border-b border-border bg-background/90 supports-[backdrop-filter]:bg-background/75',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7 text-xs" />}
            />
            <LogoLabel className="text-lg font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs font-normal uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
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
            variant="primary"
            href={ctaTarget}
            className="hidden rounded-none px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] shadow-[4px_4px_0_0] shadow-primary/25 transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none sm:inline-flex"
          >
            Apply Now
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: 'Apply Now', target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
