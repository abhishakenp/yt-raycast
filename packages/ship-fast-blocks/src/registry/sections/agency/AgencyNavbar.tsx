import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * AgencyNavbar — fixed, translucent top navigation bar for a creative
 * digital-agency / studio site. A blurred, border-bottomed header pinned to the
 * top of the viewport: a gradient brand-initial logo tile beside the studio name
 * on the left, a horizontal set of nav links plus a pill-shaped primary CTA on
 * the right (desktop), and a hamburger menu button on mobile. Every link and the
 * CTA route through route hrefs so labels can drive page-switching. Use as the
 * sticky site header for agencies, design studios, branding/marketing shops,
 * freelance creatives, production houses, or any moody premium landing page.
 * Renders fully with no props via baked-in "Studio Rise" defaults.
 */
export const AgencyNavbar = defineCapsule({
  name: 'AgencyNavbar',
  description:
    'Fixed translucent top navigation bar for a creative agency / design studio site: backdrop-blurred, border-bottomed header pinned to the top with a gradient brand-initial logo tile + studio name on the left, horizontal nav links and a pill-shaped primary CTA on the right (desktop), and a hamburger menu button on mobile. Links and CTA route through route hrefs for page-switching. Use as the sticky site header for agencies, studios, branding/marketing shops, freelance creatives, or production houses.',
  props: z.object({
    /** Brand / studio name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels; last item also drives the CTA target. */
    nav: z.array(z.string()).optional(),
    /** Pill-shaped primary CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Studio Rise'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Work', 'About', 'Contact']
    const cta = props.cta ?? 'Start a project'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-black text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <SiteNav
        position="fixed"
        height="compact"
        className={cn('bg-background/70', props.className)}
        containerClassName="px-6"
      >
        <NavbarBrand
          href={nav[0]}
          className="gap-2 text-xl font-bold tracking-tight text-foreground"
        >
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark className="size-8 text-sm" />} />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta
            variant="primary-pill"
            href={nav[nav.length - 1]}
            className="px-5 py-2.5 font-semibold"
          >
            {cta}
          </NavbarCta>
        </NavbarNav>

        <MobileNavDrawer
          brand={brand}
          nav={nav}
          homeTarget={nav[0]}
          cta={{ label: cta, target: nav[nav.length - 1] }}
          buttonClassName="p-2 text-muted-foreground md:hidden"
        />
      </SiteNav>
    )
  },
})
