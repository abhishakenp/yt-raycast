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
 * InteriorDesignNavbar — fixed, translucent editorial-spatial top navigation bar
 * for an upscale interior-design / architecture studio site. A backdrop-blurred,
 * hairline-ruled header pinned to the top: a square material-swatch brand mark
 * (mono initials) beside the studio wordmark on the left, a horizontal set of
 * lightly-tracked nav links in the center, and a sharp-cornered outlined primary
 * CTA that inverts to the ink surface with press feedback on the right (desktop),
 * plus a hamburger menu button on mobile. Every link and the CTA route through
 * route hrefs so labels can drive page-switching. Refined, gallery-like, binary
 * radius. Use as the sticky site header for interior designers, design studios,
 * architecture firms, home staging or renovation businesses. Renders fully with
 * no props via baked-in "Atelier Studio" defaults.
 */
export const InteriorDesignNavbar = defineCapsule({
  name: 'InteriorDesignNavbar',
  description:
    'Fixed translucent editorial-spatial top navigation bar for an upscale interior-design / architecture studio site: backdrop-blurred, hairline-ruled header pinned to the top with a square material-swatch brand mark (mono initials) + studio wordmark on the left, lightly-tracked horizontal nav links in the center, and a sharp-cornered outlined primary CTA that inverts to the ink surface with press feedback on the right (desktop), plus a hamburger menu on mobile. Links and CTA route through route hrefs for page-switching. Refined, gallery-like, binary radius. Use as the sticky site header for interior designers, design studios, architecture firms, home staging or renovation businesses.',
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
    const brand = props.brand ?? 'Atelier Studio'
    const nav = props.nav?.length
      ? props.nav
      : ['Projects', 'Services', 'Process', 'About', 'Contact']
    const cta = props.cta ?? 'Book Consultation'
    const contactTarget =
      props.contactTarget ?? nav[nav.length - 1] ?? 'Contact'

    const SwatchMark = ({ className }: { className?: string }) => (
      <span
        aria-hidden="true"
        className={cn(
          'grid place-items-center border border-foreground font-mono text-[11px] font-semibold uppercase tracking-tight text-foreground',
          className,
        )}
      >
        {brand.slice(0, 2).toUpperCase()}
      </span>
    )

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-b border-border bg-background/95 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand href={nav[0]} className="flex items-center gap-2.5">
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage
              className="size-7 rounded-none"
              fallback={<SwatchMark className="size-7" />}
            />
            <LogoLabel className="text-lg font-light tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-7">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-0 text-sm font-normal tracking-wide text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarCta
            variant="outline"
            href={contactTarget}
            className="hidden rounded-none border-foreground px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-all duration-150 hover:bg-foreground hover:text-background active:translate-y-px md:inline-flex"
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
