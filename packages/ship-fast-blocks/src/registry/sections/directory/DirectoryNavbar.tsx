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
import { directoryLakebed } from './directory-lakebed.ts'
import {
  DirectoryAccountButton,
  DirectoryLeadButton,
  DirectoryMobileMenu,
  DirectoryMutationSpinner,
  DirectorySearchButton,
} from './directory-interactions.tsx'

/**
 * DirectoryNavbar — newsprint masthead navigation for a local-business
 * directory / listings site. A paper-surface sticky header with a location-pin
 * glyph + serif wordmark on the left, mono uppercase index-style category
 * links in the center, and a right-side cluster of square hairline search /
 * account chips plus a sharp-cornered primary "List Your Business" stamp CTA
 * with press feedback. Every link and CTA routes through route hrefs; links
 * beyond the fifth demote to large screens. Use as the site header for local
 * directories, business-listing marketplaces, find-a-service platforms,
 * review-and-discovery sites, or city guides.
 */
export const DirectoryNavbar = defineCapsule({
  name: 'DirectoryNavbar',
  description:
    'Newsprint masthead navigation for a local-business DIRECTORY / listings site: a paper-surface sticky header with a location-pin glyph plus serif wordmark on the left, mono uppercase index-style category links in the center, and a right-side cluster of square hairline search and account chips plus a sharp-cornered primary List Your Business CTA with press feedback. Every link and CTA routes through route hrefs. Use as the site header for local directories, business-listing marketplaces, find-a-service / find-a-pro platforms, review-and-discovery sites, city guides, or yellow-pages-style apps.',
  props: z.object({
    /** Brand / directory name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Sign-in link label. */
    signIn: z.string().optional(),
    /** Primary CTA label. */
    listCta: z.string().optional(),
    /** Navigation target for the brand logo. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: directoryLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'LocalFindr'
    const nav = props.nav?.length
      ? props.nav
      : ['Categories', 'Featured', 'How It Works', 'Pricing']
    const signIn = props.signIn ?? 'Sign In'
    const listCta = props.listCta ?? 'List Your Business'
    const homeTarget = props.homeTarget ?? nav[0]
    const PinLogo = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background', props.className)}
      >
        <NavbarBrand href={homeTarget}>
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<PinLogo className="size-7 text-foreground" />}
            />
            <LogoLabel className="font-serif text-xl font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-1">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                'rounded-none font-mono text-[11px] uppercase tracking-[0.14em]',
                i >= 5 && 'hidden lg:inline-flex',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-2 sm:gap-3">
          <DirectorySearchButton
            lakebed={lakebed}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px"
          />
          <DirectoryAccountButton
            lakebed={lakebed}
            label={signIn}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px sm:inline-flex"
          />
          <DirectoryLeadButton
            lakebed={lakebed}
            action={listCta}
            source="navbar"
            pendingChildren={<DirectoryMutationSpinner />}
            className="hidden min-h-9 items-center justify-center whitespace-nowrap rounded-none bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 md:inline-flex"
          >
            {listCta}
          </DirectoryLeadButton>
          <DirectoryMobileMenu
            brand={brand}
            homeTarget={homeTarget}
            nav={nav}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
