import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * FoodTruckFooter — an inverted, multi-column site footer for a food-truck brand. A
 * foreground-filled band with a brand block (circular monogram tile of brand initials +
 * wordmark + about line) beside configurable link columns and a dedicated socials
 * column, then a divided bottom bar with a copyright line and inline legal links. All
 * links route through useNavigate. Use as the closing footer for food trucks,
 * street-food vendors, caterers or restaurants.
 */
export const FoodTruckFooter = defineCapsule({
  name: 'FoodTruckFooter',
  description:
    'Inverted, multi-column site footer for a food-truck brand: a foreground-filled band with a brand block (circular monogram tile of brand initials + wordmark + about line) beside configurable link columns and a dedicated socials column, then a divided bottom bar with a copyright line and inline legal links. All links route through useNavigate. Use as the closing footer for food trucks, street-food vendors, taco / burger / bowl concepts, caterers or restaurants.',
  props: z.object({
    /** Brand / food-truck name; initials form the monogram. */
    brand: z.string().optional(),
    about: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Heading for the socials column. */
    socialsHeading: z.string().optional(),
    socials: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Curbside Kitchen'
    const footerAbout =
      props.about ??
      'Gourmet food truck serving Los Angeles since 2020. Farm-to-street, chef-made, zero pretension.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Menu',
            links: [
              'Signature Tacos',
              'Bowls & Salads',
              'Burgers',
              'Sides & Sweets',
            ],
          },
          {
            title: 'Company',
            links: ['Locations', 'Catering', 'FAQ', 'Careers'],
          },
        ]
    const socialsHeading = props.socialsHeading ?? 'Connect'
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Twitter', 'YouTube', 'Facebook']
    const footerCopyright = props.copyright ?? 'All rights reserved.'
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Food Safety']

    const initials = brand
      .split(/\s+/)
      .map((w) => w.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()

    void go
    void footerAbout
    void socialsHeading
    void initials
    return (
      <SiteFooter
        brand={brand}
        columns={footerColumns}
        social={footerSocials.map((s) => ({ label: s }))}
        legal={footerLegal}
        note={footerCopyright}
        className={props.className}
      />
    )
  },
})
