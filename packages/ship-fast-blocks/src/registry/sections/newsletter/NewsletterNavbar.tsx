import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * NewsletterNavbar — sticky, backdrop-blurred top navigation bar for an editorial
 * newsletter / subscription site. A serif initial-mark logo tile + publication
 * name sit on the left; on desktop the remaining nav labels render as quiet text
 * links with the final label promoted to an outlined "Subscribe" pill on the
 * right; on mobile a hamburger button collapses to the first nav route. Warm,
 * calm, literary aesthetic on a light paper-toned surface. Every item routes
 * through useNavigate for page-switching. Use as the sticky site header for
 * newsletters, Substack-style publications, blogs, essayists, or content
 * creators. Renders fully with no props via baked-in defaults.
 */
export const NewsletterNavbar = defineComponent({
  name: 'NewsletterNavbar',
  description:
    "Sticky, backdrop-blurred top navigation bar for an editorial newsletter / subscription site: a serif initial-mark logo tile + publication name on the left, quiet text nav links in the center, and the final nav label promoted to an outlined 'Subscribe' pill on the right (desktop); a hamburger button on mobile. Warm, calm, literary aesthetic on a light paper-toned surface. Items route through useNavigate for page-switching. Use as the sticky site header for newsletters, Substack-style publications, blogs, essayists, digests, or content creators.",
  props: z.object({
    /** Brand / publication name shown beside the serif logo mark. */
    brand: z.string().optional(),
    /** Nav link labels; the last becomes the outlined CTA pill (must match site routes). */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'The Quiet Observer'
    const nav = props.nav?.length
      ? props.nav
      : ['Recent Issues', 'About', 'Subscribe']

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-foreground font-serif font-medium text-background',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(brand)}
              className="group flex items-center gap-2"
            >
              <LogoMark className="size-8 text-lg" />
              <span className="font-serif text-xl font-medium tracking-tight text-foreground">
                {brand}
              </span>
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(nav[nav.length - 1])}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground"
              >
                {nav[nav.length - 1]}
              </button>
            </div>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => go(nav[0])}
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
          </div>
        </div>
      </header>
    )
  },
})
