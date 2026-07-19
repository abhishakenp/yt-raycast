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
  SignInButton,
} from '#/section-kit/index.ts'

/**
 * CommunityForumNavbar — sticky translucent top navigation bar for a
 * community-platform / discussion-forum marketing site. Blurred, border-bottomed
 * header with a brand mark + product name on the left, a horizontal row of nav
 * links on desktop, and a sign-in text button + primary CTA button on the right.
 * Every link and the CTA route through route hrefs. Use as the sticky site header
 * for community platforms, SaaS forums, knowledge bases, or membership networks.
 */
export const CommunityForumNavbar = defineCapsule({
  name: 'CommunityForumNavbar',
  description:
    'Sticky translucent top navigation bar for a community-platform / discussion-forum marketing site: blurred, border-bottomed header with a brand mark + product name on the left, a horizontal row of nav links on desktop, and a sign-in text button + primary CTA button on the right. Every link and the CTA route through route hrefs. Use as the sticky site header for community platforms, SaaS forums, knowledge bases, or membership networks.',
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    signIn: z.string().optional(),
    cta: z.string().optional(),
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Forum'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Pricing', 'Docs', 'Community']
    const homeTarget = props.homeTarget ?? 'Home'
    const signIn = props.signIn ?? 'Sign In'
    const navCta = props.cta ?? 'Get Started'

    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <circle cx="8" cy="16" r="3" />
        <circle cx="16" cy="16" r="3" />
        <circle cx="24" cy="16" r="3" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
        containerClassName="max-w-6xl"
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand}>
            <LogoImage
              fallback={<BrandMark className="size-8 text-foreground" />}
            />
            <LogoLabel className="text-xl font-semibold text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden text-sm font-medium sm:inline-flex"
          />
          <NavbarCta variant="primary" href={navCta}>
            {navCta}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: navCta, target: navCta }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
