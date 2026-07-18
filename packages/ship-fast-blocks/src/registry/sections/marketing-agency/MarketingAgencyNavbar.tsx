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
} from '#/section-kit/index.ts'

/**
 * MarketingAgencyNavbar — sticky, translucent top navigation bar for a growth /
 * digital marketing-agency site. A backdrop-blurred, border-bottomed header
 * pinned to the top with a layered-diamond brand glyph beside the agency name on
 * the left, horizontal nav links plus a rounded pill primary CTA on the right
 * (desktop), and a hamburger menu button on mobile. The last nav item drives the
 * CTA target; every link routes through route hrefs for page-switching. Use as
 * the sticky site header for marketing / growth agencies, SEO / paid-ads shops,
 * lead-gen consultancies, or B2B SaaS growth firms. Renders fully with no props.
 */
export const MarketingAgencyNavbar = defineCapsule({
  name: 'MarketingAgencyNavbar',
  description:
    'Sticky translucent top navigation bar for a growth / digital marketing-agency site: backdrop-blurred, border-bottomed header pinned to the top with a layered-diamond brand glyph + agency name on the left, horizontal nav links and a rounded pill primary CTA on the right (desktop), and a hamburger menu button on mobile. The last nav item drives the CTA target; links route through route hrefs for page-switching. Use as the sticky site header for marketing / growth agencies, SEO / paid-ads shops, lead-gen consultancies, or B2B SaaS growth firms.',
  props: z.object({
    /** Agency / brand name shown beside the logo glyph. */
    brand: z.string().optional(),
    /** Nav link labels; last item also drives the pill CTA target. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nexus Growth'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Case Studies', 'Pricing', 'FAQ', 'Get Started']
    const navCta = nav[nav.length - 1]
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
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={nav[0]} className="gap-2">
          <BrandLogo brand={brand}>
            <LogoImage
              fallback={<LogoMark className="size-8 text-foreground" />}
            />
            <LogoLabel className="text-lg font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
          <NavbarCta variant="primary-pill" href={navCta} className="px-4 py-2">
            {navCta}
          </NavbarCta>
        </NavbarNav>

        <NavbarActions>
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
