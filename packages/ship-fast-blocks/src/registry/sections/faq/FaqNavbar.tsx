import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
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
 * FaqNavbar — sticky top navigation bar for a help-center / FAQ / support page.
 * A clean, light, documentation-style header: a brand logo tile + name on the
 * left, centered text nav links (desktop), and a "Contact Support" text link plus
 * a solid primary "Sign In" button on the right, with a hamburger toggle on
 * mobile. Backdrop-blurred translucent background, bottom border. Every item routes
 * through useNavigate so labels can drive page-switching. Use as the site header
 * for SaaS knowledge bases, help centers, documentation landings, or support pages.
 * Renders fully with no props via baked-in "FlowSync" defaults.
 */
export const FaqNavbar = defineCapsule({
  name: 'FaqNavbar',
  description:
    "Sticky top navigation bar for a help-center / FAQ / support page with a clean, light, documentation aesthetic: brand logo tile + name on the left, centered text nav links on desktop, and a 'Contact Support' text link plus a solid primary 'Sign In' button on the right, with a hamburger toggle on mobile. Backdrop-blurred translucent background with a bottom border. Links route through useNavigate for page-switching. Use as the site header for SaaS knowledge bases, help centers, documentation landings, or support pages.",
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
    const go = useNavigate()
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
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
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
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-2"
          >
            <BrandLogo brand={brand}>
              <LogoImage fallback={<LogoMark className="size-8" />} />
              <LogoLabel className="text-lg font-semibold text-foreground" />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <button
            type="button"
            onClick={() => go(contactSupport)}
            className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
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
          </button>
          <NavbarCta
            variant="primary"
            onClick={() => go(signIn)}
            className="px-4 py-2"
          >
            {signIn}
          </NavbarCta>
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
