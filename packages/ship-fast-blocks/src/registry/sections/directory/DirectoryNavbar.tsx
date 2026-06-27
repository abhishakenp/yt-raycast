import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { directoryLakebed } from './directory-lakebed.ts'
import {
  DirectoryAccountButton,
  DirectoryLeadButton,
  DirectoryMobileMenu,
  DirectoryMutationSpinner,
  DirectorySearchButton,
} from './directory-interactions.tsx'

/**
 * DirectoryNavbar — clean horizontal top navigation bar for a local-business
 * directory / listings site. A bordered card-surface header with a location-pin
 * glyph + wordmark on the left, a centered row of category nav links, and a
 * right-side cluster of a text "Sign In" action plus a filled primary
 * "List Your Business" CTA. Every link and CTA routes through useNavigate.
 * Use as the site header for local directories, business-listing marketplaces,
 * find-a-service platforms, review-and-discovery sites, or city guides.
 */
export const DirectoryNavbar = defineCapsule({
  name: 'DirectoryNavbar',
  description:
    'Clean horizontal top navigation bar for a local-business DIRECTORY / listings site: a bordered card-surface header with a location-pin glyph plus wordmark on the left, a centered row of category nav links, and a right-side cluster of a text Sign In action and a filled primary List Your Business CTA. Every link and CTA routes through useNavigate. Use as the site header for local directories, business-listing marketplaces, find-a-service / find-a-pro platforms, review-and-discovery sites, city guides, or yellow-pages-style apps.',
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
    const go = useNavigate()
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
      <nav
        className={cn('border-b border-border bg-card', props.className)}
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <PinLogo className="size-8 text-foreground" />
              <span className="text-xl font-semibold text-foreground">
                {brand}
              </span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <DirectorySearchButton
                lakebed={lakebed}
                buttonClassName="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              />
              <DirectoryAccountButton
                lakebed={lakebed}
                label={signIn}
                buttonClassName="hidden size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              />
              <DirectoryLeadButton
                lakebed={lakebed}
                action={listCta}
                source="navbar"
                pendingChildren={<DirectoryMutationSpinner />}
                className="hidden min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60 md:inline-flex"
              >
                {listCta}
              </DirectoryLeadButton>
              <DirectoryMobileMenu
                brand={brand}
                homeTarget={homeTarget}
                nav={nav}
                buttonClassName="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              />
            </div>
          </div>
        </div>
      </nav>
    )
  },
})
