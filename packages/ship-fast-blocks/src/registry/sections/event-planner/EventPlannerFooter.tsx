import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
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
} from '#/section-kit/SiteFooter.tsx'
/**
 * EventPlannerFooter — inverted four-column site footer. A foreground-colored band
 * with a brand column (thin clock-glyph logo + light brand name + tagline) beside
 * link columns of grouped navigation buttons, then a top-bordered bottom bar with
 * a copyright line and legal links. Every link routes through section-kit route links. Use as
 * the closing footer for event/wedding planners, agencies, or premium service
 * businesses.
 */
export const EventPlannerFooter = defineCapsule({
  name: 'EventPlannerFooter',
  description:
    'Inverted four-column site footer: a foreground-colored band with a brand column (thin clock-glyph logo + light brand name + tagline) beside link columns of grouped navigation buttons, then a top-bordered bottom bar with a copyright line and legal links. Every link routes through section-kit route links. Use as the closing footer for event/wedding planners, agencies, or premium service businesses.',
  props: z.object({
    /** Brand / studio name shown beside the footer logo. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    legal: z.string().optional(),
    legalLinks: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Serene Events'
    const footerTagline =
      props.tagline ??
      'Creating unforgettable moments with elegance, precision, and heart since 2012.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Wedding Planning',
              'Corporate Events',
              'Private Celebrations',
              'Destination Events',
            ],
          },
          {
            title: 'Company',
            links: ['Portfolio', 'Testimonials', 'Our Process', 'FAQ'],
          },
          {
            title: 'Connect',
            links: ['Instagram', 'Pinterest', 'LinkedIn', 'Contact Us'],
          },
        ]
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} />
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
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
