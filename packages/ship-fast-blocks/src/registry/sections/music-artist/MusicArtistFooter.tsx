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
 * MusicArtistFooter — multi-column poster closing footer for a music artist /
 * band page. A wide brand block (wordmark, blurb, and a mono booking/press
 * contact line with a routable email) spanning two columns, alongside link
 * columns whose mono uppercase titles head stacked block-width links, with a
 * bottom bar showing a "© year + routable brand + note" copyright line and mono
 * legal links. Bold poster aesthetic driven entirely by theme tokens (flips
 * light/dark) with a top border. The brand, email, every column link and legal
 * link route through section-kit route links. Use as the closing site footer for
 * musicians, bands, or artist EPK pages. Renders fully with no props via
 * baked-in defaults.
 */
export const MusicArtistFooter = defineCapsule({
  name: 'MusicArtistFooter',
  description:
    'Multi-column poster closing footer for a music artist / band page: a wide brand block (wordmark, blurb, and a mono booking/press contact line with a routable email) spanning two columns, alongside link columns whose mono uppercase titles head stacked block-width links, with a bottom bar showing a "© year + routable brand + note" copyright line and mono legal links. Bold poster aesthetic driven entirely by theme tokens (flips light/dark) with a top border. The brand, email, every column link and legal link route through section-kit route links. Use as the closing site footer for musicians, singers, bands, or artist EPK pages.',
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
    const contactLabel = props.contactLabel ?? 'Booking & Press'
    const email = props.email ?? 'booking@velvetecho.com'
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
    const homeTarget = props.homeTarget ?? brand
    const year = new Date().getFullYear()
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              className="md:col-span-2"
              brandClassName="font-extrabold uppercase tracking-tight"
            >
              <FooterTagline>{description}</FooterTagline>
              <div className="mt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {contactLabel}
                </p>
                <FooterLink
                  href={email}
                  className="mt-1 block w-fit font-mono text-sm text-foreground hover:text-foreground"
                >
                  {email}
                </FooterLink>
              </div>
            </FooterBrand>
            {columns.map((col) => (
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
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.15em]">
              © {year}{' '}
              <FooterLink
                href={homeTarget}
                className="inline font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
              >
                {brand}
              </FooterLink>
              . {note}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.15em]"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
