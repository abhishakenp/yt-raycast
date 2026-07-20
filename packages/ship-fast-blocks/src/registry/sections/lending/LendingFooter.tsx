import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * LendingFooter — Swiss-fintech multi-column site footer for a lending or fintech
 * marketing page. A thin configuration over the shared SiteFooter composite with
 * hairline discipline: a runtime-swappable coin brand mark + wordmark, a tagline,
 * a giant ghost brand watermark bleeding behind the columns, mono index-numbered
 * Products / Company / Resources columns whose links sit as block w-fit rows, a
 * social row, and a divided bottom bar carrying the copyright, mono legal links,
 * and a long fine-print regulatory disclosure. Every link routes through
 * section-kit route links. Use as the closing footer with legal disclosures on
 * personal-loan, debt-consolidation, or financing pages. Renders fully with no
 * props via baked-in "ClearLoan" defaults.
 */
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

function CoinMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export const LendingFooter = defineCapsule({
  name: 'LendingFooter',
  description:
    'Swiss-fintech multi-column site footer for a lending or fintech marketing page built on the shared SiteFooter composite with hairline discipline: a runtime-swappable coin brand mark + wordmark, a tagline, a giant ghost brand watermark behind mono index-numbered link columns with block w-fit rows, a social row, and a divided bottom bar carrying the copyright, mono legal links and a long fine-print regulatory disclosure. Links route through section-kit route links. Use as the closing footer with legal disclosures on personal-loan, debt-consolidation, or financing pages.',
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
    const brand = props.brand ?? 'ClearLoan'
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
    return (
      <SiteFooter className={props.className}>
        <FooterContent className="relative overflow-hidden">
          <Watermark className="-bottom-10 -left-2 text-[9rem] leading-none sm:text-[13rem]">
            {brand}
          </Watermark>
          <FooterGrid className="relative gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <FooterBrand
              brand={brand}
              brandMark={<CoinMark className="size-7 text-primary" />}
            >
              <FooterTagline className="max-w-xs">
                {footerTagline}
              </FooterTagline>
              <FooterSocial className="mt-5 gap-4">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="font-mono text-[11px] uppercase tracking-[0.2em]"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {footerColumns.map((col, ci) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="tabular-nums text-primary"
                  >
                    {String(ci + 1).padStart(2, '0')}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-[13px] tracking-tight"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="relative mt-14 border-border">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.16em]">
              {footerCopyright}
            </FooterCopyright>
            <FooterLegal className="gap-5">
              {footerLegalLinks.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.16em]"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
          {props.disclosure && (
            <p className="relative mt-8 max-w-4xl text-xs leading-relaxed text-muted-foreground/80">
              {props.disclosure}
            </p>
          )}
        </FooterContent>
      </SiteFooter>
    )
  },
})
