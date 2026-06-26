import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * DatingAppNavbar — sticky, translucent top navigation for a dating / matchmaking
 * app landing page. A backdrop-blurred, border-bottomed header pinned to the top:
 * a rounded rose/primary heart-glyph logo tile beside the app name on the left, a
 * centered set of horizontal nav links (desktop), and a "Log In" text button plus a
 * pill-shaped primary "Get the App" CTA on the right. Every link and CTA route
 * through useNavigate so labels can drive page-switching. Use as the sticky site
 * header for dating apps, matchmaking services, singles platforms, friend-finders,
 * or any friendly, conversion-focused social-connection landing page. Renders fully
 * with no props via baked-in "HeartLink" defaults.
 */
export const DatingAppNavbar = defineComponent({
  name: 'DatingAppNavbar',
  description:
    "Sticky, translucent top navigation bar for a dating / matchmaking app landing page: backdrop-blurred, border-bottomed header pinned to the top with a rounded rose/primary heart-glyph logo tile + app name on the left, centered horizontal nav links (desktop), and a 'Log In' text button plus a pill-shaped primary 'Get the App' CTA on the right. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for dating apps, matchmaking services, singles platforms, friend-finders, or any friendly conversion-focused social-connection landing page.",
  props: z.object({
    /** Brand / app name shown beside the heart logo. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Text-link label on the right (defaults to "Log In"). */
    loginLabel: z.string().optional(),
    /** Pill-shaped primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target fired by the primary CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'HeartLink'
    const nav = props.nav?.length
      ? props.nav
      : ['How It Works', 'Features', 'Success Stories', 'FAQ']
    const loginLabel = props.loginLabel ?? 'Log In'
    const cta = props.cta ?? 'Get the App'
    const ctaTarget = props.ctaTarget ?? 'Download Free'

    const HeartGlyph = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-2"
          >
            <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <HeartGlyph className="size-5" />
            </span>
            <span className="text-xl font-bold text-foreground">{brand}</span>
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
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => go(loginLabel)}
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {loginLabel}
            </button>
            <button
              type="button"
              onClick={() => go(ctaTarget)}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              {cta}
            </button>
          </div>
        </nav>
      </header>
    )
  },
})
