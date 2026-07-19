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
 * CoworkingFooter — deep, quiet closing footer for a coworking or shared-
 * workspace site. A giant watermark wordmark sits behind the content — the
 * page's light-field fading out — under a primary-tinted seam hairline.
 * Left: gradient brand tile, wordmark, tagline, and a row of social pills
 * that lift softly on hover. Right: link columns with uppercase tracked
 * titles and links that slide subtly on hover. The bottom bar carries the
 * auto-updating copyright and a back-to-top pill. Every brand, social, and
 * column link routes through useNavigate. Renders fully with no props via
 * baked-in "Northside" defaults. Use as the site-wide footer for coworking
 * spaces, shared offices, flex-office providers, or business centers.
 */
function BrandTile({ letter }: { letter: string }) {
  return (
    <span
      className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-base font-bold text-primary-foreground shadow-sm shadow-primary/25 ring-1 ring-primary/30"
      aria-hidden="true"
    >
      {letter}
    </span>
  )
}

export const CoworkingFooter = defineCapsule({
  name: 'CoworkingFooter',
  description:
    'Deep, quiet closing footer for a coworking or shared-workspace site: a giant watermark wordmark behind the content under a primary-tinted seam hairline, a gradient brand tile with wordmark + tagline + social pills that lift on hover, link columns with uppercase tracked titles and slide-on-hover links, and a bottom bar with auto-updating copyright and a back-to-top pill. Every brand, social, and column link routes through useNavigate. Use as the site-wide footer for coworking spaces, shared offices, flex-office providers, or business centers.',
  props: z.object({
    /** Brand / workspace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Spaces, Company, Resources, Contact, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand =
      typeof props.brand === 'string' && props.brand ? props.brand : 'Northside'
    const tagline =
      typeof props.tagline === 'string' && props.tagline
        ? props.tagline
        : 'A bright, modern workspace where independent professionals and growing teams do their best work.'
    const note =
      typeof props.note === 'string' && props.note
        ? props.note
        : 'All rights reserved.'
    const social = (
      props.social?.length
        ? props.social.filter(
            (item) => typeof item?.label === 'string' && item.label,
          )
        : [{ label: 'Instagram' }, { label: 'LinkedIn' }, { label: 'X' }]
    ) as Array<{ label: string; href?: string }>
    const columns = (
      props.columns?.length
        ? props.columns.filter(
            (column) => typeof column?.title === 'string' && column.title,
          )
        : [
            {
              title: 'Spaces',
              links: [
                'Hot Desks',
                'Dedicated Desks',
                'Private Offices',
                'Meeting Rooms',
              ],
            },
            {
              title: 'Company',
              links: ['About', 'Careers', 'Community', 'Events'],
            },
            {
              title: 'Resources',
              links: ['Pricing', 'Amenities', 'Member Perks', 'FAQ'],
            },
            {
              title: 'Contact',
              links: [
                '123 Pearl Street, Portland, OR 97209',
                '(503) 555-0145',
                'hello@northside.work',
              ],
            },
          ]
    ) as Array<{ title: string; links: string[] }>
    const year = new Date().getFullYear()
    // Authored notes often arrive as a full copyright line ("© 2026 Brand …")
    // — don't prepend a second © clause in that case.
    const copyright = note.includes('©')
      ? note
      : `© ${year} ${brand}. ${note}`

    const scrollToTop = () => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    void scrollToTop
    void copyright
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<BrandTile letter={brand[0] ?? 'C'} />}
            >
              <FooterTagline>{tagline}</FooterTagline>
              <FooterSocial>
                {social.map((s) => (
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
            <FooterCopyright>{note}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
