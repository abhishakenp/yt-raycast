import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarRouteLink,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
/**
 * FaqNavbar — sticky editorial top navigation bar for a help-center / FAQ /
 * support page. Typography-first "Editorial Q&A" header: a sharp square (rounded-none)
 * brand mark + wordmark on the left, mono uppercase tracked nav labels centered on
 * desktop, and a mono "Contact Support" text link plus the real "Sign In" auth chip
 * on the right, with a hamburger toggle on mobile. Backdrop-blurred translucent
 * background with a hairline bottom border. Every item routes through route hrefs so
 * labels can drive page-switching. Use as the site header for SaaS knowledge bases,
 * help centers, documentation landings, or support pages. Renders fully with no props
 * via baked-in "FlowSync" defaults.
 */
export const FaqNavbar = defineCapsule({
  name: 'FaqNavbar',
  description:
    "Sticky editorial top navigation bar for a help-center / FAQ / support page with a typography-first 'Editorial Q&A' aesthetic: a sharp square (rounded-none) brand mark + wordmark on the left, mono uppercase tracked nav labels centered on desktop, and a mono 'Contact Support' text link plus the real 'Sign In' auth chip on the right, with a hamburger toggle on mobile. Backdrop-blurred translucent background with a hairline bottom border. Links route through route hrefs for page-switching. Use as the site header for SaaS knowledge bases, help centers, documentation landings, or support pages.",
  props: z.object({
    /** Brand / product name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Contact-support text link label. */
    contactSupport: z.string().optional(),
    /** Primary sign-in button label. */
    signIn: z.string().optional(),
    /** Route target for the logo / brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'FlowSync'
    const nav = props.nav?.length
      ? props.nav
      : ['Documentation', 'API Reference', 'Community', 'Status']
    const contactSupport = props.contactSupport ?? 'Contact Support'
    const signIn = props.signIn ?? 'Sign In'
    const homeTarget = props.homeTarget ?? 'Documentation'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 7h11a4 4 0 0 1 0 8H8" />
          <polyline points="11 19 7 15 11 11" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
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

        <NavbarNav className="gap-7">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-0 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] hover:bg-transparent"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <NavbarRouteLink
            href={contactSupport}
            className="hidden items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {contactSupport}
          </NavbarRouteLink>
          <SignInButton variant="primary" label={signIn} className="shrink-0" />
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: contactSupport, target: contactSupport }}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
