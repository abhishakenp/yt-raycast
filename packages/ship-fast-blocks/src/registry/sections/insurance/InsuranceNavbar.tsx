import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * InsuranceNavbar — sticky top navigation bar for an insurance / fintech site.
 * A backdrop-blurred, border-bottomed header pinned to the top of the viewport
 * with a shield logo tile + brand name on the left, horizontal nav links in the
 * center, and a phone link plus a primary "Get a Quote" CTA on the right
 * (desktop). Every link and CTA routes through useNavigate so labels can drive
 * page-switching. Clean, trustworthy, corporate aesthetic on a light canvas
 * with a single brand-blue accent. Use as the sticky site header for insurance
 * carriers, insurtech startups, brokers, or financial-protection products.
 * Renders fully with no props via baked-in defaults.
 */
export const InsuranceNavbar = defineCapsule({
  name: 'InsuranceNavbar',
  description:
    "Sticky top navigation bar for an insurance / fintech site: backdrop-blurred, border-bottomed header with a shield logo tile + brand name on the left, horizontal nav links in the center, and a phone link plus a primary 'Get a Quote' CTA on the right (desktop). Links and CTA route through useNavigate for page-switching. Clean, trustworthy corporate aesthetic on a light canvas with a single brand-blue accent. Use as the sticky site header for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Brand / company name shown beside the shield logo. */
    brand: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Phone number shown in the navbar (also navigates on click). */
    phone: z.string().optional(),
    /** Primary CTA button label. */
    ctaLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'SecureLife'
    const nav = props.nav?.length
      ? props.nav
      : ['Coverage', 'How It Works', 'Pricing', 'Reviews', 'FAQ']
    const phone = props.phone ?? '1-800-555-0199'
    const ctaLabel = props.ctaLabel ?? 'Get a Quote'

    const Shield = ({ className }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
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
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </span>
    )

    const Phone = ({ className }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button type="button" onClick={() => go(brand)} className="gap-2">
            <BrandLogo
              brand={brand}
              fallback={<Shield className="size-8" />}
              labelClassName="text-xl font-semibold text-foreground"
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
          <button
            type="button"
            onClick={() => go(phone)}
            className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <Phone className="size-4" />
            {phone}
          </button>
          <NavbarCta
            variant="primary"
            onClick={() => go(ctaLabel)}
            className="px-4 py-2"
          >
            {ctaLabel}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
