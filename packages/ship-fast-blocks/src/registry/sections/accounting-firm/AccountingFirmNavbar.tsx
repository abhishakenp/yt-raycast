import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
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
 * AccountingFirmNavbar — sticky, translucent top navigation bar for a CPA /
 * accounting-firm site. A backdrop-blurred, border-bottomed header pinned to the
 * top: a neutral brand-initial logo tile beside the firm name on the left,
 * horizontal nav links in the center (desktop), and a filled "Schedule
 * Consultation" primary CTA plus a hamburger menu button on the right. Calm,
 * trustworthy professional-services aesthetic. Every nav link and the CTA route
 * through useNavigate so labels can drive page-switching. Use as the sticky site
 * header for accounting firms, CPA practices, tax-preparation services,
 * bookkeeping/payroll providers, audit/assurance firms, or financial advisory
 * practices. Renders fully with no props via baked-in "Northridge" defaults.
 */
export const AccountingFirmNavbar = defineCapsule({
  name: 'AccountingFirmNavbar',
  description:
    'Sticky translucent top navigation bar for a CPA / accounting-firm site: backdrop-blurred, border-bottomed header pinned to the top with a neutral brand-initial logo tile + firm name on the left, horizontal nav links in the center (desktop), and a filled Schedule-Consultation primary CTA plus a hamburger menu button on the right. Calm, trustworthy professional-services look; links and CTA route through useNavigate for page-switching. Use as the sticky site header for accounting firms, CPA practices, tax-preparation services, bookkeeping/payroll providers, audit/assurance firms, or financial advisory practices.',
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
    const go = useNavigate()
    const brand = props.brand ?? 'Northridge'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'About', 'Team', 'Pricing', 'FAQ']
    const cta = props.cta ?? 'Schedule Consultation'

    const LogoMark = ({ className }) => (
      <span
        className={cn(
          'grid place-items-center rounded-md bg-primary font-bold text-primary-foreground',
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
        <NavbarBrand asChild>
          <button type="button" onClick={() => go(nav[0])} className="gap-2">
            <BrandLogo
              brand={brand}
              fallback={<LogoMark className="size-8 text-sm" />}
              labelClassName="text-lg font-semibold tracking-tight text-foreground"
            />
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarCta
            variant="primary"
            onClick={() => go(cta)}
            className="hidden rounded-md px-5 py-2.5 sm:inline-flex"
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
