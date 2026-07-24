import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarRouteLink,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import {
  PublicationAccountButton,
  PublicationMobileMenu,
  PublicationSearchButton,
  PublicationSubscribeDrawer,
} from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

/**
 * NewsroomNavbar — full newsprint masthead bar for a digital newsroom or online
 * magazine. Three stacked tiers with real newspaper grammar: a thin top utility
 * strip carrying a mono uppercase dateline on the left and a live primary
 * "BREAKING" ticker on the right; a centered masthead row with a bold serif
 * nameplate wordmark bracketed by hairline edition rules, flanked by a square
 * command-search affordance on the left and a Shoo profile dropdown plus a
 * filled Lakebed "Subscribe" button on the right; and a dense, hairline-ruled
 * horizontal section rail beneath (Latest, World, Politics, Business, Tech,
 * Culture, Opinion) with mono uppercase labels and column-divider separators.
 * Section links route through route hrefs while search, account, subscription
 * and mobile-menu actions use Lakebed-backed UI. Use as the sticky site header
 * for digital newspapers, magazines, newsrooms, media brands or longform
 * publications. Renders fully with no props via baked-in "The Daily Ledger"
 * defaults.
 */
export const NewsroomNavbar = defineCapsule({
  name: 'NewsroomNavbar',
  description:
    "Full newsprint masthead bar for a digital newsroom or online magazine: three stacked tiers — a thin top utility strip with a mono uppercase dateline and a live primary 'BREAKING' ticker; a centered masthead row with a bold serif nameplate wordmark bracketed by hairline edition rules and flanked by a square command-search affordance, a Shoo profile dropdown and a filled Lakebed subscribe button; a Sheet mobile menu; and a dense hairline-ruled horizontal section rail (Latest, World, Politics, Business, Tech, Culture, Opinion) in mono uppercase with column-divider separators. Section and article links route through route hrefs while search, account and subscription actions use Lakebed-backed UI. Use as the sticky site header for digital newspapers, magazines, newsrooms, media brands or longform publications.",
  props: z.object({
    /** Publication / masthead wordmark rendered in a prominent serif. */
    brand: z.string().optional(),
    /** Today's date shown in the top utility strip. */
    date: z.string().optional(),
    /** Breaking-news headline shown in the live ticker line. */
    breaking: z.string().optional(),
    /** Horizontal section nav labels (first item is highlighted/active). */
    sections: z.array(z.string()).optional(),
    /** Filled primary subscribe CTA label on the right. */
    subscribeCta: z.string().optional(),
    /** Text sign-in link label on the right. */
    signInCta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'The Daily Ledger'
    const date = props.date ?? 'Sunday, June 22, 2026'
    const breaking =
      props.breaking ??
      'Central bank holds rates steady as inflation cools to a three-year low'
    const sections = props.sections?.length
      ? props.sections
      : [
          'Latest',
          'World',
          'Politics',
          'Business',
          'Tech',
          'Culture',
          'Opinion',
        ]
    const subscribeCta = props.subscribeCta ?? 'Subscribe'
    const signInCta = props.signInCta ?? 'Sign in'

    return (
      <SiteNav
        position="sticky"
        height="outlier"
        rowClassName="block"
        className={cn(
          'overflow-x-clip border-b-2 border-foreground bg-background backdrop-blur-none',
          props.className,
        )}
      >
        {/* Top utility strip: dateline + live BREAKING ticker */}
        <div className="relative left-1/2 w-screen -translate-x-1/2 border-b border-border bg-muted">
          <Container>
            <div className="flex items-center justify-between gap-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em]">
              <time className="hidden font-medium text-muted-foreground sm:block">
                {date}
              </time>
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-none bg-primary px-2 py-0.5 font-semibold text-primary-foreground">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
                  Breaking
                </span>
                <NavbarRouteLink
                  href={breaking}
                  className="truncate normal-case tracking-normal text-muted-foreground transition-colors hover:text-foreground"
                >
                  {breaking}
                </NavbarRouteLink>
              </div>
            </div>
          </Container>
        </div>

        {/* Masthead row: search · serif nameplate · subscribe + sign in */}
        <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center justify-start">
            <PublicationMobileMenu
              brand={brand}
              homeTarget={sections[0]}
              nav={sections}
              buttonClassName="mr-2 inline-flex items-center justify-center rounded-none border border-border px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            />
            <PublicationSearchButton
              lakebed={lakebed}
              label="Search articles"
              buttonClassName="inline-flex items-center gap-2 rounded-none border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-4"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </PublicationSearchButton>
          </div>

          <NavbarBrand
            href={sections[0]}
            className="justify-self-center border-x border-border px-5 text-center font-serif text-3xl font-bold tracking-tight text-foreground sm:px-8 sm:text-4xl lg:text-5xl"
          >
            <BrandLogo brand={brand} className="flex items-center gap-2">
              <LogoImage className="size-7" />
              <LogoLabel />
            </BrandLogo>
          </NavbarBrand>

          <NavbarActions className="justify-end gap-2 sm:gap-4">
            <PublicationAccountButton
              lakebed={lakebed}
              label={signInCta}
              buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            />
            <PublicationSubscribeDrawer
              lakebed={lakebed}
              buttonLabel={subscribeCta}
              source="newsroom navbar"
              buttonClassName="rounded-none bg-foreground px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-background transition-transform hover:bg-foreground/90 active:translate-y-px"
            />
          </NavbarActions>
        </div>

        {/* Section rail: dense, hairline-ruled editorial index */}
        <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-border bg-background">
          <Container>
            <NavbarNav className="flex divide-x divide-border overflow-x-auto sm:justify-center">
              {sections.map((label, i) => (
                <NavbarNavLink
                  key={label}
                  href={label}
                  className={cn(
                    'shrink-0 rounded-none px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-muted',
                    i === 0
                      ? 'font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-[6px]'
                      : 'text-muted-foreground',
                  )}
                >
                  {label}
                </NavbarNavLink>
              ))}
            </NavbarNav>
          </Container>
        </div>
      </SiteNav>
    )
  },
})
