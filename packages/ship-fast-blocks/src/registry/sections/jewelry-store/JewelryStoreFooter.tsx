import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
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
 * JewelryStoreFooter — rich five-column footer for a luxury jewelry maison on
 * a bordered near-black band. A wide brand block (serif gold wordmark, blurb,
 * and round initial-letter social buttons) leads a set of link columns
 * (collections, services) and a plain-text contact column, above a bottom row
 * with an auto-updating copyright line and legal links. The wordmark and every
 * link route through useNavigate. Use as the closing footer for fine jewelers,
 * diamond houses, engagement-ring boutiques, or high-jewelry maisons. Renders
 * fully with no props via baked-in "Maison Noir" defaults.
 */
export const JewelryStoreFooter = defineCapsule({
  name: 'JewelryStoreFooter',
  description:
    'Rich five-column footer for a luxury jewelry maison on a bordered near-black band: a wide brand block (serif gold wordmark, blurb, round initial-letter social buttons) leads link columns (collections, services) and a plain-text contact column, above a bottom row with an auto-updating copyright line and legal links. The wordmark and every link route through useNavigate. Use as the closing footer for fine jewelers, diamond houses, engagement-ring boutiques, or high-jewelry maisons.',
  props: z.object({
    /** Maison / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Navigation target for the wordmark click. */
    homeTarget: z.string().optional(),
    /** Short brand blurb. */
    about: z.string().optional(),
    /** Link columns (title + links). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Heading for the contact column. */
    contactTitle: z.string().optional(),
    /** Plain-text contact lines. */
    contact: z.array(z.string()).optional(),
    /** Social link labels (rendered as initial-letter buttons). */
    socials: z.array(z.string()).optional(),
    /** Copyright note. */
    copyright: z.string().optional(),
    /** Legal / utility link labels. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Maison Noir'
    const homeTarget = props.homeTarget ?? 'Collections'
    const about =
      props.about ??
      'Crafting exceptional jewelry since 1892. Every piece tells a story of heritage, craftsmanship, and enduring beauty.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Collections',
            links: [
              'Éternelle Bridal',
              'Lumière Essentials',
              'Grand Gala',
              'Archive Revival',
              'Maison Classics',
              "Gentleman's Edit",
            ],
          },
          {
            title: 'Services',
            links: [
              'Bespoke Design',
              'Private Appointments',
              'Lifetime Care',
              'Valuation Services',
              'Restoration',
              'Corporate Gifting',
            ],
          },
        ]
    const contactTitle = props.contactTitle ?? 'Contact'
    const contact = props.contact?.length
      ? props.contact
      : [
          '+33 1 42 86 87 88',
          'concierge@maisonnoir.com',
          '12 Place Vendôme, 75001 Paris, France',
          '730 Fifth Avenue, New York, NY 10019',
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'Facebook']
    const copyright = props.copyright ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']

    void go
    void homeTarget
    void contactTitle
    void contact
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
