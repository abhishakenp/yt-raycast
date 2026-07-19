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
 * EventFooter — a rich, dark multi-column footer for a conference or event page.
 * A full-bleed inverted (foreground-background) band with a brand block (square
 * initials mark, name, tagline, social icons) plus link columns, a contact
 * column, and a bottom bar with a copyright note and legal links. The brand mark,
 * social icons, and every link route through useNavigate. Use as the closing site
 * footer for tech conference, summit, festival, meetup, or workshop pages.
 */
export const EventFooter = defineCapsule({
  name: 'EventFooter',
  description:
    'Rich, dark multi-column footer for a conference or event page: a full-bleed inverted (foreground background, light text) band with a brand block (square brand-initials mark, event name, tagline, Twitter/LinkedIn/YouTube social icons), one or more link columns, a contact column, and a bottom bar with a copyright note and legal links. The brand mark, social icons, and every link route through useNavigate. Use as the closing site footer for tech conference, summit, festival, meetup, or workshop pages.',
  props: z.object({
    /** Brand / event name shown in the footer. */
    brand: z.string().optional(),
    /** Tagline paragraph beneath the brand. */
    tagline: z.string().optional(),
    /** Copyright / legal note in the bottom bar. */
    note: z.string().optional(),
    /** Link columns (title + links). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Contact column title. */
    contactTitle: z.string().optional(),
    /** Contact column entries (emails, address). */
    contacts: z.array(z.string()).optional(),
    /** Social link labels rendered as icons. */
    socials: z.array(z.string()).optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand mark. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'DesignFront'
    const tagline =
      props.tagline ??
      'The premier conference for web designers and frontend engineers. San Francisco, September 12–13, 2024.'
    const note =
      props.note ?? '© 2024 DesignFront Conference. All rights reserved.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Conference',
            links: ['Speakers', 'Agenda', 'Venue', 'Tickets', 'Schedule (PDF)'],
          },
          {
            title: 'Resources',
            links: [
              'Code of Conduct',
              'Accessibility',
              'Scholarships',
              'Sponsor Info',
              'Press Kit',
            ],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'YouTube']
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service']
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
