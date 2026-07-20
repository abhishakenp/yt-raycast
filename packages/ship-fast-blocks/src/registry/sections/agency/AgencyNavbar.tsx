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
} from '#/section-kit/SiteNav.tsx'
/**
 * AgencyNavbar — fixed neo-brutalist top navigation bar for a creative
 * digital-agency / studio site. A backdrop-blurred header with a thick 2px
 * bottom border: a tilted sharp primary logo tile (2px border, hard offset
 * shadow) beside the bold studio name on the left, mono uppercase nav links
 * plus a sharp block primary CTA with a hard offset shadow and mechanical
 * press feedback on the right (desktop), and a hamburger menu button on
 * mobile. Every link and the CTA route through route hrefs so labels can drive
 * page-switching. Use as the sticky site header for agencies, design studios,
 * branding/marketing shops, freelance creatives, production houses, or any
 * bold portfolio landing page. Renders fully with no props via baked-in
 * "Studio Rise" defaults.
 */
export const AgencyNavbar = defineCapsule({
  name: 'AgencyNavbar',
  description:
    'Fixed neo-brutalist top navigation bar for a creative agency / design studio site: backdrop-blurred header with a thick 2px bottom border, a tilted sharp primary logo tile with hard offset shadow + bold studio name on the left, mono uppercase nav links and a sharp block primary CTA with hard offset shadow and press feedback on the right (desktop), and a hamburger menu button on mobile. Links and CTA route through route hrefs for page-switching. Use as the sticky site header for agencies, studios, branding/marketing shops, freelance creatives, or production houses.',
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
          'grid -rotate-3 place-items-center rounded-none border-2 border-foreground bg-primary font-black text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground',
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
        className={cn(
          'border-b-2 border-foreground bg-background/80',
          props.className,
        )}
        containerClassName="px-6"
      >
        <NavbarBrand
          href={nav[0]}
          className="gap-2.5 text-xl font-black uppercase tracking-tight text-foreground"
        >
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark className="size-8 text-sm" />} />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta
            variant="primary-pill"
            href={nav[nav.length - 1]}
            className="rounded-none border-2 border-foreground bg-primary px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-all duration-100 hover:-translate-y-0.5 hover:bg-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
