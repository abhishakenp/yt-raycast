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
import { newsletterLakebed } from './newsletter-lakebed.ts'
import {
  NewsletterAccountButton,
  NewsletterMobileMenu,
  NewsletterSubscribeDrawer,
} from './newsletter-interactions.tsx'

/**
 * NewsletterNavbar — sticky, backdrop-blurred masthead bar for an editorial
 * newsletter / subscription site, styled newsprint-lite: a square (rounded-none)
 * serif initial-mark nameplate + serif publication wordmark sit on the left; on
 * desktop the remaining nav labels render as quiet text links with the final
 * label promoted to a square, hairline-outlined mono uppercase "Subscribe"
 * button (fills to bg-foreground with press feedback on hover) on the right; on
 * mobile a square hamburger button opens a sheet drawer. Clean paper-toned
 * surface with restrained newspaper structure. Every item routes through route
 * hrefs for page-switching. Use as the sticky site header for newsletters,
 * Substack-style publications, blogs, essayists, or content creators. Renders
 * fully with no props via baked-in defaults.
 */
export const NewsletterNavbar = defineCapsule({
  name: 'NewsletterNavbar',
  description:
    "Sticky, backdrop-blurred newsprint-lite masthead bar for an editorial newsletter / subscription site: a square (rounded-none) serif initial-mark nameplate + serif publication wordmark on the left, quiet text nav links in the center, and the final nav label promoted to a square hairline-outlined mono uppercase 'Subscribe' button that fills to bg-foreground with press feedback on the right (desktop); a square hamburger sheet-drawer button on mobile. Clean paper-toned surface with restrained newspaper structure. Items route through route hrefs for page-switching. Use as the sticky site header for newsletters, Substack-style publications, blogs, essayists, digests, or content creators.",
  props: z.object({
    /** Brand / publication name shown beside the serif logo mark. */
    brand: z.string().optional(),
    /** Nav link labels; the last becomes the outlined CTA pill (must match site routes). */
    nav: z.array(z.string()).optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'The Quiet Observer'
    const nav = props.nav?.length
      ? props.nav
      : ['Recent Issues', 'About', 'Subscribe']

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-foreground font-serif font-medium text-background',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80', props.className)}
        containerClassName="max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand href={brand} className="group">
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7 text-sm" />}
            />
            <LogoLabel className="font-serif text-xl font-medium tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
          <NewsletterAccountButton
            lakebed={lakebed}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          />
          <NewsletterSubscribeDrawer
            lakebed={lakebed}
            buttonLabel={nav[nav.length - 1] ?? 'Subscribe'}
            source="navbar"
            buttonClassName="rounded-none border border-foreground/70 px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-foreground transition-[transform,background-color,color] duration-150 hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
          />
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <NewsletterMobileMenu
            brand={brand}
            homeTarget={brand}
            nav={nav}
            buttonClassName="inline-flex size-10 items-center justify-center rounded-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
