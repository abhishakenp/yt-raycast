import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * LendingFooter — a dark, rich multi-column site footer for a lending or fintech
 * marketing page. A near-ink (foreground-toned) band: a brand column on the left
 * with a logo tile, name, tagline, and social text-links, followed by three link
 * columns; a divided bottom row carries the copyright, a set of legal links, and
 * a long fine-print regulatory disclosure. Every link routes through section-kit route links.
 * Use as the closing footer with legal disclosures on personal-loan, debt-
 * consolidation, or financing pages. Renders fully with no props via defaults.
 */
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
export const LendingFooter = defineCapsule({
  name: 'LendingFooter',
  description:
    'Dark rich multi-column site footer for a lending or fintech marketing page: near-ink (foreground-toned) band with a brand column (logo tile, name, tagline, social text-links) plus three link columns; a divided bottom row carries the copyright, a set of legal links and a long fine-print regulatory disclosure. Links route through section-kit route links. Use as the closing footer with legal disclosures on personal-loan, debt-consolidation, or financing pages.',
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
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{footerTagline}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {footerColumns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle>{col.title}</FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink key={link}>{link}</FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{footerCopyright}</FooterCopyright>
            <FooterLegal>
              {footerLegalLinks.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
