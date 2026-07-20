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
} from '#/section-kit/index.ts'

/**
 * AccountingFirmNavbar — Swiss-ledger sticky top navigation bar for a CPA /
 * accounting-firm site. A backdrop-blurred, hairline-ruled header pinned to the
 * top: a sharp-cornered ink-block brand tile with mono initials beside the firm
 * name on the left, monospaced uppercase letter-spaced nav links in the center
 * (desktop) that grow a slide-in accent underline on hover, and a square-edged
 * solid primary "Schedule Consultation" CTA with press feedback plus a hamburger
 * menu button on the right. Typeset like a financial broadsheet masthead —
 * precision over decoration. Every nav link and the CTA route through route
 * hrefs so labels can drive page-switching. Use as the sticky site header for
 * accounting firms, CPA practices, tax-preparation services, bookkeeping/payroll
 * providers, audit/assurance firms, or financial advisory practices. Renders
 * fully with no props via baked-in "Northridge" defaults.
 */
export const AccountingFirmNavbar = defineCapsule({
  name: 'AccountingFirmNavbar',
  description:
    'Swiss-ledger sticky top navigation bar for a CPA / accounting-firm site: backdrop-blurred, hairline-ruled header pinned to the top with a sharp-cornered ink-block brand tile (mono initials) + firm name on the left, monospaced uppercase letter-spaced nav links with slide-in accent underlines in the center (desktop), and a square-edged solid primary Schedule-Consultation CTA with press feedback plus a hamburger menu button on the right. Financial-broadsheet masthead precision; links and CTA route through route hrefs for page-switching. Use as the sticky site header for accounting firms, CPA practices, tax-preparation services, bookkeeping/payroll providers, audit/assurance firms, or financial advisory practices.',
  props: z.object({
    /** Firm / brand name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level nav link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Filled primary CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Northridge'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'About', 'Team', 'Pricing', 'FAQ']
    const cta = props.cta ?? 'Schedule Consultation'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-foreground font-mono font-bold text-background',
          className,
        )}
        aria-hidden="true"
      >
        {brand.slice(0, 2).toUpperCase()}
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={nav[0]} className="gap-3">
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark className="size-8 text-xs" />} />
            <LogoLabel className="text-lg font-semibold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-7">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="relative rounded-none px-0 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-transparent after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarCta
            variant="primary"
            href={cta}
            className="hidden rounded-none px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-transform duration-150 active:translate-y-px sm:inline-flex"
          >
            {cta}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            cta={{ label: cta, target: cta }}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
