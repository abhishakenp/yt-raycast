import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MarketingAgencyFooter — a 4-column site footer. A bordered footer on the page
 * surface: a brand column (layered-diamond glyph + name + short about blurb)
 * beside three link columns of titled lists, with a divider rule above a bottom
 * bar holding an auto-year copyright line and a row of legal links. Every link
 * routes through useNavigate; the brand returns to the home target. Use as the
 * closing footer for a marketing / growth agency, SaaS, or B2B services site.
 * Renders fully with no props.
 */
export const MarketingAgencyFooter = defineCapsule({
  name: 'MarketingAgencyFooter',
  description:
    '4-column site footer: a bordered footer on the page surface with a brand column (layered-diamond glyph + name + short about blurb) beside three titled link-list columns, plus a divider rule above a bottom bar holding an auto-year copyright line and a row of legal links. Every link routes through useNavigate; the brand returns to the home target. Use as the closing footer for a marketing / growth agency, SaaS, or B2B services site.',
  props: z.object({
    /** Agency / brand name shown beside the logo glyph. */
    brand: z.string().optional(),
    /** Nav target the brand button routes to (typically the home label). */
    homeTarget: z.string().optional(),
    about: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Nexus Growth'
    const homeTarget = props.homeTarget ?? 'Services'
    const about =
      props.about ??
      'Data-driven marketing for ambitious brands. Based in San Francisco, working with clients globally.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Performance Marketing',
              'SEO & Content',
              'Email Marketing',
              'CRO',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'Case Studies', 'Careers', 'Contact'],
          },
          {
            title: 'Connect',
            links: ['Twitter', 'LinkedIn', 'YouTube', 'Newsletter'],
          },
        ]
    const copyright = props.copyright ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )

    return (
      <footer
        className={cn(
          'border-t border-border bg-background py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <LogoMark className="size-8 text-foreground" />
                <span className="text-lg font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {about}
              </p>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold text-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {brand} Agency. {copyright}
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-foreground"
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
