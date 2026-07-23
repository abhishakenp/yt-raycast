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
 * MarketingAgencyNavbar — sticky kinetic top navigation bar for a growth /
 * digital marketing-agency site. A backdrop-blurred, hairline-bottomed header
 * pinned to the top with a layered-diamond brand glyph beside the agency name on
 * the left, mono uppercase nav links on the right, and a square hard-offset-shadow
 * primary CTA with mechanical press feedback (desktop); a hamburger menu button
 * on mobile. The last nav item drives the CTA target; every link routes through
 * route hrefs for page-switching. Use as the sticky site header for marketing /
 * growth agencies, SEO / paid-ads shops, lead-gen consultancies, or B2B SaaS
 * growth firms. Renders fully with no props.
 */
export const MarketingAgencyNavbar = defineCapsule({
  name: 'MarketingAgencyNavbar',
  description:
    'Sticky kinetic top navigation bar for a growth / digital marketing-agency site: a backdrop-blurred, hairline-bottomed header pinned to the top with a layered-diamond brand glyph + agency name on the left, mono uppercase nav links and a square hard-offset-shadow primary CTA with mechanical press feedback on the right (desktop), and a hamburger menu button on mobile. The last nav item drives the CTA target; links route through route hrefs for page-switching. Use as the sticky site header for marketing / growth agencies, SEO / paid-ads shops, lead-gen consultancies, or B2B SaaS growth firms.',
  props: z.object({
    /** Agency / brand name shown beside the logo glyph. */
    brand: z.string().optional(),
    /** Nav link labels; last item also drives the pill CTA target. */
    nav: z.array(z.string()).optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nexus Growth'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Case Studies', 'Pricing', 'FAQ', 'Get Started']
    const navCta = nav[nav.length - 1]
    const signIn = props.signIn ?? 'Sign in'
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand href={nav[0]} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-lg font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-xs uppercase tracking-[0.14em]"
            >
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta
            variant="primary-pill"
            href={navCta}
            className="rounded-none px-4 py-2 text-sm font-semibold shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
          >
            {navCta}
          </NavbarCta>
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            cta={{
              label: navCta,
              target: navCta,
            }}
            label="Menu"
            buttonClassName="p-2 text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
