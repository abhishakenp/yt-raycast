import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

/**
 * FurnitureStoreFooter — editorial-catalog closing footer for a warm minimal
 * furniture / home-decor store. A hairline-topped band on the adaptive
 * background with a giant faint ghost brand watermark bleeding off the bottom
 * edge: a plain Container wraps an asymmetric 12-column grid pairing a wide
 * brand block (house-glyph mark + store name and an about blurb) with
 * mono-labeled, slash-indexed link columns whose links stack as `block w-fit`
 * nav buttons. A hairline-divided bottom bar carries an auto-updating copyright
 * line, a wrapping row of mono legal links, and a decorative "[ FIN ]" tag. The
 * brand button and every link route through section-kit route links. Use as the
 * closing site footer for furniture stores, home-decor or interiors brands, or
 * any warm boutique-retail site. Renders fully with no props via baked-in
 * "Haven & Home" defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
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
    'Editorial-catalog closing footer for a warm minimal furniture / home-decor store: a hairline-topped band on the adaptive background with a giant faint ghost brand watermark bleeding off the bottom edge, a plain Container wrapping an asymmetric 12-column grid that pairs a wide brand block (house-glyph mark + store name and about blurb) with mono-labeled slash-indexed link columns whose links stack as block w-fit nav buttons, plus a hairline-divided bottom bar with an auto-updating copyright line, a wrapping row of mono legal links, and a decorative "[ FIN ]" tag. The brand button and every link route through section-kit route links. Use as the closing site footer for furniture stores, home-decor or interiors brands, or any warm boutique-retail site.',
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
      <SiteFooter
        className={
          'relative overflow-hidden border-t border-border bg-background' +
          (props.className ? ' ' + props.className : '')
        }
      >
        {/* Giant faint ghost brand watermark bleeding off the bottom edge. */}
        <Watermark className="-bottom-6 -right-2 text-[4.5rem] sm:text-[8rem] lg:text-[11rem]">
          {brand}
        </Watermark>
        <Container className="relative py-14 lg:py-20">
          <FooterGrid className="grid gap-10 md:grid-cols-12 lg:gap-8">
            <FooterBrand
              brand={brand}
              brandMark={<LogoMark />}
              className="md:col-span-5 lg:col-span-6"
            >
              <FooterTagline className="mt-4 max-w-sm leading-relaxed">
                {about}
              </FooterTagline>
            </FooterBrand>
            {columns.map((col, i) => (
              <FooterColumn key={col.title} className="md:col-span-2">
                <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                  <span aria-hidden="true" className="text-primary">
                    {String(i + 1).padStart(2, '0')}
                    {' / '}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-14 flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <FooterCopyright className="text-sm text-muted-foreground">
              {copyright}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <FooterLegal className="flex flex-wrap gap-x-5 gap-y-2">
                {legal.map((l) => (
                  <FooterLink
                    key={l}
                    className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l}
                  </FooterLink>
                ))}
              </FooterLegal>
              <MonoTag tone="faint" aria-hidden="true">
                [ FIN ]
              </MonoTag>
            </div>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
