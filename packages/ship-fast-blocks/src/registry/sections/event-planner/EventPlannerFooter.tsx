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
 * EventPlannerFooter — kinetic-poster inverted four-column site footer. A
 * foreground-colored band with a brand column (clock-glyph mark + wordmark +
 * tagline) beside link columns whose mono uppercase titles head stacked
 * block-width navigation links, then a top-bordered bottom bar with a copyright
 * line. Every link routes through section-kit route links. Use as the closing
 * footer for event/wedding planners, agencies, or premium service businesses.
 */
export const EventPlannerFooter = defineCapsule({
  name: 'EventPlannerFooter',
  description:
    'Kinetic-poster inverted four-column site footer: a foreground-colored band with a brand column (clock-glyph mark + wordmark + tagline) beside link columns whose mono uppercase titles head stacked block-width navigation links, then a top-bordered bottom bar with a copyright line. Every link routes through section-kit route links. Use as the closing footer for event/wedding planners, agencies, or premium service businesses.',
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
                <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em]">
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
            <FooterCopyright>{footerTagline}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
