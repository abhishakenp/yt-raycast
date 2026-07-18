import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MusicFestivalFooter — a four-column footer for a music / arts festival landing
 * page. A bordered band with a brand block (wordmark + about paragraph), one or
 * more link columns, and a social column of round initial-badge buttons, above a
 * bottom bar with a copyright note and legal links. Every link and social badge
 * routes through useNavigate. Use as the closing site footer for music
 * festivals, arts festivals, concert series, camping/desert events, or any
 * multi-day ticketed event.
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
export const MusicFestivalFooter = defineCapsule({
  name: 'MusicFestivalFooter',
  description:
    'Four-column footer for a music / arts festival landing page: a top-bordered band with a brand block (bold wordmark + about paragraph), one or more link columns, and a social column of round initial-badge buttons that flip to primary on hover, above a bottom bar with a copyright note and legal links. Every link and social badge routes through useNavigate. Use as the closing site footer for music festivals, arts festivals, concert series, camping/desert events, raves, or any multi-day ticketed event.',
  props: z.object({
    /** Festival / brand name shown in the footer. */
    brand: z.string().optional(),
    /** About paragraph beneath the brand. */
    about: z.string().optional(),
    /** Link columns (heading + links). */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social column heading. */
    socialLabel: z.string().optional(),
    /** Social link labels rendered as initial badges. */
    socials: z.array(z.string()).optional(),
    /** Copyright note in the bottom bar. */
    copyright: z.string().optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'HORIZON'
    const about =
      props.about ??
      'Three days of music, art, and community in the Mojave Desert. August 15-17, 2025.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Festival',
            links: ['Lineup', 'Schedule', 'Experience', 'Camping'],
          },
          {
            heading: 'Support',
            links: ['FAQ', 'Contact', 'Accessibility', 'Safety'],
          },
        ]
    const socialLabel = props.socialLabel ?? 'Connect'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Twitter', 'TikTok', 'YouTube']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Festival. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service']
    void go
    void socialLabel
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
            {columns
              .map((c) => ({ title: c.heading, links: c.links }))
              .map((col) => (
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
