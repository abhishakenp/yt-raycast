import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * MusicFestivalFooter — a kinetic-poster four-column footer for a music / arts
 * festival landing page. A top-bordered band wrapped in the shared Container,
 * with a brand block (bold uppercase wordmark + about paragraph), one or more
 * mono-titled link columns of block-level links, and a social column of mono
 * uppercase link chips, above a bottom bar with a copyright note and legal
 * links. Every link and social chip routes through section-kit route links.
 * Use as the closing site footer for music festivals, arts festivals, concert
 * series, camping/desert events, or any multi-day ticketed event.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  SiteFooter,
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
    'Kinetic-poster four-column footer for a music / arts festival landing page: a top-bordered band wrapped in the shared Container, with a brand block (bold uppercase wordmark + about paragraph), one or more mono-titled link columns of block-level links, and a social column of mono uppercase link chips, above a bottom bar with a copyright note and legal links. Every link and social chip routes through section-kit route links. Use as the closing site footer for music festivals, arts festivals, concert series, camping/desert events, raves, or any multi-day ticketed event.',
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
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Twitter', 'TikTok', 'YouTube']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Festival. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service']
    return (
      <SiteFooter className={props.className}>
        <Container className="py-14 lg:py-16">
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandClassName="text-lg font-extrabold uppercase tracking-tight"
            >
              <FooterTagline>{about}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="block w-fit border border-dashed border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns
              .map((c) => ({ title: c.heading, links: c.links }))
              .map((col) => (
                <FooterColumn key={col.title}>
                  <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {col.title}
                  </FooterColumnTitle>
                  <FooterColumnList>
                    {col.links.map((link) => (
                      <FooterLink key={link} className="block w-fit">
                        {link}
                      </FooterLink>
                    ))}
                  </FooterColumnList>
                </FooterColumn>
              ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.14em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink key={l} className="block w-fit">
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
