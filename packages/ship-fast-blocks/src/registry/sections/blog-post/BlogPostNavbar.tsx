import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import {
  PublicationAccountButton,
  PublicationMobileMenu,
  PublicationSearchButton,
  PublicationSubscribeDrawer,
} from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

/**
 * BlogPostNavbar — sticky reading-page header for a single-article / editorial
 * blog page. A feather / pen wordmark on the left, centered desktop nav links,
 * command article search, a Shoo profile dropdown, a Lakebed subscribe drawer,
 * and a real mobile drawer on small screens. Clean editorial voice. Use as the
 * sticky site header for a blog post, magazine article, journal, or any
 * editorial publication detail page. Renders fully with no props via baked-in
 * defaults.
 */
const FeatherMark = ({ className }: { className?: string }) => (
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

export const BlogPostNavbar = defineCapsule({
  name: 'BlogPostNavbar',
  description:
    'Sticky reading-page header for a single-article / editorial blog page: a feather/pen wordmark, centered desktop nav links, command article search, a Shoo profile dropdown, a Lakebed subscribe drawer, and a real mobile drawer on small screens. Clean editorial voice. Use as the sticky site header for a blog post, magazine article, journal, or any editorial publication detail page.',
  props: z.object({
    /** Publication / brand name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label for the subscribe CTA on the right. */
    subscribeCta: z.string().optional(),
    /** Navigation target for the logo / brand click (defaults to first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['Home', 'Articles', 'Topics', 'About']
    const brand = props.brand ?? 'The Editorial'
    const homeTarget = props.homeTarget ?? nav[0]
    const subscribeCta = props.subscribeCta ?? 'Subscribe'

    return (
      <header
        className={cn(
          'sticky inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex min-w-0 items-center gap-3"
          >
            <BrandLogo
              brand={brand}
              fallback={<FeatherMark className="size-7 text-primary" />}
              labelClassName="truncate text-xl font-semibold text-foreground"
            />
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
              buttonClassName="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground sm:inline-flex"
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
