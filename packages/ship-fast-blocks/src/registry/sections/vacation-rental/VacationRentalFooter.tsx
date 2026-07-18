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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

/**
 * VacationRentalFooter — a multi-column site footer for a vacation-rental listing
 * page. Thin configuration over the shared `SiteFooter` composite: a palm-and-sun
 * brand mark + wordmark, a warm tagline, a social row, and a responsive grid of
 * link columns (Explore / Amenities / Support / Legal); below, a bordered-top
 * bottom bar with an auto-updating copyright line and legal links. The brand,
 * every column link, and each social link route through useNavigate. Theme-token
 * only. Use as the closing footer for a vacation rental, beach house, cabin,
 * villa, or boutique short-stay site. Renders fully with no props via baked-in
 * "Azure Cove Retreats" defaults.
 */
function PalmMark({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="17.5" cy="6.5" r="2.5" />
      <path d="M12 22v-9" />
      <path d="M12 13c-2-3-5-4-8-3 2-2 6-2 8 0" />
      <path d="M12 13c2-3 5-4 8-3-2-2-6-2-8 0" />
      <path d="M12 13c-1-3-1-6 1-8-3 1-4 5-1 8" />
    </svg>
  )
}

export const VacationRentalFooter = defineCapsule({
  name: 'VacationRentalFooter',
  description:
    'Multi-column site footer for a vacation-rental listing page built on the shared SiteFooter composite: a palm-and-sun brand mark + wordmark, a warm tagline, a social row, and a responsive grid of link columns (Explore / Amenities / Support / Legal); below, a bordered-top bottom bar with an auto-updating copyright line and legal links. The brand, every column link, and each social link route through useNavigate. Theme-token only. Use as the closing footer for a vacation rental, beach house, cabin, villa, or boutique short-stay site.',
  props: z.object({
    /** Property / brand name shown beside the brand mark. */
    brand: z.string().optional(),
    /** Short tagline under the wordmark. */
    tagline: z.string().optional(),
    /** Link columns: each a title plus a list of link labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Legal links shown in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Azure Cove Retreats'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Explore',
            links: ['Stays', 'Gallery', 'The Area', 'Availability'],
          },
          {
            title: 'Amenities',
            links: [
              'Private Pool',
              'Full Kitchen',
              'Fast Wifi',
              'Pet-Friendly',
            ],
          },
          {
            title: 'Support',
            links: ['House Rules', 'Check-in Guide', 'Contact Host', 'FAQ'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Cancellation Policy'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'Facebook' }, { label: 'Airbnb' }]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Stay']

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<PalmMark className="size-7 text-primary" />}
              brandClassName={'text-lg font-semibold'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Bright, breezy homes by the water — thoughtfully designed for unforgettable getaways.'}
              </FooterTagline>
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
            <FooterCopyright>
              {props.note ?? 'Made for slow mornings and golden evenings.'}
            </FooterCopyright>
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
