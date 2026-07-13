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
 * WebinarNavbar — sticky site header for a live webinar or virtual event.
 * Thin configuration over the shared `SiteNav` composite: a semibold wordmark
 * beside an inline broadcast/calendar mark, centered nav links on desktop, a
 * high-contrast "Register" CTA, and a real mobile drawer on small screens. Use
 * as the header for webinars, summits, masterclasses, product launches, or any
 * registration-driven event landing page. Renders fully with no props.
 */
function BroadcastMark({ className }: { className?: string }) {
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  )
}

export const WebinarNavbar = defineCapsule({
  name: 'WebinarNavbar',
  description:
    "Sticky webinar/virtual-event site header built on the shared SiteNav composite: a semibold wordmark + broadcast-calendar mark, centered desktop nav links (Overview, Agenda, Speakers, FAQ), a high-contrast 'Register' CTA, and a real mobile drawer. Use as the header for webinars, summits, masterclasses, product launches, or any registration-driven event landing page.",
  props: z.object({
    /** Brand / event host name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
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
      : ['Overview', 'Agenda', 'Speakers', 'FAQ']
    const go = useNavigate()
    const brand = props.brand ?? 'Catalyst Labs'
    const brandMark = <BroadcastMark className="size-8 text-primary" />
    const brandClassName = 'font-semibold tracking-tight'
    const ctaLabel = props.ctaLabel ?? 'Register'
    const ctaTarget = props.ctaTarget ?? 'Register'
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
