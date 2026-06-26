import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CryptoNavbar — glassy sticky top navigation bar for a crypto / DeFi
 * infrastructure landing page. A backdrop-blurred, border-bottomed header
 * pinned to the top with a high-contrast brand bolt icon + protocol name on
 * the left, a horizontal set of nav links in the center, and a dual button
 * group on the right (secondary text link + primary filled CTA). Every link
 * and CTA routes through useNavigate for page-switching. Use as the sticky
 * site header for crypto protocols, layer-1/layer-2 chains, DeFi platforms,
 * bridges, staking networks, or Web3 infrastructure sites.
 */
export const CryptoNavbar = defineComponent({
  name: 'CryptoNavbar',
  description:
    'Glassy sticky top navigation bar for a crypto / DeFi infrastructure landing page: backdrop-blurred, border-bottomed header with a high-contrast brand bolt icon + protocol name on the left, horizontal nav links in the center, and a dual button group on the right (secondary text link + primary filled CTA). All links route through useNavigate. Use as the sticky site header for crypto protocols, layer-1/layer-2 chains, DeFi platforms, bridges, staking networks, or Web3 infrastructure sites.',
  props: z.object({
    /** Brand / protocol name shown beside the logo icon. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Target label for the brand/home button (defaults to first nav item). */
    homeTarget: z.string().optional(),
    /** Label for the secondary documentation link (left of CTA). */
    docLabel: z.string().optional(),
    /** Target label for the secondary documentation link. */
    docTarget: z.string().optional(),
    /** Label for the primary pill CTA. */
    ctaLabel: z.string().optional(),
    /** Target label for the primary pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'NexusChain'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Network', 'Roadmap', 'Partners']
    const homeTarget = props.homeTarget ?? nav[0]
    const docLabel = props.docLabel ?? 'Documentation'
    const docTarget = props.docTarget ?? 'View Documentation'
    const ctaLabel = props.ctaLabel ?? 'Launch App'
    const ctaTarget = props.ctaTarget ?? 'Start Building'

    const BoltIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    )

    return (
      <nav
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
                <BoltIcon className="size-5" />
              </span>
              <span className="text-xl font-semibold tracking-tight">
                {brand}
              </span>
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
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(docTarget)}
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {docLabel}
              </button>
              <button
                type="button"
                onClick={() => go(ctaTarget)}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
  },
})
