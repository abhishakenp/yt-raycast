import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

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
 * WriterAuthorNavbar — sticky site header for a literary author or novelist
 * site with a serif, letterpress sensibility. Thin configuration over the
 * shared `SiteNav` composite (backdrop blur intact): a serif wordmark beside an
 * inline open-book feather mark, centered nav links on desktop, an optional
 * mono press/agent phone number, a rounded-none "Get the Book" CTA that routes
 * to the Books page and presses in on click, and a real mobile drawer on small
 * screens. Use as the header for author landing pages, book-launch microsites,
 * poets, essayists, or any writer's personal brand where the new release
 * matters. Renders fully with no props via baked-in "Eleanor Vance" defaults.
 */
function FeatherMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 4C10 5 7 11 7 17l-3 3" />
      <path d="M20 4c0 6-3 12-13 13" />
      <path d="M11 14h5" />
      <path d="M9 18h5" />
    </svg>
  )
}

export const WriterAuthorNavbar = defineCapsule({
  name: 'WriterAuthorNavbar',
  description:
    "Sticky author / novelist site header with a serif, letterpress feel, built on the shared SiteNav composite (backdrop blur intact): serif wordmark + an open-book feather mark, centered desktop nav links, an optional mono press phone number, a rounded-none 'Get the Book' CTA routing to the Books page, and a real mobile drawer. Use as the header for author landing pages, book-launch microsites, poets, essayists, or any writer's personal brand.",
  props: z.object({
    /** Author / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Press / agent phone number shown on the right (desktop). */
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
    const nav = props.nav?.length
      ? props.nav
      : ['Books', 'About', 'Reviews', 'Newsletter']
    const brand = props.brand ?? 'Eleanor Vance'
    const brandMark = <FeatherMark className="size-7 text-primary" />
    const brandClassName = 'font-serif text-xl font-medium tracking-tight'
    const phone = props.phone ?? '(212) 555-0148'
    const ctaLabel = props.ctaLabel ?? 'Get the Book'
    const ctaTarget = props.ctaTarget ?? 'Books'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="flex items-center gap-2">
          <Logo brand={brand}>
            <LogoImage className="size-7" fallback={brandMark} />
            <LogoLabel className={brandClassName} />
          </Logo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground sm:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 transition-transform duration-100 active:translate-y-px sm:inline-flex"
            href={ctaTarget}
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
