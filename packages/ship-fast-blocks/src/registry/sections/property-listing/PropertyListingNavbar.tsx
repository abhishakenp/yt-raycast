import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { propertyListingLakebed } from './property-listing-lakebed.ts'
import {
  PropertyListingAccountButton,
  PropertyListingInquiryButton,
  PropertyListingMobileMenu,
  PropertyListingMutationSpinner,
  PropertyListingSearchButton,
  PropertyListingStatusBadge,
} from './property-listing-interactions.tsx'

const brandMark = (
  <svg
    className="size-8 text-primary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 21h18" />
    <path d="M5 21V9l7-5 7 5v12" />
    <path d="M9 21v-6h6v6" />
  </svg>
)

/**
 * PropertyListingNavbar — clean top navigation for a property marketplace /
 * search portal. A sticky bordered-bottom bar holds a logo-tile + wordmark on
 * the left, inline page nav on desktop, command listing search, Shoo account
 * dropdown, saved/request badge, seller inquiry CTA, and a real Sheet mobile
 * drawer. Nav links route through useNavigate; search/auth/inquiry controls use
 * shared Lakebed state.
 */
export const PropertyListingNavbar = defineCapsule({
  name: 'PropertyListingNavbar',
  description:
    "Clean sticky top navigation for a property marketplace / search portal: house wordmark, desktop For Sale / For Rent / New / Agents nav, command listing search, Shoo account dropdown, saved/request badge, a fullstack 'Post Listing' inquiry CTA, and a real Sheet mobile drawer. Nav links route through useNavigate; search/auth/inquiry controls use shared Lakebed state.",
  props: z.object({
    /** Brand wordmark beside the logo tile. */
    brand: z.string().optional(),
    /** Primary navigation labels. */
    links: z.array(z.string()).optional(),
    /** Filled primary CTA label. */
    cta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: propertyListingLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Nestable'
    const nav = props.links?.length
      ? props.links
      : ['For Sale', 'For Rent', 'New', 'Agents']
    const cta = props.cta ?? 'Post Listing'
    const ctaTarget = props.ctaTarget ?? 'Post'

    return (
      <header
        className={cn(
          'sticky inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go('Home')}
            className="flex min-w-0 items-center gap-3"
          >
            {brandMark}
            <span className="truncate text-xl font-semibold tracking-tight text-foreground">
              {brand}
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <PropertyListingStatusBadge lakebed={lakebed} />
            <PropertyListingSearchButton
              lakebed={lakebed}
              buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            />
            <PropertyListingAccountButton
              lakebed={lakebed}
              buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
            />
            <PropertyListingInquiryButton
              lakebed={lakebed}
              intent={ctaTarget}
              source="navbar"
              pendingChildren={
                <>
                  <PropertyListingMutationSpinner className="size-4" />
                  Sending
                </>
              }
              className="hidden items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
            >
              {cta}
            </PropertyListingInquiryButton>
            <PropertyListingMobileMenu
              brand={brand}
              nav={nav}
              homeTarget="Home"
              buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            />
          </div>
        </nav>
      </header>
    )
  },
})
