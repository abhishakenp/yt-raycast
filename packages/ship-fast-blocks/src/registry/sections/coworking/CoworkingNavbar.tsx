import { useEffect, useState } from 'react'
import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
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
 * CoworkingNavbar — quiet glass navigation for a coworking / workspace
 * brand. A fixed, full-width frosted bar (backdrop blur + hairline bottom
 * border, always on) that gains a soft shadow and slightly deeper glass once
 * the page scrolls. Desktop links share a hover pill, the brand is a
 * gradient tile beside the wordmark, an optional front-desk phone sits
 * right, and the CTA is a primary pill with a shimmer sweep on hover. Small
 * screens get the real shared mobile drawer. All links route through
 * route hrefs. Use as the fixed site header for coworking spaces, shared
 * offices, flex-office platforms, or any membership-driven workspace brand.
 * Renders fully with no props via baked-in "Northside" defaults.
 */
function BrandTile({ letter }: { letter: string }) {
  return (
    <span
      className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/25 ring-1 ring-primary/30"
      aria-hidden="true"
    >
      {letter}
    </span>
  )
}

export const CoworkingNavbar = defineCapsule({
  name: 'CoworkingNavbar',
  description:
    "Quiet glass site header for a coworking / workspace brand: a fixed full-width frosted bar (always backdrop-blurred, hairline bottom border) that gains a soft shadow after scrolling, with a gradient brand tile, desktop links sharing a hover pill, an optional front-desk phone, a shimmer-on-hover 'Book a Tour' CTA pill, and a real mobile drawer on small screens. All links route through route hrefs. Use as the fixed site header for coworking spaces, shared offices, flex-office platforms, or workspace membership pages.",
  props: z.object({
    /** Brand / workspace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Optional front-desk phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const [scrolled, setScrolled] = useState(false)
    const [hovered, setHovered] = useState<string | null>(null)

    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 16)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const brand =
      typeof props.brand === 'string' && props.brand ? props.brand : 'Northside'
    const nav = props.nav?.length
      ? props.nav.filter((label) => typeof label === 'string' && label)
      : ['Spaces', 'Amenities', 'Pricing', 'Gallery', 'FAQ']
    const phone =
      typeof props.phone === 'string' && props.phone.trim() ? props.phone : null
    const ctaLabel =
      typeof props.ctaLabel === 'string' && props.ctaLabel
        ? props.ctaLabel
        : 'Book a Tour'
    const ctaTarget =
      typeof props.ctaTarget === 'string' && props.ctaTarget
        ? props.ctaTarget
        : 'Pricing'
    const homeTarget =
      typeof props.homeTarget === 'string' && props.homeTarget
        ? props.homeTarget
        : brand

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-border/50 backdrop-blur-xl transition-[background-color,box-shadow] duration-500',
          scrolled
            ? 'bg-background/80 shadow-[0_8px_30px_-12px] shadow-foreground/10'
            : 'bg-background/65',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="gap-3">
          <Logo brand={brand} className="size-9">
            <LogoImage
              className="size-9"
              fallback={<BrandTile letter={brand.charAt(0).toUpperCase()} />}
            />
            <LogoLabel className="text-lg font-semibold tracking-tight text-foreground" />
          </Logo>
        </NavbarBrand>

        <NavbarNav className="gap-1" onMouseLeave={() => setHovered(null)}>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              onMouseEnter={() => setHovered(label)}
              className="relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {hovered === label ? (
                <span
                  className="absolute inset-0 rounded-full bg-muted"
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative z-10">{label}</span>
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline"
            >
              {phone}
            </a>
          ) : null}

          <NavbarCta
            variant="primary-pill"
            href={ctaTarget}
            className="group relative hidden overflow-hidden px-5 py-2.5 font-semibold shadow-sm shadow-primary/25 transition-shadow duration-300 hover:shadow-md hover:shadow-primary/30 sm:inline-flex"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
            />
            <span className="relative">{ctaLabel}</span>
          </NavbarCta>

          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
