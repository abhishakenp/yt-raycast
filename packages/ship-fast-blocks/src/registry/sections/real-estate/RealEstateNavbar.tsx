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
import { SignInButton } from '#/section-kit/SignInButton.tsx'
/**
 * RealEstateNavbar — editorial-listings top navigation for a luxury brokerage.
 * A fixed, hairline-bottomed, backdrop-blurred bar carries a squared serif
 * brand-initial mark beside a serif wordmark on the left, a centered inline nav
 * (Buy / Sell / Rent / Agents / Contact) on desktop, and a right cluster with a
 * mono uppercase phone number plus a sharp-cornered "List a Property" CTA
 * (bg-foreground, mono lettering, press feedback). The wordmark, every nav item,
 * the phone link, and the CTA all route through route hrefs. A Sheet drawer
 * carries the nav on mobile. Use as the site header for real-estate brokerages,
 * agent teams, and luxury property firms. Renders fully with no props via baked
 * defaults.
 */
export const RealEstateNavbar = defineCapsule({
  name: 'RealEstateNavbar',
  description:
    "Editorial-listings sticky top navigation for a luxury real-estate brokerage: a squared serif brand-initial mark beside a serif wordmark on the left, a centered Buy / Sell / Rent / Agents / Contact inline nav on desktop, and a right cluster with a mono uppercase phone number plus a sharp-cornered bg-foreground 'List a Property' CTA with mono lettering and press feedback. Wordmark, nav items, phone, and CTA route through route hrefs; a Sheet drawer carries the nav on mobile. Use as the site header for brokerages, agent teams, and luxury property firms.",
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
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
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
    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-border bg-background/85 backdrop-blur-xl',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="gap-2.5">
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage
              className="size-8"
              fallback={
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-none bg-foreground font-serif text-sm text-background"
                >
                  {brand.charAt(0).toUpperCase()}
                </span>
              }
            />
            <LogoLabel className="font-serif text-xl font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label} className="text-sm">
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground lg:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="dark"
            className="hidden rounded-none px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px sm:inline-flex"
            href={ctaTarget}
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
