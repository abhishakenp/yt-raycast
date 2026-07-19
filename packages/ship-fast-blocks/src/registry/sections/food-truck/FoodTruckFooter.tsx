import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
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
 * FoodTruckFooter — an inverted, multi-column site footer for a food-truck brand. A
 * foreground-filled band with a brand block (circular monogram tile of brand initials +
 * wordmark + about line) beside configurable link columns and a dedicated socials
 * column, then a divided bottom bar with a copyright line and inline legal links. All
 * links route through section-kit route links. Use as the closing footer for food trucks,
 * street-food vendors, caterers or restaurants.
 */
export const FoodTruckFooter = defineCapsule({
  name: 'FoodTruckFooter',
  description:
    'Inverted, multi-column site footer for a food-truck brand: a foreground-filled band with a brand block (circular monogram tile of brand initials + wordmark + about line) beside configurable link columns and a dedicated socials column, then a divided bottom bar with a copyright line and inline legal links. All links route through section-kit route links. Use as the closing footer for food trucks, street-food vendors, taco / burger / bowl concepts, caterers or restaurants.',
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
    const brand = props.brand ?? 'Curbside Kitchen'
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
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Twitter', 'YouTube', 'Facebook']
    const footerCopyright = props.copyright ?? 'All rights reserved.'
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Food Safety']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterSocial>
                {footerSocials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
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
            <FooterCopyright>{footerCopyright}</FooterCopyright>
            <FooterLegal>
              {footerLegal.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
