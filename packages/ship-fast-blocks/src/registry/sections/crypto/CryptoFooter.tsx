import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * CryptoFooter — rich multi-column footer for a crypto / DeFi infrastructure
 * landing page. A `bg-foreground` footer with a brand bolt icon + protocol
 * name, a description, social-link buttons with first-letter avatars, a
 * multi-column link grid, an auto-updating copyright line, and legal links.
 * All buttons route through useNavigate. Use as the closing site footer for
 * crypto protocols, chains, bridges, DeFi platforms, or Web3 infrastructure
 * sites.
 */
export const CryptoFooter = defineComponent({
  name: 'CryptoFooter',
  description:
    'Rich multi-column footer for a crypto / DeFi infrastructure landing page: bg-foreground footer with brand bolt icon + protocol name, description, social-link buttons with first-letter avatars, a multi-column link grid, auto-updating copyright line, and legal links. All buttons route through useNavigate. Use as the closing site footer for crypto protocols, chains, bridges, DeFi platforms, or Web3 infrastructure sites.',
  props: z.object({
    /** Brand / protocol name shown beside the logo icon. */
    brand: z.string().optional(),
    /** Description paragraph under the brand. */
    description: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Multi-column footer link groups. */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social network names for first-letter icon buttons. */
    socials: z.array(z.string()).optional(),
    /** Copyright / note text line. */
    note: z.string().optional(),
    /** Legal link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'NexusChain'
    const description =
      props.description ??
      'Enterprise-grade infrastructure for DeFi protocols, cross-chain bridges, and institutional tokenization.'
    const homeTarget = props.homeTarget ?? 'Features'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Product',
            links: ['Infrastructure', 'Bridge', 'Analytics', 'SDK', 'Pricing'],
          },
          {
            heading: 'Developers',
            links: [
              'Documentation',
              'API Reference',
              'GitHub',
              'Status',
              'Bug Bounty',
            ],
          },
          {
            heading: 'Company',
            links: ['About', 'Careers', 'Blog', 'Press', 'Contact'],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'LinkedIn', 'Discord']
    const note =
      props.note ??
      `© ${new Date().getFullYear()} ${brand} Foundation. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']

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
      <footer
        className={cn(
          'border-t border-border bg-foreground text-background',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-background text-foreground">
                  <BoltIcon className="size-5" />
                </span>
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-background/60">
                {description}
              </p>
              <div className="flex items-center gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-8 place-items-center rounded-lg bg-background/10 text-background/60 transition-colors hover:bg-background/20 hover:text-background"
                  >
                    <span className="text-xs font-bold">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 font-medium text-background">
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-background/60 transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
            <p className="text-sm text-background/50">{note}</p>
            <div className="flex items-center gap-6">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-sm text-background/50 transition-colors hover:text-background"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
