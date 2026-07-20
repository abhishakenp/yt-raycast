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
 * ConstructionNavbar — industrial-brutalist sticky top navigation for a
 * construction / general contractor site. A backdrop-blurred header with a
 * heavy 2px bottom rule: a square site-marker logo tile + extrabold uppercase
 * brand wordmark on the left, mono uppercase nav links in the center, and a
 * phone link (xl+) plus a square hard-edged 'Get a Quote' CTA with press
 * feedback on the right. Links and CTA route through route hrefs so labels can
 * drive page-switching. Use as the sticky site header for construction firms,
 * contractors, builders, or trades businesses.
 */
export const ConstructionNavbar = defineCapsule({
  name: 'ConstructionNavbar',
  description:
    "Industrial-brutalist sticky top navigation bar for a construction / general contractor site: backdrop-blurred header with a heavy 2px bottom rule, a square site-marker logo tile + extrabold uppercase brand wordmark on the left, mono uppercase nav links in the center, and a phone link plus a square hard-edged 'Get a Quote' CTA with press feedback on the right (desktop). Links and CTA route through route hrefs for page-switching. Use as the sticky site header for construction firms, contractors, builders, or trades businesses.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    ctaLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'BuildRight'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Projects', 'About', 'Reviews', 'Contact']
    const phone = props.phone ?? '(555) 123-4567'
    const ctaLabel = props.ctaLabel ?? 'Get a Quote'

    const LogoMark = ({
      className,
      tone,
    }: {
      className?: string
      tone?: string
    }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none',
          tone === 'foreground'
            ? 'bg-foreground text-background'
            : 'bg-primary text-primary-foreground',
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
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn(
          'border-b-2 border-foreground bg-background/95',
          props.className,
        )}
      >
        <NavbarBrand href={nav[0]} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7" tone="foreground" />}
            />
            <LogoLabel className="text-lg font-extrabold uppercase tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="hidden items-center gap-2 font-mono text-xs tabular-nums text-muted-foreground transition-colors hover:text-foreground xl:flex"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {phone}
          </a>
          <NavbarCta
            variant="dark"
            href={ctaLabel}
            className="rounded-none px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.15em] shadow-[3px_3px_0_0] shadow-primary transition-all duration-100 hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none"
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            cta={{ label: ctaLabel, target: ctaLabel }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
