import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * NewsroomFooter — refined editorial footer for a digital newsroom or online
 * magazine. A large serif wordmark and a one-line tagline sit above a wide
 * multi-column set of link groups (Sections, Company, Help, Legal, Follow),
 * each with a heading and several routed links, plus an optional slim
 * newsletter mini-capture line. A divided bottom bar carries social handles,
 * an auto-updating copyright line, legal links (Privacy, Terms, Cookies) and a
 * subtle "Back to top" affordance. The wordmark and every link route through
 * useNavigate. Use as the closing footer for newspapers, magazines, publishing
 * houses or any editorial publication. Renders fully with no props via baked-in
 * "The Daily Ledger" defaults.
 */
export const NewsroomFooter = defineComponent({
  name: 'NewsroomFooter',
  description:
    'Refined editorial newspaper-style footer for a digital newsroom or online magazine: a large serif wordmark and a one-line tagline above a wide multi-column set of link groups (Sections, Company, Help, Legal, Follow) — each a heading plus several routed links — an optional slim newsletter mini-capture line, and a divided bottom bar with social handles, an auto-updating copyright line, legal links (Privacy, Terms, Cookies) and a subtle Back-to-top affordance. The wordmark and every link route through useNavigate. Use as the closing footer for newspapers, magazines, publishing houses or any editorial publication.',
  props: z.object({
    /** Large serif wordmark / publication name. */
    brand: z.string().optional(),
    /** One-line tagline or editorial blurb under the wordmark. */
    blurb: z.string().optional(),
    /** Footer link columns, each a heading with a list of links. */
    columns: z
      .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social handles shown in the bottom bar. */
    social: z.array(z.string()).optional(),
    /** Copyright line (defaults to an auto year + brand). */
    copyright: z.string().optional(),
    /** Legal / utility link labels along the bottom bar. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'The Daily Ledger'
    const blurb =
      props.blurb ??
      'Independent journalism, dispatches and long reads for the curious — delivered with rigor every morning.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Sections',
            links: ['World', 'Politics', 'Business', 'Culture', 'Opinion'],
          },
          {
            heading: 'Company',
            links: ['About', 'Masthead', 'Careers', 'Advertise', 'Contact'],
          },
          {
            heading: 'Help',
            links: [
              'Subscribe',
              'Newsletters',
              'Gift a Subscription',
              'FAQ',
              'Support',
            ],
          },
          {
            heading: 'Legal',
            links: ['Privacy', 'Terms', 'Cookies', 'Accessibility', 'Ethics'],
          },
          {
            heading: 'Follow',
            links: ['Twitter', 'Instagram', 'Facebook', 'RSS', 'Apple News'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : ['@dailyledger', 'facebook.com/dailyledger', 'instagram/dailyledger']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Media. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Cookies']

    return (
      <footer
        className={cn(
          'border-t border-border bg-background py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 border-b border-border pb-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-md">
              <button
                type="button"
                onClick={() => go(brand)}
                className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              >
                {brand}
              </button>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {blurb}
              </p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center">
              <label
                htmlFor="newsroom-footer-email"
                className="text-sm font-medium text-foreground"
              >
                The Morning Brief
              </label>
              <div className="flex flex-1 items-center gap-2">
                <input
                  id="newsroom-footer-email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-10 flex-1 rounded-md border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => go('Subscribe')}
                  className="h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 py-12 md:grid-cols-3 lg:grid-cols-5">
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
                  {col.heading}
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

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {social.map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => go(handle)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {handle}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{copyright}</p>
            <div className="flex items-center gap-5">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(brand)}
                className="text-sm font-medium text-foreground transition-colors hover:text-accent"
              >
                Back to top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
