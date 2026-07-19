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
 * EcommerceFooter — clean, light multi-column footer for a general online store.
 * Thin configuration over the shared `SiteFooter` composite: a brand block (logo
 * tile + bold wordmark + tagline + a row of social links) beside four link
 * columns (Shop, Help, Company, Legal), closed by a bottom bar with a
 * dynamic-year copyright. Every link, social, and the brand logo route through
 * section-kit route links. Use as the closing footer for online stores, marketplaces, retail
 * shops, ecommerce sites, or any general storefront that needs a bright, modern
 * footer (lighter alternative to the dark FashionStoreFooter). Renders fully
 * with no props via baked-in "Marketplace" defaults.
 */
function LogoTile({ brand }: { brand: string }) {
  return (
    <span
      className="grid size-8 place-items-center rounded-lg bg-primary text-base font-black text-primary-foreground"
      aria-hidden="true"
    >
      {brand.charAt(0).toUpperCase()}
    </span>
  )
}

export const EcommerceFooter = defineCapsule({
  name: 'EcommerceFooter',
  description:
    'Clean, light multi-column footer for a general online store built on the shared SiteFooter composite: a brand block (logo tile + bold wordmark + tagline + a row of social links) beside four link columns (Shop, Help, Company, Legal), closed by a bottom bar with a dynamic-year copyright. Every link, social, and the brand logo route through section-kit route links. Use as the closing footer for online stores, marketplaces, retail shops, ecommerce sites, or any general storefront that needs a bright, modern footer (lighter alternative to the dark FashionStoreFooter).',
  props: z.object({
    /** Brand / store name shown as the bold wordmark. */
    brand: z.string().optional(),
    /** Short line about everyday essentials / great prices. */
    tagline: z.string().optional(),
    /** Four titled link columns; defaults to Shop / Help / Company / Legal. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Marketplace'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: [
              'New Arrivals',
              'Best Sellers',
              'Deals',
              'Gift Cards',
              'Categories',
            ],
          },
          {
            title: 'Help',
            links: [
              'Contact Us',
              'Shipping',
              'Returns & Exchanges',
              'Track Order',
              'FAQ',
            ],
          },
          {
            title: 'Company',
            links: [
              'About Us',
              'Careers',
              'Sustainability',
              'Press',
              'Affiliates',
            ],
          },
          {
            title: 'Legal',
            links: [
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Accessibility',
            ],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: 'Instagram' },
          { label: 'Facebook' },
          { label: 'Twitter' },
          { label: 'TikTok' },
        ]

    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={<LogoTile brand={brand} />}
              brandClassName={'text-lg font-bold'}
            >
              <FooterTagline>
                {props.tagline ??
                  'Everyday essentials and the brands you love — quality you can trust at prices that make sense.'}
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
              {props.note ?? 'All rights reserved.'}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
