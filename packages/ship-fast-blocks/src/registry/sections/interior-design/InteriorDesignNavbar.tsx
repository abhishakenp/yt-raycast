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
 * InteriorDesignNavbar — fixed, translucent top navigation bar for an upscale
 * interior-design / architecture studio site. A backdrop-blurred, border-
 * bottomed header pinned to the top: a light-weight two-tone wordmark (bold mark
 * + faded suffix) on the left, a horizontal set of nav links in the center, and
 * an outlined square primary CTA on the right (desktop), with a hamburger menu
 * button on mobile. Every link and the CTA route through useNavigate so labels
 * can drive page-switching. Editorial, refined, gallery-like. Use as the sticky
 * site header for interior designers, design studios, architecture firms, home
 * staging or renovation businesses. Renders fully with no props via baked-in
 * "Atelier Studio" defaults.
 */
export const InteriorDesignNavbar = defineCapsule({
  name: 'InteriorDesignNavbar',
  description:
    'Fixed translucent top navigation bar for an upscale interior-design / architecture studio site: backdrop-blurred, border-bottomed header pinned to the top with a light-weight two-tone wordmark (bold mark + faded suffix) on the left, horizontal nav links in the center, and an outlined square primary CTA on the right (desktop), plus a hamburger menu on mobile. Links and CTA route through useNavigate for page-switching. Editorial, refined and gallery-like. Use as the sticky site header for interior designers, design studios, architecture firms, home staging or renovation businesses.',
  props: z.object({
    /** Brand / studio name; split into bold mark + faded suffix on a space. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Outlined square primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the CTA (defaults to the last nav item / "Contact"). */
    contactTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Atelier Studio'
    const nav = props.nav?.length
      ? props.nav
      : ['Projects', 'Services', 'Process', 'About', 'Contact']
    const cta = props.cta ?? 'Book Consultation'
    const contactTarget =
      props.contactTarget ?? nav[nav.length - 1] ?? 'Contact'

    const brandParts = brand.split(' ')
    const brandMark = brandParts[0]
    const brandSuffix = brandParts.slice(1).join(' ')

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="gap-2 text-2xl font-light tracking-tight"
          >
            <BrandLogo
              brand={brand}
              className="mr-2 size-7"
              showLabel={false}
            />
            <span className="text-foreground">{brandMark}</span>
            {brandSuffix && (
              <span className="text-muted-foreground">{brandSuffix}</span>
            )}
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
            variant="outline"
            onClick={() => go(contactTarget)}
            className="hidden border-foreground px-6 py-2.5 text-foreground hover:bg-foreground hover:text-background md:inline-flex"
          >
            {cta}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            cta={{ label: cta, target: contactTarget }}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
