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
/**
 * PlumbingHvacNavbar — sticky trade-industrial top navigation bar for a local
 * plumbing & HVAC site. Thin configuration over the shared `SiteNav` composite
 * in a tech-brutalist-lite key: a blurred header pinned to the top with a heavy
 * border-b-2 rule, a squared bg-foreground pipe/droplet logo mark beside the
 * extrabold company wordmark, a horizontal row of mono uppercase desktop nav
 * links (Services, About, Reviews, Service Area, Contact), a mono click-to-call
 * phone number, a squared hard-shadow "Schedule Service" CTA with press
 * feedback, and a real mobile drawer on small screens. Every nav item and the
 * CTA route through route hrefs so the labels can drive page-switching. Use as
 * the sticky site header for plumbers, HVAC contractors, drain/sewer services,
 * water heater installers, and other licensed home-service trades. Renders
 * fully with no props via baked-in "Pipeworks Plumbing & HVAC" defaults.
 */
function PipeMark({ className }: { className?: string }) {
  return (
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
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12 5 12 2C12 5 9 7 7 9.5S5 13 5 15a7 7 0 0 0 7 7Z" />
      </svg>
    </span>
  )
}

export const PlumbingHvacNavbar = defineCapsule({
  name: 'PlumbingHvacNavbar',
  description:
    "Sticky trade-industrial top navigation bar for a local plumbing & HVAC site built on the shared SiteNav composite: a blurred header pinned to the top with a heavy border-b-2 rule, a squared bg-foreground pipe/droplet logo mark and extrabold company wordmark, horizontal mono uppercase desktop nav links, a mono click-to-call phone number, a squared hard-shadow 'Schedule Service' CTA with press feedback, and a real mobile drawer. Nav items and CTA route through route hrefs for page-switching. Use as the sticky site header for plumbers, HVAC contractors, drain/sewer services, water heater installers, and other licensed home-service trades.",
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Click-to-call phone number shown beside the CTA. */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Label of the pill CTA on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA button. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'About', 'Reviews', 'Service Area', 'Contact']
    const brand = props.brand ?? 'Pipeworks Plumbing & HVAC'
    const phone = props.phone ?? '(555) 010-7878'
    const ctaLabel = props.ctaLabel ?? 'Schedule Service'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-b-2 border-foreground bg-background/95',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget}>
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<PipeMark className="size-7" />}
            />
            <LogoLabel className="text-xl font-extrabold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav className="gap-6">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                'rounded-none font-mono text-xs uppercase tracking-[0.14em]',
                i >= 5 && 'hidden lg:inline-flex',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground lg:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary"
            className="hidden rounded-none px-5 py-2.5 font-semibold shadow-[4px_4px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] active:translate-y-0 active:shadow-[2px_2px_0_0] motion-reduce:transform-none sm:inline-flex"
            href={ctaTarget}
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
