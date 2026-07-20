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
} from '#/section-kit/SiteNav.tsx'
/**
 * ManufacturingNavbar — sticky, heavy-industrial top navigation bar for a
 * precision-manufacturing / industrial-fabrication B2B site. A backdrop-blurred
 * header pinned to the top with a thick foreground bottom rule: a hard-bordered
 * square initials slab (two-letter mark) plus an extrabold uppercase wordmark on
 * the left, mono-uppercase nav links in the center, and a squared, hard-bordered
 * foreground CTA slab with mechanical press feedback on the right (desktop), plus
 * a hamburger menu on mobile. Every link and the CTA route through route hrefs so
 * labels can drive page-switching; the CTA uses the last nav item. Tech-brutalist,
 * industrial, binary-radius. Use as the sticky site header for CNC machine shops,
 * metal fabricators, contract manufacturers or industrial engineering firms.
 * Renders fully with no props via baked-in "Vertex Manufacturing" defaults.
 */
export const ManufacturingNavbar = defineCapsule({
  name: 'ManufacturingNavbar',
  description:
    'Sticky heavy-industrial top navigation bar for a precision-manufacturing / industrial-fabrication B2B site: backdrop-blurred header with a thick foreground bottom rule, a hard-bordered square initials slab plus an extrabold uppercase wordmark on the left, mono-uppercase nav links in the center, and a squared hard-bordered foreground CTA slab with mechanical press feedback on the right (desktop), plus a hamburger menu on mobile. Links and CTA route through route hrefs for page-switching; the CTA uses the last nav item. Tech-brutalist, industrial, binary-radius. Use as the sticky site header for CNC machine shops, metal fabricators, contract manufacturers or industrial engineering firms.',
  props: z.object({
    /** Brand / company name shown in the navbar; initials tile derives from it. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching); last item is the CTA. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vertex Manufacturing'
    const nav = props.nav?.length
      ? props.nav
      : [
          'Capabilities',
          'Industries',
          'Process',
          'Work',
          'Clients',
          'Get a Quote',
        ]
    const brandInitials = brand
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('')
    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn(
          'border-b-2 border-foreground bg-background/95',
          props.className,
        )}
      >
        <NavbarBrand
          href={nav[0]}
          className="flex items-center gap-2"
          aria-label={`${brand} Home`}
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={
                <span
                  aria-hidden="true"
                  className="grid size-7 place-items-center rounded-none border-2 border-foreground bg-foreground font-mono text-xs font-bold text-background"
                >
                  {brandInitials}
                </span>
              }
            />
            <LogoLabel className="text-lg font-extrabold uppercase tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none font-mono text-xs uppercase tracking-[0.12em]"
            >
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta
            variant="dark"
            href={nav[nav.length - 1]}
            className="rounded-none border-2 border-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] transition-[transform] duration-150 active:translate-x-[2px] active:translate-y-[2px] motion-reduce:transform-none"
          >
            {nav[nav.length - 1]}
          </NavbarCta>
        </NavbarNav>

        <NavbarActions>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            cta={{
              label: nav[nav.length - 1],
              target: nav[nav.length - 1],
            }}
            buttonClassName="p-2 text-muted-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
