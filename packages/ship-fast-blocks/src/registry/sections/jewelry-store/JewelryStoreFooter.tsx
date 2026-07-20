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
 * JewelryStoreFooter — airy multi-column footer for a luxury jewelry maison. A
 * wide brand block (serif wordmark, blurb, and text social links) leads mono
 * micro-label link columns (collections, services) and an optional plain-text
 * contact column, above a bottom row with an auto-updating copyright line and
 * legal links. Every link is a block hit-target that routes through section-kit
 * route links. Use as the closing footer for fine jewelers, diamond houses,
 * engagement-ring boutiques, or high-jewelry maisons. Renders fully with no props
 * via baked-in "Maison Noir" defaults.
 */
export const JewelryStoreFooter = defineCapsule({
  name: 'JewelryStoreFooter',
  description:
    'Airy multi-column footer for a luxury jewelry maison: a wide brand block (serif wordmark, blurb, text social links) leads mono micro-label link columns (collections, services) and an optional plain-text contact column, above a bottom row with an auto-updating copyright line and legal links. Every link is a block hit-target that routes through section-kit route links. Use as the closing footer for fine jewelers, diamond houses, engagement-ring boutiques, or high-jewelry maisons.',
  props: z.object({
    /** Maison / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Navigation target for the wordmark click. */
    homeTarget: z.string().optional(),
    /** Short brand blurb. */
    about: z.string().optional(),
    /** Link columns (title + links). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Heading for the contact column. */
    contactTitle: z.string().optional(),
    /** Plain-text contact lines. */
    contact: z.array(z.string()).optional(),
    /** Social link labels (rendered as initial-letter buttons). */
    socials: z.array(z.string()).optional(),
    /** Copyright note. */
    copyright: z.string().optional(),
    /** Legal / utility link labels. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Maison Noir'
    const about =
      props.about ??
      'Crafting exceptional jewelry since 1892. Every piece tells a story of heritage, craftsmanship, and enduring beauty.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Collections',
            links: [
              'Éternelle Bridal',
              'Lumière Essentials',
              'Grand Gala',
              'Archive Revival',
              'Maison Classics',
              "Gentleman's Edit",
            ],
          },
          {
            title: 'Services',
            links: [
              'Bespoke Design',
              'Private Appointments',
              'Lifetime Care',
              'Valuation Services',
              'Restoration',
              'Corporate Gifting',
            ],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'Facebook']
    const copyright = props.copyright ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    return (
      <SiteFooter className={props.className}>
        <FooterContent className="py-16">
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandClassName="font-serif text-xl font-normal tracking-tight text-foreground"
            >
              <FooterTagline className="max-w-xs">{about}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="font-mono text-[11px] uppercase tracking-[0.18em]"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <FooterLink key={link} className="block w-fit">
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
            {props.contact?.length ? (
              <FooterColumn>
                <FooterColumnTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  {props.contactTitle ?? 'Contact'}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-3">
                  {props.contact.map((line) => (
                    <li key={line} className="text-sm text-muted-foreground">
                      {line}
                    </li>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ) : null}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.18em]">
              {copyright}
            </FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[11px] uppercase tracking-[0.18em]"
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
