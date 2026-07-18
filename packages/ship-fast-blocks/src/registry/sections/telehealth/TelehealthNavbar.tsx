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
} from '#/section-kit/index.ts'

export const TelehealthNavbar = defineCapsule({
  name: 'TelehealthNavbar',
  description:
    "Sticky top navigation header for a telehealth / virtual care site, built on the shared SiteNav composite. Renders a calm medical brand mark (heart-pulse glyph in primary), the brand name, a row of section links (How it works, Services, Pricing, Reviews, FAQ), an optional click-to-call phone number, and a prominent 'Book a Visit' CTA that routes to the contact page. Includes a real mobile drawer for small screens. Use as the first band of any telehealth page so visitors can immediately reach booking, pricing, or support.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'MendWell'
    const nav = props.nav?.length
      ? props.nav
      : ['How it works', 'Services', 'Pricing', 'Reviews', 'FAQ']
    const phone = props.phone ?? '(800) 555-0142'
    const ctaLabel = props.ctaLabel ?? 'Book a Visit'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const homeTarget = props.homeTarget ?? 'Home'
    const brandClassName = 'text-xl font-medium text-foreground'

    const brandMark = (
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12h4l2 5 4-12 2 7h6" />
        </svg>
      </span>
    )

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          {brandMark}
          <Logo brand={brand}>
            <LogoImage />
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
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
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
