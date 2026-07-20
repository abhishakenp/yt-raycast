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
 * FilmDirectorNavbar — fixed, backdrop-blurred cinematic top navigation bar for
 * a film director / cinematographer / DP portfolio. A hairline-bottomed
 * translucent header pinned to the top pairing the director's giant credits-style
 * UPPERCASE extrabold wordmark on the left with a row of mono, tracked slate-label
 * nav links on the right (desktop); the LAST nav item becomes a square-edged
 * inverted (bg-foreground/text-background) mono CTA with press feedback, and a
 * hamburger drawer button on mobile. Every link and CTA routes through route
 * hrefs. Tokens-only so the dark-cinematic treatment flips cleanly between light
 * and dark generated themes. Use as the sticky site header for filmmakers,
 * directors, cinematographers, DPs, or video production houses.
 */
export const FilmDirectorNavbar = defineCapsule({
  name: 'FilmDirectorNavbar',
  description:
    "Fixed, backdrop-blurred cinematic top navigation bar for a film director / cinematographer / DP portfolio: a hairline-bottomed translucent header pairing the director's giant credits-style UPPERCASE extrabold wordmark with a row of mono tracked slate-label nav links (desktop); the last nav item renders as a square-edged inverted mono CTA with press feedback, plus a hamburger drawer on mobile. All links and CTAs route through route hrefs; tokens-only so the treatment flips between light and dark themes. Use as the sticky site header for filmmakers, directors, cinematographers, DPs, or video production houses.",
  props: z.object({
    /** Director / studio name shown in the navbar (rendered uppercase). */
    brand: z.string().optional(),
    /** Nav link labels; the LAST item becomes the filled primary pill CTA. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Marcus Chen'
    const nav = props.nav?.length
      ? props.nav
      : ['Work', 'Services', 'About', 'Get in Touch']
    return (
      <SiteNav
        position="fixed"
        height="compact"
        rowClassName="md:h-20"
        className={cn('bg-background/90 backdrop-blur-sm', props.className)}
      >
        <NavbarBrand href={brand} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel className="text-lg font-extrabold uppercase tracking-tight md:text-xl" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-6 lg:gap-8">
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-1 font-mono text-[11px] uppercase tracking-[0.2em]"
            >
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta
            variant="dark"
            href={nav[nav.length - 1]}
            className="rounded-none px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-transform duration-150 active:translate-y-px motion-reduce:transform-none"
          >
            {nav[nav.length - 1]}
          </NavbarCta>
        </NavbarNav>

        <MobileNavDrawer
          brand={brand}
          nav={nav}
          homeTarget={nav[0]}
          cta={{
            label: nav[nav.length - 1],
            target: nav[nav.length - 1],
          }}
          label="Menu"
          buttonClassName="p-2 md:hidden"
        />
      </SiteNav>
    )
  },
})
