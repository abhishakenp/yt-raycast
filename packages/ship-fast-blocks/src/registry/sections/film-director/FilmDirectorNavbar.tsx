import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * FilmDirectorNavbar — fixed, backdrop-blurred top navigation bar for a film
 * director / cinematographer / DP portfolio. A border-bottomed translucent
 * header pinned to the top with the director's UPPERCASE name on the left, a
 * row of thin minimal text links on the right (desktop), the LAST nav item
 * rendered as a filled primary pill CTA, and a hamburger menu button on mobile.
 * Every link and CTA routes through useNavigate. Use as the sticky site header
 * for filmmakers, directors, cinematographers, DPs, or video production houses
 * wanting a clean, editorial, light-canvas aesthetic.
 */
export const FilmDirectorNavbar = defineCapsule({
  name: 'FilmDirectorNavbar',
  description:
    "Fixed, backdrop-blurred top navigation bar for a film director / cinematographer / DP portfolio: a border-bottomed translucent header with the director's UPPERCASE name on the left, a row of thin minimal text links on the right (desktop), the last nav item rendered as a filled primary pill CTA, and a hamburger menu button on mobile. All links and CTAs route through useNavigate. Use as the sticky site header for filmmakers, directors, cinematographers, DPs, or video production houses wanting a clean, editorial, light-canvas aesthetic.",
  props: z.object({
    /** Director / studio name shown in the navbar (rendered uppercase). */
    brand: z.string().optional(),
    /** Nav link labels; the LAST item becomes the filled primary pill CTA. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
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
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(brand)}
            className="inline-flex items-center text-lg font-medium tracking-tight md:text-xl"
          >
            <BrandLogo
              brand={brand}
              className="mr-2 size-7"
              showLabel={false}
            />
            {brand.toUpperCase()}
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              onClick={() => go(label)}
              className="font-normal"
            >
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta
            variant="primary"
            onClick={() => go(nav[nav.length - 1])}
            className="rounded-md px-4 py-2"
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
