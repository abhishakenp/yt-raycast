import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * LendingFooter — a dark, rich multi-column site footer for a lending or fintech
 * marketing page. A near-ink (foreground-toned) band: a brand column on the left
 * with a logo tile, name, tagline, and social text-links, followed by three link
 * columns; a divided bottom row carries the copyright, a set of legal links, and
 * a long fine-print regulatory disclosure. Every link routes through useNavigate.
 * Use as the closing footer with legal disclosures on personal-loan, debt-
 * consolidation, or financing pages. Renders fully with no props via defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const LendingFooter = defineCapsule({
  name: 'LendingFooter',
  description:
    'Dark rich multi-column site footer for a lending or fintech marketing page: near-ink (foreground-toned) band with a brand column (logo tile, name, tagline, social text-links) plus three link columns; a divided bottom row carries the copyright, a set of legal links and a long fine-print regulatory disclosure. Links route through useNavigate. Use as the closing footer with legal disclosures on personal-loan, debt-consolidation, or financing pages.',
  props: z.object({
    /** Brand / lender name shown beside the footer logo tile. */
    brand: z.string().optional(),
    /** Route target fired by the footer brand button (home). */
    homeTarget: z.string().optional(),
    tagline: z.string().optional(),
    /** Social link labels rendered as text buttons. */
    socials: z.array(z.string()).optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    legalLinks: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    disclosure: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'ClearLoan'
    const homeTarget = props.homeTarget ?? 'How it Works'
    const footerTagline =
      props.tagline ??
      'Simple, honest personal loans. No hidden fees, no surprises.'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Instagram', 'LinkedIn']
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Products',
            links: [
              'Personal Loans',
              'Debt Consolidation',
              'Home Improvement',
              'Medical Loans',
              'Auto Loans',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Partners', 'Contact'],
          },
          {
            title: 'Resources',
            links: [
              'Help Center',
              'Blog',
              'Loan Calculator',
              'Credit Education',
              'Refer a Friend',
            ],
          },
        ]
    const footerLegalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclosures']
    const footerCopyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const footerDisclosure =
      props.disclosure ??
      'ClearLoan Inc. NMLS ID #1234567. Loans are made by ClearLoan Inc. or lending partners. All loans are subject to credit approval. Your actual rate depends on credit score, loan amount, loan term, credit usage and history. Example: A $15,000 loan with an APR of 10.99% and 48 month term would have monthly payments of $384. The total amount paid would be $18,432. Annual percentage rates (APRs) through ClearLoan range from 6.99% to 24.99%.'
    const Logo = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    return (
      <footer className={cn('bg-foreground py-16', props.className)}>
        <Container>
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-background text-foreground">
                  <Logo className="size-5" />
                </span>
                <span className="text-xl font-semibold text-background">
                  {brand}
                </span>
              </button>
              <p className="mb-4 text-sm text-background/60">{footerTagline}</p>
              <div className="flex items-center gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-background/60 transition-colors hover:text-background"
                  >
                    <span className="text-sm font-medium">{social}</span>
                  </button>
                ))}
              </div>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold text-background">
                  {col.title}
                </h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-background/60 transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border/30 pt-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-background/50">{footerCopyright}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                {footerLegalLinks.map((link) => (
                  <button
                    key={link}
                    type="button"
                    onClick={() => go(link)}
                    className="text-background/60 transition-colors hover:text-background"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-6 max-w-4xl text-xs text-background/40">
              {footerDisclosure}
            </p>
          </div>
        </Container>
      </footer>
    )
  },
})
