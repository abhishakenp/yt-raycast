import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

/**
 * LawFirmFooter — a dark, four-column site footer on the foreground surface for a
 * law firm. A wide brand column with a squared initial tile, two-line serif
 * wordmark (firm name + tracked-uppercase tagline), an about paragraph and an
 * address line with a pin icon, alongside a practice-areas link column, a firm
 * link column, and a contact column with phone / email / hours rows; below them
 * a bordered-top bar holds an auto-updating copyright line and legal links.
 * High-contrast, refined, authoritative editorial aesthetic with sharp squared
 * corners. The brand button and every link route through section-kit route links. Use as the
 * closing site footer for law firms, attorneys, legal practices, consulting or
 * professional-services sites. Renders fully with no props via baked-in
 * "Reinhart & Associates" defaults.
 */
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
export const LawFirmFooter = defineCapsule({
  name: 'LawFirmFooter',
  description:
    'Dark four-column site footer on the foreground surface for a law firm: a wide brand column with a squared initial tile, two-line serif wordmark (firm name + tracked-uppercase tagline), an about paragraph and an address line with a pin icon, alongside a practice-areas link column, a firm link column and a contact column with phone / email / hours rows, above a bordered-top bar with an auto-updating copyright line and legal links. High-contrast, refined, authoritative editorial aesthetic with sharp squared corners; the brand button and every link route through section-kit route links. Use as the closing site footer for law firms, attorneys, legal practices, corporate counsel, consulting, accounting or professional-services sites.',
  props: z.object({
    /** Firm / brand name shown in the wordmark and brand-tile initial. */
    brand: z.string().optional(),
    /** Tracked-uppercase tagline shown under the firm name. */
    tagline: z.string().optional(),
    about: z.string().optional(),
    address: z.string().optional(),
    practiceTitle: z.string().optional(),
    practiceLinks: z.array(z.string()).optional(),
    firmTitle: z.string().optional(),
    firmLinks: z.array(z.string()).optional(),
    contactTitle: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    hours: z.string().optional(),
    copyright: z.string().optional(),
    legalLinks: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Reinhart & Associates'
    const tagline = props.tagline ?? 'Attorneys at Law'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} LLP. All rights reserved.`
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Attorney Advertising']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{tagline}</FooterTagline>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
            <FooterLegal>
              {legalLinks.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
