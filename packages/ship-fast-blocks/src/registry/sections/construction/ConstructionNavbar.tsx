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
 * ConstructionNavbar — sticky top navigation bar for a construction / general
 * contractor site. A backdrop-blurred, border-bottomed header pinned to the
 * top: a hard-hat logo tile + brand name on the left, horizontal nav links in
 * the center, and a phone link plus a 'Get a Quote' CTA on the right (desktop).
 * Links and CTA route through useNavigate so labels can drive page-switching.
 * Use as the sticky site header for construction firms, contractors, builders,
 * or trades businesses.
 */
export const ConstructionNavbar = defineCapsule({
  name: 'ConstructionNavbar',
  description:
    "Sticky top navigation bar for a construction / general contractor site: backdrop-blurred, border-bottomed header with a hard-hat logo tile + brand name on the left, horizontal nav links in the center, and a phone link plus a 'Get a Quote' CTA on the right (desktop). Links and CTA route through useNavigate for page-switching. Use as the sticky site header for construction firms, contractors, builders, or trades businesses.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    ctaLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'BuildRight'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Projects', 'About', 'Reviews', 'Contact']
    const phone = props.phone ?? '(555) 123-4567'
    const ctaLabel = props.ctaLabel ?? 'Get a Quote'

    const LogoMark = ({ className, tone }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg',
          tone === 'foreground'
            ? 'bg-foreground text-background'
            : 'bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
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
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button type="button" onClick={() => go(nav[0])} className="gap-2">
            <BrandLogo
              brand={brand}
              fallback={<LogoMark className="size-8" tone="foreground" />}
              labelClassName="text-xl font-semibold tracking-tight text-foreground"
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
            className="hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:flex"
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
              aria-hidden="true"
            >
              <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {phone}
          </button>
          <NavbarCta
            variant="dark"
            onClick={() => go(ctaLabel)}
            className="px-5 py-2.5"
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
