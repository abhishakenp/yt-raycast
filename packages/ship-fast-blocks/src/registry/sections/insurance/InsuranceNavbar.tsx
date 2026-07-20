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
} from '#/section-kit/index.ts'

/**
 * InsuranceNavbar — Swiss-trust sticky site header for an insurance / fintech
 * page. A backdrop-blurred, bottom-hairline header pinned to the top with an
 * inline shield mark + wordmark on the left, a horizontal row of desktop nav
 * links each carrying a mono index numeral, and a phone link (demoted below lg)
 * plus a single square (binary-radius) primary "Get a Quote" CTA with mechanical
 * press feedback on the right. Every link and CTA routes through route hrefs so
 * labels drive page-switching. Precise, calm, institutional trust bar on a light
 * canvas with a single restrained brand accent. Use as the sticky site header
 * for insurance carriers, insurtech startups, brokers, or financial-protection
 * products. Renders fully with no props via baked-in defaults.
 */
export const InsuranceNavbar = defineCapsule({
  name: 'InsuranceNavbar',
  description:
    "Swiss-trust sticky site header for an insurance / fintech page: a backdrop-blurred, bottom-hairline header with an inline shield mark + wordmark on the left, horizontal nav links each carrying a mono index numeral, and a phone link (demoted below lg) plus a single square (binary-radius) primary 'Get a Quote' CTA with mechanical press feedback on the right. Links and CTA route through route hrefs for page-switching. Precise, calm, institutional trust bar on a light canvas with one restrained brand accent. Use as the sticky site header for insurance carriers, insurtech startups, brokers, or financial-protection products.",
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
    const brand = props.brand ?? 'SecureLife'
    const nav = props.nav?.length
      ? props.nav
      : ['Coverage', 'How It Works', 'Pricing', 'Reviews', 'FAQ']
    const phone = props.phone ?? '1-800-555-0199'
    const ctaLabel = props.ctaLabel ?? 'Get a Quote'

    const Shield = ({ className }: { className?: string }) => (
      <span
        className={cn('grid place-items-center text-primary', className)}
        aria-hidden="true"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
    )

    const Phone = ({ className }: { className?: string }) => (
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
        <NavbarBrand href={brand}>
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<Shield className="size-7" />}
            />
            <LogoLabel className="text-xl font-semibold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-7">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none text-[13px] tracking-tight"
            >
              <span
                aria-hidden="true"
                className="mr-1.5 font-mono text-[10px] tabular-nums text-muted-foreground/50"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground lg:flex"
          >
            <Phone className="size-4 text-primary" />
            {phone}
          </a>
          <NavbarCta
            variant="primary"
            href={ctaLabel}
            className="rounded-none px-4 py-2 text-[13px] tracking-tight transition-[transform,background-color] duration-150 active:translate-y-px motion-reduce:transform-none"
          >
            {ctaLabel}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
