import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FaqFooter — a five-column resource footer for a help-center / SaaS product page.
 * A spanning brand block (logo tile + name, tagline, and small social icon
 * buttons) sits beside four link columns (Product, Resources, Company, Legal) in a
 * responsive grid, with a bottom bar holding the copyright, a Status link, and a
 * green "All systems operational" status pill. All links route through useNavigate.
 * Use as the global footer for SaaS knowledge bases, help centers, documentation
 * landings, or support pages. Renders fully with no props via baked-in "FlowSync"
 * defaults.
 */
export const FaqFooter = defineCapsule({
  name: 'FaqFooter',
  description:
    "A five-column resource footer for a help-center / SaaS product page: a spanning brand block (logo tile + name, tagline, and small social icon buttons) beside four link columns (Product, Resources, Company, Legal) in a responsive grid, with a bottom bar holding the copyright, a Status link, and a green 'All systems operational' status pill. All links route through useNavigate. Use as the global footer for SaaS knowledge bases, help centers, documentation landings, or support pages.",
  props: z.object({
    /** Brand / product name shown beside the logo. */
    brand: z.string().optional(),
    /** Tagline under the brand. */
    tagline: z.string().optional(),
    /** Social icon labels (first letter is shown). */
    socials: z.array(z.string()).optional(),
    /** Link columns: title + link labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright line in the bottom bar. */
    copyright: z.string().optional(),
    /** Status link label in the bottom bar. */
    statusTarget: z.string().optional(),
    /** Status pill label. */
    statusLabel: z.string().optional(),
    /** Route target for the logo / brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'FlowSync'
    const tagline =
      props.tagline ?? "Project management that flows with your team's work."
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'GitHub']
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: [
              'Features',
              'Integrations',
              'Pricing',
              'Changelog',
              'Roadmap',
            ],
          },
          {
            title: 'Resources',
            links: [
              'Documentation',
              'API Reference',
              'Community',
              'Templates',
              'Guides',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Security', 'Cookies', 'Compliance'],
          },
        ]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const statusTarget = props.statusTarget ?? 'Status'
    const statusLabel = props.statusLabel ?? 'All systems operational'
    const homeTarget = props.homeTarget ?? 'Documentation'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 7h11a4 4 0 0 1 0 8H8" />
          <polyline points="11 19 7 15 11 11" />
        </svg>
      </span>
    )

    return (
      <footer
        className={cn(
          'border-t border-border bg-background py-12 sm:py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-lg font-semibold text-foreground">
                  {brand}
                </span>
              </button>
              <p className="mb-4 text-sm text-muted-foreground">{tagline}</p>
              <div className="flex items-center gap-3">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-8 place-items-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <span className="text-xs font-bold">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">{copyright}</p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => go(statusTarget)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {statusTarget}
              </button>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2 rounded-full bg-chart-2" />
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
