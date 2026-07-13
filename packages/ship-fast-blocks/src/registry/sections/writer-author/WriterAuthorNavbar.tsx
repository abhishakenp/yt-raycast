import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo } from '#/section-kit/Logo.tsx'
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
 * WriterAuthorNavbar — sticky site header for a literary author or novelist
 * site with a serif, letterpress sensibility. Thin configuration over the
 * shared `SiteNav` composite: a serif wordmark beside an inline open-book /
 * feather mark, centered nav links on desktop, an optional press/agent phone
 * number, a "Get the Book" CTA that routes to the Books page, and a real
 * mobile drawer on small screens. Use as the header for author landing pages,
 * book-launch microsites, poets, essayists, or any writer's personal brand
 * where the new release matters. Renders fully with no props via baked-in
 * "Eleanor Vance" defaults.
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
    "Sticky author / novelist site header with a serif, letterpress feel, built on the shared SiteNav composite: serif wordmark + an open-book feather mark, centered desktop nav links, an optional press phone number, a 'Get the Book' CTA routing to the Books page, and a real mobile drawer. Use as the header for author landing pages, book-launch microsites, poets, essayists, or any writer's personal brand.",
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
    const go = useNavigate()
    const brand = props.brand ?? 'Eleanor Vance'
    const brandMark = <FeatherMark className="size-8 text-primary" />
    const brandClassName = 'font-serif text-xl font-medium'
    const phone = props.phone ?? '(212) 555-0148'
    const ctaLabel = props.ctaLabel ?? 'Get the Book'
    const ctaTarget = props.ctaTarget ?? 'Books'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            {brandMark}
            <Logo brand={brand} labelClassName={brandClassName} />
          </button>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
            onClick={() => go(ctaTarget)}
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
