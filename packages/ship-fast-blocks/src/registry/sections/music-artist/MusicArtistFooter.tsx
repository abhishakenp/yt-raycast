import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * MusicArtistFooter — multi-column closing footer for a music artist / band
 * page. A wide brand block (thin wordmark, blurb, and a booking/press contact
 * line with a routable email) spanning two columns, alongside several link
 * columns, with a bottom bar showing a copyright line and legal links. Warm,
 * airy, editorial indie-folk aesthetic on a soft neutral canvas with a top
 * border. The brand, email, every column link and legal link route through
 * useNavigate. Use as the closing site footer for musicians, bands, or artist
 * EPK pages. Renders fully with no props via baked-in defaults.
 */
export const MusicArtistFooter = defineCapsule({
  name: 'MusicArtistFooter',
  description:
    'Multi-column closing footer for a music artist / band page: a wide brand block (thin wordmark, blurb, and a booking/press contact line with a routable email) spanning two columns, alongside several link columns, with a bottom bar showing a copyright line and legal links. Warm, airy editorial indie-folk aesthetic on a soft neutral canvas with a top border. The brand, email, every column link and legal link route through useNavigate. Use as the closing site footer for musicians, singers, bands, or artist EPK pages.',
  props: z.object({
    /** Artist / band name shown as the brand wordmark. */
    brand: z.string().optional(),
    /** Blurb paragraph under the brand name. */
    description: z.string().optional(),
    /** Label above the contact email. */
    contactLabel: z.string().optional(),
    /** Booking / press contact email (routable). */
    email: z.string().optional(),
    /** Link columns (title + link labels). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Trailing note after the copyright year + brand. */
    note: z.string().optional(),
    /** Legal link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand wordmark. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Velvet Echo'
    const description =
      props.description ??
      'Independent folk music from Portland, Oregon. New album "Northbound" available everywhere.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Music',
            links: [
              'Northbound Album',
              'Discography',
              'Music Videos',
              'Live Sessions',
            ],
          },
          {
            title: 'Connect',
            links: ['Tour Dates', 'Merchandise', 'Instagram', 'YouTube'],
          },
        ]
    const note = props.note ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Use']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{description}</FooterTagline>
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
