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
 * FoodTruckFooter — a sticker-poster inverted, multi-column site footer for a food-truck
 * brand. A foreground-filled band under a hazard-lite accent rule with a brand block
 * (square rubber-stamp monogram tile of brand initials + wordmark + about line) beside
 * configurable link columns (mono uppercase column titles, block w-fit links) and a
 * dedicated socials column, then a divided bottom bar with a mono copyright line and
 * inline legal links. All links route through section-kit route links. Use as the closing
 * footer for food trucks, street-food vendors, caterers or restaurants.
 */
export const FoodTruckFooter = defineCapsule({
  name: 'FoodTruckFooter',
  description:
    'Sticker-poster inverted, multi-column site footer for a food-truck brand: a foreground-filled band under a hazard-lite accent rule with a brand block (square rubber-stamp monogram tile of brand initials + wordmark + about line) beside configurable link columns (mono uppercase column titles, block w-fit links) and a dedicated socials column, then a divided bottom bar with a mono copyright line and inline legal links. All links route through section-kit route links. Use as the closing footer for food trucks, street-food vendors, taco / burger / bowl concepts, caterers or restaurants.',
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

    const initials = brand
      .split(/\s+/)
      .map((w) => w.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return (
      <SiteFooter
        className={`border-t-2 border-foreground bg-foreground text-background ${props.className ?? ''}`}
      >
        <div
          aria-hidden="true"
          className="h-2 w-full bg-[repeating-linear-gradient(45deg,currentColor_0px,currentColor_4px,transparent_4px,transparent_12px)] text-background/25"
        />
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandClassName="text-background"
              brandMark={
                <span
                  className="grid size-7 -rotate-3 place-items-center rounded-none border-2 border-background bg-background text-[10px] font-extrabold text-foreground"
                  aria-hidden="true"
                >
                  {initials}
                </span>
              }
            >
              <FooterSocial>
                {footerSocials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-background/70 hover:text-background"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {footerColumns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono uppercase tracking-[0.15em] text-background">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-background/70 hover:text-background"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="border-t-2 border-background/20">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.12em] text-background/60">
              {footerCopyright}
            </FooterCopyright>
            <FooterLegal>
              {footerLegal.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit text-background/70 hover:text-background"
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
