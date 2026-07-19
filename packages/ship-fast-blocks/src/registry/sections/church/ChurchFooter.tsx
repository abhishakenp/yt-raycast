import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * ChurchFooter — rich dark multi-column footer for a church or faith-community site.
 * A dark foreground-background reversed footer with four columns: brand + about
 * paragraph + social icon buttons, quick links, resources, and contact info with
 * office hours. Bottom row carries copyright and legal links. Every link and the
 * brand button route through section-kit route links. Use as the closing site footer for churches,
 * parishes, worship centers, ministries, or religious nonprofits. Renders fully with
 * no props via baked-in defaults.
 */
export const ChurchFooter = defineCapsule({
  name: 'ChurchFooter',
  description:
    'Rich dark multi-column footer for a church or faith-community site: a foreground-background reversed footer with four columns (brand + about + social icons, quick links, resources, and contact info with office hours), plus a bottom row with auto-updating copyright and legal links. Every link and the brand button route through section-kit route links. Use as the closing site footer for churches, parishes, worship centers, ministries, or religious nonprofits.',
  props: z.object({
    /** Church / community name shown beside the star mark. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Short about paragraph under the brand. */
    about: z.string().optional(),
    /** Social platform names; must match the built-in icon set (Instagram, YouTube, Facebook) or fall back to an initial letter. */
    socials: z.array(z.string()).optional(),
    /** Title above the quick-links column. */
    quickLinksTitle: z.string().optional(),
    /** Quick-link labels. */
    quickLinks: z.array(z.string()).optional(),
    /** Title above the resources column. */
    resourcesTitle: z.string().optional(),
    /** Resource link labels. */
    resources: z.array(z.string()).optional(),
    /** Title above the contact column. */
    contactTitle: z.string().optional(),
    /** Street address line. */
    address: z.string().optional(),
    /** Phone number shown as a button. */
    phone: z.string().optional(),
    /** Email shown as a button. */
    email: z.string().optional(),
    /** Office-hours line. */
    hours: z.string().optional(),
    /** Copyright line (excluding year). */
    copyright: z.string().optional(),
    /** Legal link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Grace Community'
    const about =
      props.about ??
      'A place to belong, believe, and become. Join us Sundays at 9 & 11 AM.'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'YouTube', 'Facebook']
    const copyright =
      props.copyright ?? 'Grace Community Church. All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Accessibility']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{about}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
