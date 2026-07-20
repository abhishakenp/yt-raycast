import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
/**
 * ArchitectureFirmNavbar — blueprint drafting-header navigation bar for an
 * architecture-studio / design-practice site. A sticky, backdrop-blurred,
 * hairline-bordered header: a light, tight-tracked studio wordmark on the
 * left and a row of mono uppercase micro-label nav links on the right
 * (desktop) — each prefixed with a faint two-digit index numeral and
 * separated by hairline vertical rules — with a hamburger drawer on mobile.
 * Precise, monochrome, measured. Every link routes through route hrefs so
 * labels can drive page-switching. Use as the sticky site header for
 * architecture firms, design studios, interior-design practices, landscape
 * architects or built-environment portfolio sites. Renders fully with no
 * props via baked-in "Atelier Móði" defaults.
 */
export const ArchitectureFirmNavbar = defineCapsule({
  name: 'ArchitectureFirmNavbar',
  description:
    'Blueprint drafting-header navigation bar for an architecture-studio / design-practice site: sticky, backdrop-blurred, hairline-bordered header with a light tight-tracked studio wordmark on the left and mono uppercase micro-label nav links on the right (desktop), each prefixed with a faint two-digit index numeral and separated by hairline vertical rules, plus a hamburger drawer on mobile. Precise, monochrome, measured. Links route through route hrefs for page-switching. Use as the sticky site header for architecture firms, design studios, interior-design practices, landscape architects, urban planners or built-environment portfolio sites.',
  props: z.object({
    /** Studio / firm name shown as the wordmark. */
    brand: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Atelier Móði'
    const nav = props.nav?.length
      ? props.nav
      : ['Work', 'Philosophy', 'Studio', 'Contact']

    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand
          href={nav[0]}
          className="text-lg font-light tracking-tight text-foreground"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel className="whitespace-nowrap" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-0 space-x-0 divide-x divide-border">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="px-5 font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span
                aria-hidden="true"
                className="mr-1.5 text-muted-foreground/50"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <MobileNavDrawer
          brand={brand}
          nav={nav}
          homeTarget={nav[0]}
          buttonClassName="p-2 md:hidden"
        />
      </SiteNav>
    )
  },
})
