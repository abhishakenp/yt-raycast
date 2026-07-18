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
} from '#/section-kit/index.ts'
import {
  PublicationAccountButton,
  PublicationMobileMenu,
  PublicationSearchButton,
  PublicationSubscribeDrawer,
} from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

/**
 * NewsroomNavbar — refined editorial masthead bar for a digital newsroom or
 * online magazine. A sticky, press-feeling header in three tiers: a thin top
 * utility strip with today's date on the left and a live "BREAKING" ticker line
 * on the right; a prominent center-stage serif wordmark row flanked by a search
 * affordance on the left and a filled Lakebed "Subscribe" button plus a Shoo
 * profile dropdown on the right; and a dense, bordered horizontal section nav
 * beneath (Latest, World, Politics, Business, Tech, Culture, Opinion). Section
 * links route through route hrefs while search, account, subscription, and
 * mobile menu actions use Lakebed-backed UI. Use as the sticky site header for
 * digital newspapers, magazines, newsrooms, media brands or longform
 * publications. Renders fully with no props via baked-in "The Daily Ledger"
 * defaults.
 */
export const NewsroomNavbar = defineCapsule({
  name: 'NewsroomNavbar',
  description:
    "Refined editorial masthead bar for a digital newsroom or online magazine: a sticky, press-feeling header in three tiers — a thin top utility strip with today's date and a live 'BREAKING' ticker; a prominent center-stage serif wordmark row flanked by command article search, a Shoo profile dropdown, and a filled Lakebed subscribe button; a Sheet mobile menu; and a dense bordered horizontal section nav beneath (Latest, World, Politics, Business, Tech, Culture, Opinion). Section and article links route through route hrefs while search, account, and subscription actions use Lakebed-backed UI. Use as the sticky site header for digital newspapers, magazines, newsrooms, media brands or longform publications.",
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
          'overflow-x-clip bg-background backdrop-blur-none',
          props.className,
        )}
      >
        {/* Top utility strip: date + live BREAKING ticker */}
        <div className="relative left-1/2 w-screen -translate-x-1/2 border-b border-border bg-muted">
          <Container>
            <div className="flex items-center justify-between gap-4 py-1.5 text-xs">
              <time className="hidden font-medium uppercase tracking-wider text-muted-foreground sm:block">
                {date}
              </time>
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-primary px-2 py-0.5 font-semibold uppercase tracking-wider text-primary-foreground">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
                  Breaking
                </span>
                <NavbarRouteLink
                  href={breaking}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {breaking}
                </NavbarRouteLink>
              </div>
            </div>
          </Container>
        </div>

        {/* Masthead row: search · serif wordmark · subscribe + sign in */}
        <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center justify-start">
            <PublicationMobileMenu
              brand={brand}
              homeTarget={sections[0]}
              nav={sections}
              buttonClassName="mr-2 inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            />
            <PublicationSearchButton
              lakebed={lakebed}
              label="Search articles"
              buttonClassName="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
            className="justify-self-center text-center font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            <BrandLogo brand={brand} className="mr-2 size-7 align-middle">
              <LogoImage className="mr-2 size-7 align-middle" />
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
              buttonClassName="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            />
          </NavbarActions>
        </div>

        {/* Section nav: dense, bordered editorial rail */}
        <div className="relative left-1/2 w-screen -translate-x-1/2 border-t border-border bg-background">
          <Container>
            <NavbarNav className="flex gap-1 overflow-x-auto py-2 sm:justify-center sm:gap-2">
              {sections.map((label, i) => (
                <NavbarNavLink
                  key={label}
                  href={label}
                  className={cn(
                    'shrink-0 rounded-sm px-3 py-1.5 uppercase tracking-wide hover:bg-muted',
                    i === 0
                      ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                      : '',
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
