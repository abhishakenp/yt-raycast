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
 * CrowdfundingNavbar — sticky, backdrop-blurred top navigation for a
 * crowdfunding / campaign landing page in a playful-bold campaign language: a
 * hard 2px bottom-ruled header with the leaf/sparkle brand mark beside an
 * extrabold campaign wordmark on the left, bold nav links in the center
 * (hidden on mobile), and a rounded-full "Back This Project" pill CTA with a
 * hard offset shadow and press feedback on the right. Every link and CTA
 * routes through route hrefs so PageSwitch can swap pages. Use as the sticky
 * site header for Kickstarter / Indiegogo-style campaigns, pre-order launches,
 * fundraisers, or maker/hardware projects.
 */
export const CrowdfundingNavbar = defineCapsule({
  name: 'CrowdfundingNavbar',
  description:
    "Sticky, backdrop-blurred top navigation for a crowdfunding / campaign landing page in a playful-bold campaign language: a hard 2px bottom-ruled header with the leaf/sparkle brand mark beside an extrabold campaign wordmark on the left, bold nav links in the center (hidden on mobile), and a rounded-full 'Back This Project' pill CTA with a hard offset shadow and press feedback on the right. Every link and CTA routes through route hrefs so PageSwitch can swap pages. Use as the sticky site header for Kickstarter / Indiegogo-style campaigns, pre-order launches, fundraisers, or maker/hardware projects.",
  props: z.object({
    /** Brand / campaign name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Target label for the brand/home button (defaults to first nav item). */
    homeTarget: z.string().optional(),
    /** Label for the primary pill CTA on the right. */
    ctaLabel: z.string().optional(),
    /** Target label for the primary pill CTA (defaults to the Rewards route). */
    ctaTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'EcoBrush'
    const nav = props.nav?.length
      ? props.nav
      : ['Our Story', 'Features', 'Rewards', 'FAQ']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Back This Project'
    const ctaTarget = props.ctaTarget ?? nav[2] ?? 'Rewards'
    const signIn = props.signIn ?? 'Sign in'

    const LeafMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-full bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b-2 border-foreground/80 bg-background/95 backdrop-blur',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="active:translate-y-px">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LeafMark className="size-7" />}
            />
            <LogoLabel className="text-lg font-extrabold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
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
            className="rounded-full border-2 border-foreground bg-primary px-5 py-2 font-bold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground/25 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-foreground/25 active:translate-y-px active:shadow-none"
          >
            {ctaLabel}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
