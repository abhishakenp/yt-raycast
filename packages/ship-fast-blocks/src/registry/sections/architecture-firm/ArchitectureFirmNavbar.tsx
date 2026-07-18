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
} from '#/section-kit/index.ts'

/**
 * ArchitectureFirmNavbar — sticky, translucent top navigation bar for an
 * architecture-studio / design-practice site. A blurred, border-bottomed header
 * pinned to the top: a light, letter-spaced studio wordmark on the left and a
 * horizontal set of quiet monochrome nav links on the right (desktop), with a
 * hamburger menu button on mobile. Calm, editorial, Scandinavian-minimalist
 * aesthetic. Every link routes through route hrefs so labels can drive
 * page-switching. Use as the sticky site header for architecture firms, design
 * studios, interior-design practices, landscape architects or built-environment
 * portfolio sites. Renders fully with no props via baked-in "Atelier Móði"
 * defaults.
 */
export const ArchitectureFirmNavbar = defineCapsule({
  name: 'ArchitectureFirmNavbar',
  description:
    'Sticky translucent top navigation bar for an architecture-studio / design-practice site: backdrop-blurred, border-bottomed header pinned to the top with a light letter-spaced studio wordmark on the left, a horizontal set of quiet monochrome nav links on the right (desktop) and a hamburger menu button on mobile. Calm, editorial, Scandinavian-minimalist aesthetic. Links route through route hrefs for page-switching. Use as the sticky site header for architecture firms, design studios, interior-design practices, landscape architects, urban planners or built-environment portfolio sites.',
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
          className="text-xl font-light tracking-tight text-foreground"
        >
          <BrandLogo brand={brand} className="mr-2 size-7 align-middle">
            <LogoImage className="mr-2 size-7 align-middle" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-0 space-x-8">
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label} className="font-normal">
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
