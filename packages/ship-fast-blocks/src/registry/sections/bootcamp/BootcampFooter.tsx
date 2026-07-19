import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * BootcampFooter — 4-column dark footer for a coding bootcamp / career-school
 * landing page. A full-width footer on a foreground-colored band: left column
 * shows a brand-initial logo tile + academy name + tagline + social links;
 * remaining columns show titled link lists. Every link and the brand button
 * route through section-kit route links. Use as the closing site footer for coding
 * bootcamps, dev academies, or any cohort-based education brand.
 */
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
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
export const BootcampFooter = defineCapsule({
  name: 'BootcampFooter',
  description:
    '4-column dark footer for a coding bootcamp / career-school landing page: full-width footer on a foreground-colored band. Left column shows a brand-initial logo tile + academy name + tagline + social links; remaining columns show titled link lists. Every link and the brand button route through section-kit route links. Use as the closing site footer for coding bootcamps, dev academies, or cohort-based education brands.',
  props: z.object({
    /** Brand / academy name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Tagline under the brand name. */
    tagline: z.string().optional(),
    /** Titled footer link columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social link labels (text-only). */
    socials: z.array(z.string()).optional(),
    /** Legal link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'CodeCraft Academy'
    const footerTagline =
      props.tagline ??
      'Transforming careers through accessible, hands-on coding education since 2019.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Program',
            links: ['Curriculum', 'Mentors', 'Pricing', 'Schedule a Call'],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Blog', 'Press'],
          },
          {
            title: 'Support',
            links: ['FAQ', 'Contact', 'Student Login', 'Employer Partners'],
          },
        ]
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'LinkedIn']
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterSocial>
                {footerSocials
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
            <FooterCopyright>{footerTagline}</FooterCopyright>
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
