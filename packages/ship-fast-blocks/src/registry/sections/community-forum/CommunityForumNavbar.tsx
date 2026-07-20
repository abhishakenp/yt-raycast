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
 * CommunityForumNavbar — sticky translucent playful-geometric top navigation
 * bar for a community-platform / discussion-forum marketing site. Blurred,
 * border-bottomed header with a three-dot brand mark + bold product name on
 * the left, a row of mono uppercase micro-label nav links on desktop, and a
 * sign-in text button + rounded-full primary CTA pill with a hard offset
 * shadow and press feedback on the right. Every link and the CTA route
 * through route hrefs. Use as the sticky site header for community platforms,
 * SaaS forums, knowledge bases, or membership networks.
 */
export const CommunityForumNavbar = defineCapsule({
  name: 'CommunityForumNavbar',
  description:
    'Sticky translucent playful-geometric top navigation bar for a community-platform / discussion-forum marketing site: blurred, border-bottomed header with a three-dot brand mark + bold product name on the left, a row of mono uppercase micro-label nav links on desktop, and a sign-in text button + rounded-full primary CTA pill with hard offset shadow and press feedback on the right. Every link and the CTA route through route hrefs. Use as the sticky site header for community platforms, SaaS forums, knowledge bases, or membership networks.',
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
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              fallback={<BrandMark className="size-7 text-foreground" />}
              className="size-7"
            />
            <LogoLabel className="text-xl font-extrabold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-6">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
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
          <NavbarCta
            variant="primary"
            href={navCta}
            className="rounded-full px-5 font-semibold shadow-[3px_3px_0_0] shadow-foreground/20 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-px active:shadow-none"
          >
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
