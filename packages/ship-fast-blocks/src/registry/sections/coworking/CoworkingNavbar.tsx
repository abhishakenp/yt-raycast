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
} from '#/section-kit/SiteNav.tsx'
/**
 * CoworkingNavbar — flat editorial navigation for a coworking / workspace
 * brand. A fixed, full-width glass bar (the one allowed backdrop blur +
 * hairline bottom border, always on) that firms up its background and gains a
 * flat hairline shadow once the page scrolls. Desktop links are plain sans
 * labels — no hover pills — whose active route is signalled by a thin primary
 * underline. The brand mark is a flat square tile beside the wordmark, an
 * optional front-desk phone sits right in mono, and the CTA is a SHARP square
 * primary button with an active press. Small screens get the real shared
 * mobile drawer. All links route through route hrefs. Use as the fixed site
 * header for coworking spaces, shared offices, flex-office platforms, or any
 * membership-driven workspace brand. Renders fully with no props via baked-in
 * "Northside" defaults.
 */
function BrandTile({ letter }: { letter: string }) {
  return (
    <span
      className="grid size-9 place-items-center rounded-none bg-foreground text-sm font-semibold text-background"
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
          'border-border/60 backdrop-blur-xl transition-[background-color,box-shadow] duration-300',
          scrolled ? 'bg-background/85 shadow-sm' : 'bg-background/65',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="gap-3">
          <Logo brand={brand} className="flex items-center gap-2.5">
            <LogoImage
              className="size-9"
              fallback={<BrandTile letter={brand.charAt(0).toUpperCase()} />}
            />
            <LogoLabel className="text-lg font-semibold tracking-tight text-foreground" />
          </Logo>
        </NavbarBrand>

        <NavbarNav className="gap-8">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-1 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-transparent hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground xl:inline"
            >
              {phone}
            </a>
          ) : null}

          <NavbarCta
            variant="primary"
            href={ctaTarget}
            className="hidden rounded-none px-5 py-2.5 font-semibold transition-colors duration-200 hover:bg-primary/90 active:translate-y-px sm:inline-flex"
          >
            {ctaLabel}
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
