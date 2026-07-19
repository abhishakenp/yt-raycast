import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * DirectoryFooter — dark inverted multi-column footer for a local-business
 * directory. A foreground-on-background inverted footer with a brand block (a
 * location-pin glyph + wordmark and a short tagline) plus up to three link-group
 * columns, then a bottom bar with a copyright line on the left and a row of legal
 * links on the right. Every link routes through section-kit route links. Use as the site
 * footer for local directories, business-listing marketplaces, find-a-service
 * platforms, or review-and-discovery sites.
 */
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
export const DirectoryFooter = defineCapsule({
  name: 'DirectoryFooter',
  description:
    'Dark inverted multi-column footer for a local-business DIRECTORY: a foreground-on-background inverted footer with a brand block (a location-pin glyph plus wordmark and a short tagline) plus up to three link-group columns, then a bottom bar with a copyright line on the left and a row of legal links on the right. Every link routes through section-kit route links. Use as the site footer for local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
  props: z.object({
    /** Brand / directory name shown in the footer. */
    brand: z.string().optional(),
    /** Short tagline under the brand. */
    note: z.string().optional(),
    /** Link-group columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright line. */
    copyright: z.string().optional(),
    /** Navigation target for the brand logo. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'LocalFindr'
    const note =
      props.note ??
      'Connecting communities with the best local businesses since 2020.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'For Customers',
            links: [
              'Browse Categories',
              'Write a Review',
              'Saved Businesses',
              'Mobile App',
            ],
          },
          {
            title: 'For Business',
            links: [
              'List Your Business',
              'Pricing Plans',
              'Success Stories',
              'Business Blog',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Contact'],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} />
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
