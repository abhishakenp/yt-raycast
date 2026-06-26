import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * PropertyListingFooter — full sitewide footer for a property marketplace. A
 * top region pairs a brand block (logo-tile wordmark, blurb, contact line) with
 * several "explore" link columns over a token surface. A bordered bottom row
 * carries social links and an auto-updating copyright. The wordmark and every
 * link route through useNavigate. Use as the closing footer for a property
 * search portal or listing marketplace. Renders fully with no props via baked
 * defaults.
 */
export const PropertyListingFooter = defineComponent({
  name: 'PropertyListingFooter',
  description:
    "Full sitewide footer for a property marketplace: a top region pairing a brand block (logo-tile wordmark, blurb, contact line) with several 'explore' link columns over a token surface, plus a bordered bottom row with social links and an auto-updating copyright. Wordmark and links route through useNavigate. Use as the closing footer for a property search portal or listing marketplace.",
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
      <SiteFooter
        brand={brand}
        tagline={blurb}
        columns={footerColumns}
        social={social.map((label) => ({ label }))}
        note={note}
        className={props.className}
      />
    )
  },
})
