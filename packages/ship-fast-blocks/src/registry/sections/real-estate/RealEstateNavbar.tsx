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
 * RealEstateNavbar — confident top navigation for a premium brokerage site. A
 * sticky bordered-bottom bar holds a serif wordmark on the left, a centered
 * inline nav (Buy / Sell / Rent / Agents / Contact) on desktop, and a right
 * cluster with a phone link plus a filled "List a Property" primary CTA. The
 * wordmark, every nav item, the phone link, and the CTA all route through
 * useNavigate. Use as the site header for real-estate brokerages, agent teams,
 * and luxury property firms. Renders fully with no props via baked defaults.
 */
export const RealEstateNavbar = defineCapsule({
  name: 'RealEstateNavbar',
  description:
    "Confident sticky top navigation for a premium real-estate brokerage: a serif wordmark on the left, a centered Buy / Sell / Rent / Agents / Contact inline nav on desktop, and a right cluster with a phone link plus a filled 'List a Property' primary CTA. Wordmark, nav items, phone, and CTA route through useNavigate. Use as the site header for brokerages, agent teams, and luxury property firms.",
  props: z.object({
    /** Serif brand wordmark on the left. */
    brand: z.string().optional(),
    /** Primary navigation labels. */
    links: z.array(z.string()).optional(),
    /** Phone number shown on the right. */
    phone: z.string().optional(),
    /** Filled primary CTA label. */
    cta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.links?.length
      ? props.links
      : ['Buy', 'Sell', 'Rent', 'Agents', 'Contact']
    const brand = props.brand ?? 'Marbury & Co.'
    const phone = props.phone ?? '(415) 555-0148'
    const cta = props.cta ?? 'List a Property'
    const ctaTarget = props.ctaTarget ?? 'List'
    const homeTarget = 'Home'
    const go = useNavigate()

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            <Logo
              brand={brand}
              labelClassName="font-serif text-xl font-semibold tracking-tight"
            />
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
            {cta}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: cta, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
