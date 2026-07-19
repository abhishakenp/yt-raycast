import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

/**
 * FurnitureStoreFooter — a rich, multi-column footer on the dark primary
 * background. A 5-column grid (responsive): a wide brand column with a house-glyph
 * logo tile + store name, an about blurb, and a stacked store address / hours
 * block, beside several link columns (each a heading over a list of nav buttons).
 * A bordered-top bottom bar holds an auto-updating copyright line and a wrapping
 * row of legal links. The brand button and every link route through useNavigate.
 * Use as the closing site footer for furniture stores, home-decor or interiors
 * brands, or any warm boutique-retail site. Renders fully with no props via
 * baked-in "Haven & Home" defaults.
 */
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
export const FurnitureStoreFooter = defineCapsule({
  name: 'FurnitureStoreFooter',
  description:
    'Rich multi-column footer on the dark primary background: a responsive 5-column grid with a wide brand column (house-glyph logo tile + store name, about blurb, stacked store address / hours block) beside several link columns (heading over a list of nav buttons), plus a bordered-top bottom bar with an auto-updating copyright line and a wrapping row of legal links; the brand button and every link route through useNavigate. Use as the closing site footer for furniture stores, home-decor or interiors brands, or any warm boutique-retail site.',
  props: z.object({
    /** Brand / store name shown beside the logo tile. */
    brand: z.string().optional(),
    about: z.string().optional(),
    address: z.array(z.string()).optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Haven & Home'
    const about =
      (props.about ??
      'Thoughtfully designed furniture for modern living. Made with sustainable materials, built to last for generations.')
        ? props.address
        : [
            '1234 Design District',
            'San Francisco, CA 94102',
            'Mon–Sat: 10am–7pm, Sun: 11am–6pm',
          ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: [
              'Living Room',
              'Bedroom',
              'Dining',
              'Home Office',
              'Outdoor',
              'Sale',
            ],
          },
          {
            title: 'Company',
            links: [
              'Our Story',
              'Sustainability',
              'Careers',
              'Press',
              'Design Services',
            ],
          },
          {
            title: 'Support',
            links: [
              'Contact Us',
              'FAQs',
              'Shipping & Delivery',
              'Returns',
              'Warranty',
              'Track Order',
            ],
          },
        ]
    const copyright = props.copyright ?? 'Haven & Home. All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : [
          'Privacy Policy',
          'Terms of Service',
          'Accessibility',
          'Do Not Sell My Info',
        ]
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 9v11h8v-7h4v7h8V9L12 2z" />
      </svg>
    )
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoMark />}>
              <FooterTagline>{about}</FooterTagline>
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
