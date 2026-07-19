import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * KidsEducationFooter — dark 5-column mega footer for a kids / family learning
 * platform. A full-width dark (foreground) footer: a wide brand column with an
 * open-book mark + name, a tagline, and round social buttons, beside several
 * link-list columns; a divider above a bottom bar with a dynamic-year copyright
 * line and a legal-links row. Every link, social, and the logo route through
 * useNavigate. Use as the closing site footer for kids-education startups,
 * children's e-learning platforms, tutoring services, and family learning apps.
 * Renders fully with no props via baked-in "WonderLearn" defaults.
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
export const KidsEducationFooter = defineCapsule({
  name: 'KidsEducationFooter',
  description:
    "Dark 5-column mega footer for a kids / family learning platform: a full-width dark (foreground) footer with a wide brand column (open-book mark + name, tagline, round social buttons) beside several link-list columns; a divider above a bottom bar with a dynamic-year copyright line and a legal-links row. Every link, social, and the logo route through useNavigate. Use as the closing site footer for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Brand / platform name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Navigation target for the logo click. */
    homeTarget: z.string().optional(),
    /** Brand-column tagline. */
    tagline: z.string().optional(),
    /** Trailing copyright note after the brand name. */
    note: z.string().optional(),
    /** Link-list columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Bottom-bar legal links. */
    legal: z.array(z.string()).optional(),
    /** Social labels (rendered as round initial buttons). */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'WonderLearn'
    const tagline =
      props.tagline ??
      'Making learning an adventure for curious kids everywhere. Play-based activities for ages 4-12.'
    const note = props.note ?? 'All rights reserved.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Activities', 'Pricing', 'For Schools', 'Gift Cards'],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Blog', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Contact Us', 'Safety', 'Privacy'],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Facebook', 'Instagram']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
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
            <FooterCopyright>{note}</FooterCopyright>
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
