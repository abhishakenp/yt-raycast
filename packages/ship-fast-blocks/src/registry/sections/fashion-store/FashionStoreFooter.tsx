import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * FashionStoreFooter — rich multi-column dark footer for a minimalist fashion
 * store. A foreground-colored closing section with a brand block (serif
 * wordmark + tagline + text social links) beside four link columns (Shop,
 * Company, Customer Care, Legal), closed by a bottom bar with a dynamic-year
 * copyright and a "We accept" row of small payment-mark chips. Every link,
 * social and the brand logo route through useNavigate. Use as the closing
 * footer for clothing brands, boutiques, apparel and accessories shops, or any
 * premium minimalist retail storefront.
 */
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
export const FashionStoreFooter = defineCapsule({
  name: 'FashionStoreFooter',
  description:
    "Rich multi-column dark footer for a minimalist fashion store: a foreground-colored closing section with a brand block (serif wordmark + tagline + text social links) beside four link columns (Shop, Company, Customer Care, Legal), closed by a bottom bar with a dynamic-year copyright and a 'We accept' row of small payment-mark chips. Every link, social and the brand logo route through useNavigate. Use as the closing footer for clothing brands, boutiques, apparel and accessories shops, or any premium minimalist retail storefront.",
  props: z.object({
    /** Brand / store name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo (typically the first nav item). */
    homeTarget: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    socials: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    payments: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'NOIRE'
    const footerTagline =
      props.tagline ??
      'Timeless essentials for the modern wardrobe. Designed in Copenhagen, made with intention.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Shop',
            links: [
              'New Arrivals',
              'Outerwear',
              'Knitwear',
              'Trousers',
              'Shirts & Tops',
              'Accessories',
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
              'Stockists',
            ],
          },
          {
            title: 'Customer Care',
            links: [
              'Contact Us',
              'Shipping & Returns',
              'Size Guide',
              'FAQ',
              'Gift Cards',
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
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'Twitter']
    const footerCopyright =
      (props.copyright ?? 'All rights reserved.')
        ? props.payments
        : ['VISA', 'MC', 'AMEX', 'Pay']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{footerTagline}</FooterTagline>
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
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
