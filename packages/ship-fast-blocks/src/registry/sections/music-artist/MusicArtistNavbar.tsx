import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MusicArtistNavbar — fixed, backdrop-blurred top navigation for a music
 * artist / band site. A thin-weight brand wordmark on the left, centered
 * horizontal nav links (desktop), and a hamburger menu button (mobile), all on
 * a translucent border-bottomed header pinned to the top of the viewport. Warm,
 * airy, editorial indie-folk aesthetic on a soft neutral canvas. The brand and
 * every nav link route through useNavigate for page-switching. Use as the
 * sticky site header for musicians, singers, bands, or any artist EPK/press
 * site. Renders fully with no props via baked-in defaults.
 */
export const MusicArtistNavbar = defineComponent({
  name: 'MusicArtistNavbar',
  description:
    'Fixed, backdrop-blurred top navigation bar for a music artist / band site: a thin-weight brand wordmark on the left, centered horizontal nav links on desktop, and a hamburger menu button on mobile, on a translucent border-bottomed header pinned to the top of the viewport. Warm, airy editorial indie-folk aesthetic on a soft neutral canvas. The brand and every nav link route through useNavigate for page-switching. Use as the sticky site header for musicians, singers, bands, indie/folk/Americana acts, or any artist EPK/press site.',
  props: z.object({
    /** Artist / band name shown as the brand wordmark. */
    brand: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand wordmark and the mobile menu button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Velvet Echo'
    const nav = props.nav?.length
      ? props.nav
      : ['Music', 'Tour', 'About', 'Contact']
    const homeTarget = props.homeTarget ?? 'Music'

    return (
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:h-20 lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="text-xl font-light tracking-tight text-foreground lg:text-2xl"
          >
            {brand}
          </button>
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => go(homeTarget)}
            className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </nav>
      </header>
    )
  },
})
