import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * FoodDeliveryFooter — playful-bold multi-column site footer for a food-delivery
 * / restaurant-marketplace site. A wide branded column (pin-mark brand + name +
 * tagline) beside several link columns with mono uppercase headings and
 * left-aligned block links (company / resources / legal), all under a chunky 2px
 * foreground top border, then a bordered bottom bar with a copyright line and a
 * row of social links. The brand click, every link, and the social links route
 * through section-kit route links. Use as the closing footer for food-delivery
 * apps, restaurant aggregators, online-ordering platforms, or takeout services.
 * Renders fully with no props via baked-in "nosh" defaults.
 */
import { cn } from '#/lib/utils.ts'
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
export const FoodDeliveryFooter = defineCapsule({
  name: 'FoodDeliveryFooter',
  description:
    'Playful-bold multi-column site footer for a food-delivery / restaurant-marketplace site: a wide branded column (pin-mark brand + name + tagline) beside several link columns with mono uppercase headings and left-aligned block links (company / resources / legal) under a chunky 2px foreground top border, then a bordered bottom bar with a copyright line and a row of social links. Brand click, links, and social links route through section-kit route links. Use as the closing footer for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
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
      <SiteFooter
        className={cn('border-t-2 border-foreground bg-card', props.className)}
      >
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandClassName="text-lg font-extrabold">
              {props.description ? (
                <FooterTagline className="max-w-xs">
                  {props.description}
                </FooterTagline>
              ) : null}
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="rounded-full border-2 border-foreground/25 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {s.label}
                    </FooterSocialLink>
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
                  <FooterColumnTitle className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {col.title}
                  </FooterColumnTitle>
                  <FooterColumnList>
                    {col.links.map((link) => (
                      <FooterLink
                        key={link}
                        className="block w-fit font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </FooterLink>
                    ))}
                  </FooterColumnList>
                </FooterColumn>
              ))}
          </FooterGrid>
          <FooterBottom className="border-t-2 border-foreground/10">
            <FooterCopyright className="font-mono text-xs uppercase tracking-[0.1em]">
              {footerNote}
            </FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
