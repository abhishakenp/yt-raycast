import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import {
  AutoAccountButton,
  AutoLeadActionButton,
  AutoLeadBadge,
  AutoMobileMenu,
  AutoMutationSpinner,
  AutoSearchButton,
} from './auto-dealership-interactions.tsx'
import { autoDealershipLakebed } from './auto-dealership-lakebed.ts'

/**
 * AutoDealershipNavbar — sticky, backdrop-blurred showroom-kinetic top
 * navigation bar for an auto dealership / used-car site. A hairline
 * border-bottomed header pinned to the top with an uppercase italic font-black
 * wordmark brand on the left, hard uppercase letter-spaced nav links in the
 * center (desktop), plus vehicle search, Shoo account, latest lead badge, a
 * mono tabular phone link and a skewed parallelogram primary "Book Test Drive"
 * CTA with press feedback on the right. Nav links route through route hrefs;
 * phone and CTA write Lakebed lead/test-drive intents. Use as the sticky site
 * header for car dealerships, used-car lots, certified pre-owned sellers, auto
 * sales groups, or EV/hybrid showrooms. Renders fully with no props via
 * baked-in "Meridian Motors" defaults.
 */
export const AutoDealershipNavbar = defineCapsule({
  name: 'AutoDealershipNavbar',
  description:
    "Sticky backdrop-blurred showroom-kinetic top navigation bar for an auto dealership / used-car site: a hairline border-bottomed header pinned to the top with an uppercase italic font-black wordmark brand on the left, hard uppercase letter-spaced nav links in the center (desktop), and vehicle command search, Shoo account dropdown, latest lead badge, mono tabular phone action, a skewed parallelogram primary 'Book Test Drive' CTA with press feedback, and Sheet mobile menu on the right. Nav links route through route hrefs; phone and CTA write Lakebed lead/test-drive intents. Use as the sticky site header for car dealerships, used-car lots, certified pre-owned sellers, auto sales groups, or EV/hybrid showrooms.",
  props: z.object({
    /** Dealership brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Nav link labels; the first item also drives the brand/home target. */
    nav: z.array(z.string()).optional(),
    /** Phone number shown as a routable link (desktop). */
    phone: z.string().optional(),
    /** Solid primary CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: autoDealershipLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Meridian Motors'
    const nav = props.nav?.length
      ? props.nav
      : ['Inventory', 'Financing', 'About', 'Reviews', 'FAQ']
    const phone = props.phone ?? '(555) 0127-456'
    const cta = props.cta ?? 'Book Test Drive'

    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn(
          'border-b border-border bg-background/90',
          props.className,
        )}
      >
        <NavbarBrand
          href={nav[0]}
          className="gap-2 text-lg font-black uppercase italic tracking-tight text-foreground lg:text-xl"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-xs font-bold uppercase tracking-[0.15em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <AutoLeadBadge lakebed={lakebed} />
          <AutoSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <AutoAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <AutoLeadActionButton
            lakebed={lakebed}
            action="call"
            label={phone}
            intentKey="navbar-phone"
            source="navbar"
            className="hidden font-mono text-xs font-semibold tracking-tight text-muted-foreground transition-colors tabular-nums hover:text-foreground sm:block"
          >
            {phone}
          </AutoLeadActionButton>
          <AutoLeadActionButton
            lakebed={lakebed}
            action="test_drive"
            label={cta}
            intentKey="navbar-test-drive"
            source="navbar"
            pendingChildren={
              <span className="inline-flex skew-x-12 items-center gap-2">
                <AutoMutationSpinner />
                Sending
              </span>
            }
            className="hidden -skew-x-12 items-center justify-center gap-2 rounded-none bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            <span className="inline-block skew-x-12">{cta}</span>
          </AutoLeadActionButton>
          <AutoMobileMenu
            brand={brand}
            ctaLabel={cta}
            homeTarget={nav[0]}
            lakebed={lakebed}
            nav={nav}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
