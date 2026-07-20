import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * ElectronicsStoreFooter — a tech-brutalist multi-column site footer for an
 * electronics storefront. A border-t-2 top rule over a wide brand column (bolt
 * logo mark + name, description, social links) beside link columns of
 * store/support/company links with mono uppercase column titles and block w-fit
 * links, over a border-t-2 bottom bar with a copyright line and legal links.
 * Every link and icon routes through section-kit route links. Use as the closing
 * footer for electronics stores, gadget shops, consumer-tech retailers, or
 * audio/camera storefronts.
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
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
export const ElectronicsStoreFooter = defineCapsule({
  name: 'ElectronicsStoreFooter',
  description:
    'Tech-brutalist multi-column site footer for an electronics storefront: a border-t-2 top rule over a wide brand column (bolt logo mark + name, description, social links) beside link columns of store/support/company links with mono uppercase column titles and block w-fit links, over a border-t-2 bottom bar with a copyright line and legal links. Every link and icon routes through section-kit route links. Use as the closing footer for electronics stores, gadget shops, consumer-tech retailers, or audio/camera storefronts.',
  props: z.object({
    /** Brand / store name shown in the footer. */
    brand: z.string().optional(),
    /** Brand description paragraph. */
    description: z.string().optional(),
    /** Navigation target for the brand logo. */
    homeTarget: z.string().optional(),
    /** Social icon buttons. */
    socials: z
      .array(
        z.object({
          label: z.string(),
          path: z.string(),
        }),
      )
      .optional(),
    /** Footer link columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright line. */
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'TechNova'
    const description =
      props.description ??
      'Premium electronics and gadgets for the modern lifestyle. Quality products, competitive prices, exceptional service.'
    const socials = props.socials?.length
      ? props.socials
      : [
          {
            label: 'Twitter',
            path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
          },
          {
            label: 'Instagram',
            path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
          },
          {
            label: 'YouTube',
            path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
          },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Products',
            links: [
              'Headphones',
              'Smartwatches',
              'Laptops',
              'Cameras',
              'Gaming',
            ],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Order Status',
              'Returns',
              'Warranty',
              'Contact Us',
            ],
          },
          {
            title: 'Company',
            links: [
              'About',
              'Careers',
              'Press',
              'Affiliates',
              'Sustainability',
            ],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    return (
      <SiteFooter
        className={`border-t-2 border-foreground ${props.className ?? ''}`}
      >
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline className="max-w-xs">{description}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s.label }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="border-b-2 border-foreground pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit transition-colors hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="border-t-2 border-foreground">
            <FooterCopyright className="font-mono text-xs uppercase tracking-[0.12em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-xs uppercase tracking-[0.12em] transition-colors hover:text-foreground"
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
