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
 * ChurchNavbar — serene editorial fixed top navigation bar for a church or
 * faith-community site. A backdrop-blurred, hairline-bordered header pinned to
 * the top: a small primary star mark beside a serif church wordmark on the
 * left, quiet horizontal nav links in the center, and on the right a sharp
 * hairline-outlined uppercase-tracked 'Give Today' CTA that inverts to solid
 * foreground on hover (with press feedback). A hamburger drawer takes over on
 * mobile. CTA and links route through route hrefs so labels can drive
 * page-switching. Use as the sticky site header for churches, parishes,
 * worship centers, ministries, or religious nonprofits.
 */
export const ChurchNavbar = defineCapsule({
  name: 'ChurchNavbar',
  description:
    "Serene editorial fixed top navigation bar for a church or faith-community site: backdrop-blurred, hairline-bordered header pinned to the top with a small primary star mark + serif church wordmark on the left, quiet horizontal nav links, and a sharp hairline-outlined uppercase-tracked 'Give Today' CTA that inverts to solid foreground on hover (desktop), plus a hamburger drawer on mobile. Links and CTA route through route hrefs for page-switching. Use as the sticky site header for churches, parishes, worship centers, ministries, or religious nonprofits.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Grace Community'
    const nav = props.nav?.length
      ? props.nav
      : ['About', 'Ministries', 'Sermons', 'Events', 'Visit']
    const homeTarget = props.homeTarget ?? 'Home'
    const ctaLabel = props.ctaLabel ?? 'Give Today'
    const ctaTarget = props.ctaTarget ?? 'Give'

    const Star = () => (
      <span className="text-xl leading-none text-primary" aria-hidden="true">
        ✦
      </span>
    )

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/90 backdrop-blur-sm', props.className)}
        containerClassName="px-6 lg:px-8"
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage fallback={<Star />} />
            <LogoLabel className="font-serif text-xl font-medium tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarCta
            variant="outline"
            href={ctaTarget}
            className="hidden rounded-none border-foreground/60 bg-transparent px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground transition-all duration-150 hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px sm:inline-flex"
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
