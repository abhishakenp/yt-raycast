import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * InvestingFooter — rich multi-column footer for an investing / fintech site. A
 * muted, bordered-top footer: a brand block (trend-line logo tile + name,
 * tagline, and a row of social-initial buttons) beside a responsive grid of
 * link columns, above a divider row carrying an auto-updating copyright line and
 * a small FINRA/SIPC-style legal disclosure. The brand button, social buttons
 * and every link route through useNavigate. Use as the closing site footer for
 * a brokerage, trading app, robo-advisor or crypto exchange. Renders fully with
 * no props via baked-in "Vestora" defaults.
 */
export const InvestingFooter = defineComponent({
  name: 'InvestingFooter',
  description:
    'Rich multi-column footer for an investing / fintech site: a muted bordered-top footer with a brand block (trend-line logo tile + name, tagline, and a row of social-initial buttons) beside a responsive grid of link columns, above a divider row carrying an auto-updating copyright line and a small FINRA/SIPC-style legal disclosure. The brand button, social buttons and every link route through useNavigate. Use as the closing site footer for a brokerage, trading app, robo-advisor or crypto exchange.',
  props: z.object({
    /** Brand / platform name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Tagline beneath the brand. */
    tagline: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright line (auto-built from brand + year if omitted). */
    copyright: z.string().optional(),
    /** Small legal disclosure line. */
    disclosure: z.string().optional(),
    /** Social link labels (rendered as initial buttons). */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Vestora'
    const homeTarget = props.homeTarget ?? 'Features'
    const tagline =
      props.tagline ??
      'Modern investing for everyone. Trade stocks, ETFs, options, and crypto with zero commission.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Pricing', 'Mobile App', 'API'],
          },
          { title: 'Company', links: ['About', 'Careers', 'Press', 'Blog'] },
          {
            title: 'Resources',
            links: [
              'Help Center',
              'Investing 101',
              'Market News',
              'Tax Center',
            ],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Disclosures', 'FINRA'],
          },
        ]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const disclosure =
      props.disclosure ??
      `Securities trading offered through ${brand} Securities LLC, member FINRA/SIPC. Crypto trading offered through ${brand} Crypto LLC. Investing involves risk, including loss of principal.`
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'Instagram']

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[62%]"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </span>
    )

    return (
      <footer
        className={cn(
          'border-t border-border bg-muted/50 pb-8 pt-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold tracking-tight">
                  {brand}
                </span>
              </button>
              <p className="mb-4 text-sm text-muted-foreground">{tagline}</p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
                  >
                    <span className="text-xs font-semibold">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold">{col.title}</h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-muted-foreground">{copyright}</p>
              <p className="max-w-2xl text-center text-xs text-muted-foreground/70 md:text-right">
                {disclosure}
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
