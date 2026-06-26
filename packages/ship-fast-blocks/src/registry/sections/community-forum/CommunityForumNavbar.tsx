import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CommunityForumNavbar — sticky translucent top navigation bar for a
 * community-platform / discussion-forum marketing site. A blurred,
 * border-bottomed header with a brand mark + product name on the left, a
 * horizontal row of nav links on desktop, and a sign-in text button + primary
 * CTA button on the right. Every link and the CTA route through useNavigate.
 * Use as the sticky site header for community platforms, SaaS forums,
 * knowledge bases, or membership networks.
 */
export const CommunityForumNavbar = defineComponent({
  name: 'CommunityForumNavbar',
  description:
    'Sticky translucent top navigation bar for a community-platform / discussion-forum marketing site: blurred, border-bottomed header with a brand mark + product name on the left, a horizontal row of nav links on desktop, and a sign-in text button + primary CTA button on the right. Every link and the CTA route through useNavigate. Use as the sticky site header for community platforms, SaaS forums, knowledge bases, or membership networks.',
  props: z.object({
    /** Brand / product name shown beside the brand mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Sign-in link label. */
    signIn: z.string().optional(),
    /** Primary navbar CTA label. */
    navCta: z.string().optional(),
    /** Navigation target for the brand button (defaults to first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Threadloom'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Topics', 'Pricing', 'Stories', 'FAQ']
    const signIn = props.signIn ?? 'Sign In'
    const navCta = props.navCta ?? 'Get Started'
    const homeTarget = props.homeTarget ?? nav[0]

    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <circle cx="8" cy="16" r="3" />
        <circle cx="16" cy="16" r="3" />
        <circle cx="24" cy="16" r="3" />
      </svg>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <BrandMark className="size-8 text-foreground" />
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
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(signIn)}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                {signIn}
              </button>
              <button
                type="button"
                onClick={() => go(navCta)}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {navCta}
              </button>
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
