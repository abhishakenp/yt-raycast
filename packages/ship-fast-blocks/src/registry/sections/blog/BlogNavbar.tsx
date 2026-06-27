import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  PublicationAccountButton,
  PublicationMobileMenu,
  PublicationSearchButton,
  PublicationSubscribeDrawer,
} from './publication-interactions.tsx'
import { publicationLakebed } from './publication-lakebed.ts'

/**
 * BlogNavbar — sticky editorial site header for a blog, magazine, newsroom, or
 * content hub. A clean wordmark beside a gradient brand tile + inline mark,
 * horizontal nav links with a home highlight on desktop, command article search,
 * a Shoo profile dropdown, a Lakebed subscribe drawer, and a real mobile drawer
 * (Sheet) on small screens. No phone number — editorial publications don't show
 * one. Use as the header for blogs, publications, journals, or any content site.
 * Renders fully with no props.
 */
const QuillMark = ({ className }: { className?: string }) => (
  <span
    className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm ${className ?? ''}`}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="5" r="2" />
      <path d="M5 17C5 9 11 5 17 5" />
    </svg>
  </span>
)

export const BlogNavbar = defineCapsule({
  name: 'BlogNavbar',
  description:
    "Sticky editorial site header for a blog, magazine, newsroom, or content hub: a clean wordmark beside a gradient brand tile + inline mark, horizontal desktop nav links with a home highlight, command article search, a Shoo profile dropdown, a Lakebed subscribe drawer, and a real mobile drawer. No phone number — editorial publications don't show one. Use as the header for blogs, publications, journals, or any content site.",
  props: z.object({
    /** Brand / publication name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['Home', 'Design', 'Engineering', 'Product', 'About']
    const brand = props.brand ?? 'Form & Function'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Subscribe'
    const ctaTarget = props.ctaTarget ?? 'Subscribe'

    return (
      <header
        className={cn(
          'sticky inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex min-w-0 items-center gap-3"
          >
            <QuillMark className="size-8 text-primary" />
            <span className="truncate text-xl font-bold tracking-tight text-foreground">
              {brand}
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-foreground',
                  label === homeTarget
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
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
              buttonLabel={ctaLabel}
              source={ctaTarget}
              buttonClassName="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
            />
            <PublicationMobileMenu
              brand={brand}
              nav={nav}
              homeTarget={homeTarget}
              buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            />
          </div>
        </nav>
      </header>
    )
  },
})
