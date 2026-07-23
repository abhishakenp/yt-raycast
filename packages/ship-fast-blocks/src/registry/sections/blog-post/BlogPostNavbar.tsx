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
  PublicationAccountButton,
  PublicationMobileMenu,
  PublicationSearchButton,
  PublicationSubscribeDrawer,
} from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

/**
 * BlogPostNavbar — sticky newsprint masthead bar for a single-article /
 * editorial blog page. A feather / pen mark beside a serif bold wordmark on
 * the left, centered mono small-caps nav links, command article search, a Shoo
 * profile dropdown, a Lakebed subscribe drawer behind a square hairline
 * "Subscribe" chip that inverts to solid ink on hover, and a real mobile
 * drawer on small screens — all closed by a double-ruled bottom edge. Use as
 * the sticky site header for a blog post, magazine article, journal, or any
 * editorial publication detail page. Renders fully with no props via baked-in
 * defaults.
 */
function FeatherMark({ className }: { className?: string }) {
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
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <path d="M16 8 2 22" />
      <path d="M17.5 15H9" />
    </svg>
  )
}

export const BlogPostNavbar = defineCapsule({
  name: 'BlogPostNavbar',
  description:
    'Sticky newsprint masthead bar for a single-article / editorial blog page: a feather/pen mark beside a serif bold wordmark, centered mono small-caps nav links, command article search, a Shoo profile dropdown, a Lakebed subscribe drawer behind a square hairline chip that inverts to solid ink on hover, and a real mobile drawer on small screens, closed by a double-ruled bottom edge. Use as the sticky site header for a blog post, magazine article, journal, or any editorial publication detail page.',
  props: z.object({
    /** Publication / brand name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label for the subscribe CTA on the right. */
    subscribeCta: z.string().optional(),
    /** Navigation target for the logo / brand click (defaults to first nav item). */
    homeTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Home', 'Articles', 'Topics', 'About']
    const brand = props.brand ?? 'The Editorial'
    const homeTarget = props.homeTarget ?? nav[0]
    const subscribeCta = props.subscribeCta ?? 'Subscribe'
    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b-[3px] border-foreground/40 bg-background/95 [border-bottom-style:double]',
          props.className,
        )}
        containerClassName="max-w-5xl px-6 lg:px-8"
      >
        <NavbarBrand href={homeTarget} className="min-w-0 gap-3">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              fallback={<FeatherMark className="size-6 text-primary" />}
            />
            <LogoLabel className="truncate font-serif text-xl font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-[11px] uppercase tracking-[0.16em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <PublicationSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <PublicationAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <PublicationSubscribeDrawer
            lakebed={lakebed}
            buttonLabel={subscribeCta}
            source="blog post navbar"
            buttonClassName="hidden rounded-none border border-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background active:translate-y-px sm:inline-flex"
          />
          <PublicationMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
