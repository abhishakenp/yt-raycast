import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * FoodDeliveryFooter — muted multi-column site footer for a food-delivery /
 * restaurant-marketplace site. A wide branded column (location-pin mark + brand
 * name + tagline) beside several link columns (company / resources / legal),
 * then a bordered bottom bar with a copyright line and a row of social icons.
 * The brand click, every link, and the social icons route through useNavigate.
 * Use as the closing footer for food-delivery apps, restaurant aggregators,
 * online-ordering platforms, or takeout services. Renders fully with no props
 * via baked-in "nosh" defaults.
 */
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
} from '#/section-kit/SiteFooter.tsx'
export const FoodDeliveryFooter = defineCapsule({
  name: 'FoodDeliveryFooter',
  description:
    'Muted multi-column site footer for a food-delivery / restaurant-marketplace site: a wide branded column (location-pin mark + brand name + tagline) beside several link columns (company / resources / legal), then a bordered bottom bar with a copyright line and a row of social icons. Brand click, links, and social icons route through useNavigate. Use as the closing footer for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** Brand name shown beside the pin mark. */
    brand: z.string().optional(),
    /** Target label for the brand/logo click (usually the home route). */
    homeTarget: z.string().optional(),
    /** Tagline paragraph under the brand. */
    description: z.string().optional(),
    /** Trailing copyright note after the year + brand. */
    note: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social icon labels (aria-label + navigate target); icon by name. */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'nosh'
    const footerNote = props.note ?? 'All rights reserved.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Contact'],
          },
          {
            heading: 'Resources',
            links: ['Partner with Us', 'Driver Jobs', 'Help Center', 'Blog'],
          },
          {
            heading: 'Legal',
            links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Instagram']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {footerColumns
              .map((c) => ({
                title: c.heading,
                links: c.links,
              }))
              .map((col) => (
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
            <FooterCopyright>{footerNote}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
