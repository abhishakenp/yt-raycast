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
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * DatingAppFooter — a multi-column site footer for a dating / matchmaking app. A
 * muted bordered-top band: a wide brand column with a rose/primary heart-glyph logo
 * tile + app name, a tagline, and round social icon buttons (Twitter / Instagram /
 * LinkedIn), followed by link columns (Product / Company / Support); a bottom row
 * holds an auto-updating copyright note and a set of legal links. The brand button
 * and every link route through section-kit route links. Use as the closing footer for dating
 * apps, singles platforms, or social-connection products. Renders fully with no
 * props via baked-in "HeartLink" defaults.
 */
export const DatingAppFooter = defineCapsule({
  name: 'DatingAppFooter',
  description:
    'Multi-column site footer for a dating / matchmaking app: a muted bordered-top band with a wide brand column (rose/primary heart-glyph logo tile + app name, a tagline, and round social icon buttons for Twitter / Instagram / LinkedIn) followed by link columns (Product / Company / Support); a bottom row holds an auto-updating copyright note and a set of legal links. The brand button and every link route through section-kit route links. Use as the closing footer for dating apps, singles platforms, or social-connection products.',
  props: z.object({
    /** Brand / app name shown beside the heart logo. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social icon labels (rendered in Twitter/Instagram/LinkedIn glyph order). */
    socials: z.array(z.string()).optional(),
    /** Copyright line shown bottom-left. */
    note: z.string().optional(),
    /** Legal / utility link labels bottom-right. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'HeartLink'
    const footerTagline =
      props.tagline ??
      'Helping millions find meaningful connections through genuine compatibility matching.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Premium', 'Safety', 'Success Stories'],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog'],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Contact Us',
              'Community Guidelines',
              'Terms of Service',
            ],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Instagram', 'LinkedIn']
    const footerNote = props.note ?? `© 2024 ${brand} Inc. All rights reserved.`
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
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
            <FooterCopyright>{footerNote}</FooterCopyright>
            <FooterLegal>
              {footerLegal.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
