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
import { SignInButton } from '#/section-kit/SignInButton.tsx'
import {
  InquiryAccountButton,
  InquiryActionBadge,
  InquiryActionButton,
  InquiryMobileMenu,
  InquiryMutationSpinner,
} from './inquiry-interactions.tsx'
import { inquiryLakebed } from './inquiry-lakebed.ts'

/**
 * ContactNavbar — hairline editorial sticky top navigation bar for a contact /
 * support page. A blurred, border-bottomed header pinned to the top with a
 * squared inverted orbit-glyph logo tile + brand name on the left, mono
 * uppercase micro-label nav links in the center (desktop), a Shoo account
 * dropdown in a squared hairline chip, a Lakebed-backed inverted primary CTA
 * with press feedback, and a real mobile Sheet menu on the right. Nav links
 * route through route hrefs so labels drive page-switching, while contact
 * actions stay in scoped Lakebed state. Use as the sticky site header for
 * SaaS, agency, or startup contact pages. Renders fully with no props via
 * baked-in "Orbit Digital" defaults.
 */
export const ContactNavbar = defineCapsule({
  name: 'ContactNavbar',
  description:
    'Hairline editorial sticky top navigation bar for a contact / support page: a blurred, border-bottomed header with a squared inverted orbit-glyph logo tile + brand name on the left, mono uppercase micro-label nav links in the center (desktop), Shoo profile dropdown in a squared hairline chip, scoped Lakebed inverted CTA with press feedback, and real Sheet hamburger menu. Nav links route through route hrefs while inquiry actions stay in Lakebed state. Use as the sticky site header for SaaS, agency, or startup contact pages.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels rendered as center links. */
    nav: z.array(z.string()).optional(),
    /** Target routed to when the brand logo / name is clicked. */
    homeTarget: z.string().optional(),
    /** CTA button label. */
    ctaLabel: z.string().optional(),
    /** Target routed to when the CTA is clicked. */
    ctaTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Orbit Digital'
    const nav = props.nav?.length
      ? props.nav
      : ['Home', 'Features', 'Pricing', 'About', 'Contact']
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Home'
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const signIn = props.signIn ?? 'Sign in'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-7 place-items-center rounded-none bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <ellipse cx="12" cy="12" rx="10" ry="4.5" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
        containerClassName="max-w-[1160px] px-6"
      >
        <NavbarBrand
          href={homeTarget}
          className="gap-2 text-lg font-extrabold tracking-tight text-foreground"
        >
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" fallback={<LogoMark />} />
            <LogoLabel />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav
          className="gap-7 font-mono text-[11px] font-medium uppercase tracking-[0.18em]"
          asChild
        >
          <ul>
            {nav.map((label) => (
              <li key={label}>
                <NavbarNavLink href={label} className="hover:text-foreground">
                  {label}
                </NavbarNavLink>
              </li>
            ))}
          </ul>
        </NavbarNav>

        <NavbarActions className="gap-3">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <InquiryActionBadge lakebed={lakebed} />
          <InquiryAccountButton
            lakebed={lakebed}
            buttonClassName="grid size-10 place-items-center rounded-none border border-border bg-background text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          />
          <InquiryActionButton
            lakebed={lakebed}
            label={ctaLabel}
            target={ctaTarget}
            source="navbar"
            pendingChildren={
              <>
                <InquiryMutationSpinner />
                Saving
              </>
            }
            className="hidden items-center gap-2 rounded-none bg-foreground px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-colors hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {ctaLabel}
          </InquiryActionButton>
          <InquiryMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            ctaLabel={ctaLabel}
            ctaTarget={ctaTarget}
            lakebed={lakebed}
            buttonClassName="grid size-10 place-items-center rounded-none border border-border bg-background text-muted-foreground transition-colors hover:border-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
