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
} from '#/section-kit/SiteFooter.tsx'

/**
 * PropertyListingFooter — full sitewide footer for a property marketplace. A
 * top region pairs a brand block (logo-tile wordmark, blurb, contact line) with
 * several "explore" link columns over a token surface. A bordered bottom row
 * carries social links and an auto-updating copyright. The wordmark and every
 * link route through section-kit route links. Use as the closing footer for a property
 * search portal or listing marketplace. Renders fully with no props via baked
 * defaults.
 */
export const PropertyListingFooter = defineCapsule({
  name: 'PropertyListingFooter',
  description:
    "Full sitewide footer for a property marketplace: a top region pairing a brand block (logo-tile wordmark, blurb, contact line) with several 'explore' link columns over a token surface, plus a bordered bottom row with social links and an auto-updating copyright. Wordmark and links route through section-kit route links. Use as the closing footer for a property search portal or listing marketplace.",
  props: z.object({
    /** Brand wordmark beside the logo tile. */
    brand: z.string().optional(),
    /** Short blurb under the wordmark. */
    blurb: z.string().optional(),
    /** Contact line (phone / email). */
    contact: z.string().optional(),
    /** Explore link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social link labels. */
    social: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nestable'
    const blurb =
      props.blurb ??
      'The fast, clutter-free way to search verified homes for sale and rent across the country.'
    const contact = props.contact ?? 'support@nestable.com · (888) 555-0190'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Explore',
            links: ['For Sale', 'For Rent', 'New Builds', 'Open Houses'],
          },
          {
            title: 'Search',
            links: ['Cities', 'Neighborhoods', 'Map Search', 'Saved Alerts'],
          },
          {
            title: 'Company',
            links: ['About', 'Agents', 'Post a Listing', 'Help Center'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : ['Instagram', 'Twitter', 'LinkedIn']
    const note = props.note ?? 'All rights reserved.'

    const footerColumns = [...columns, { title: 'Contact', links: [contact] }]

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{blurb}</FooterTagline>
              <FooterSocial>
                {social
                  .map((label) => ({ label }))
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
            <FooterCopyright>{note}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
