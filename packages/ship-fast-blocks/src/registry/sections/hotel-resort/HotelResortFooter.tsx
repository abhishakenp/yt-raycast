import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'
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
 * HotelResortFooter — rich 4-column inverted footer for a luxury-editorial
 * hotel / resort & spa site. A foreground-surface footer carrying a hairline
 * top seam and a giant ghost serif watermark: a brand column (squared serif
 * initial mark + serif name, about blurb, mono social links), a mono-titled
 * explore-links column, a contact column (static address lines plus tappable
 * mono phone/email), and a newsletter column with an inline sharp-cornered
 * email-capture form, all over a hairline bottom row with an auto-updating
 * copyright line and mono legal links. The newsletter capture writes to the
 * shared Lakebed subscriber list; the brand link, socials, links, and contact
 * rows route through section-kit route links. Use as the closing footer for
 * hotels, resorts, spa retreats, villas, or inns. Renders fully with no props
 * via baked-in "Azure Coast" defaults.
 */
export const HotelResortFooter = defineCapsule({
  name: 'HotelResortFooter',
  description:
    'Rich 4-column inverted footer for a luxury-editorial hotel / resort & spa site: a foreground-surface footer with a hairline top seam and a giant ghost serif watermark, a brand column (squared serif initial mark + serif name, about blurb, mono social links), a mono-titled explore-links column, a contact column (static address lines plus tappable mono phone/email), and a newsletter column with an inline sharp-cornered email-capture form, over a hairline bottom row with an auto-updating copyright line and mono legal links. The newsletter capture writes to the shared Lakebed subscriber list; brand link, socials, links, and contact rows route through section-kit route links. Use as the closing footer for hotels, resorts, spa retreats, villas, or boutique inns.',
  props: z.object({
    /** Resort / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** About blurb under the brand. */
    about: z.string().optional(),
    /** Social link labels (rendered as circular initial buttons). */
    socials: z.array(z.string()).optional(),
    /** Heading for the explore-links column. */
    exploreHeading: z.string().optional(),
    /** Explore-link labels. */
    exploreLinks: z.array(z.string()).optional(),
    /** Heading for the contact column. */
    contactHeading: z.string().optional(),
    /** Contact lines (first two static address lines, the rest tappable). */
    contactLines: z.array(z.string()).optional(),
    /** Heading for the newsletter column. */
    newsletterHeading: z.string().optional(),
    /** Newsletter blurb. */
    newsletterText: z.string().optional(),
    /** Newsletter submit label + navigation target. */
    newsletterCta: z.string().optional(),
    /** Suffix appended after the brand in the copyright line (before the note). */
    copyrightSuffix: z.string().optional(),
    /** Copyright note. */
    note: z.string().optional(),
    /** Legal / utility links in the bottom row. */
    legalLinks: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Azure Coast'
    const about =
      props.about ??
      'An award-winning oceanfront resort offering luxury accommodations, world-class dining, and restorative wellness experiences on the California coast.'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Facebook', 'Twitter']
    const exploreHeading = props.exploreHeading ?? 'Explore'
    const exploreLinks = props.exploreLinks?.length
      ? props.exploreLinks
      : ['Rooms & Suites', 'Amenities', 'Gallery', 'Dining', 'Offers']
    const contactHeading = props.contactHeading ?? 'Contact'
    const contactLines = props.contactLines?.length
      ? props.contactLines
      : [
          '21 Pacific Coast Highway',
          'Malibu, California 90265',
          '1-800-555-1234',
          'stay@azurecoast.com',
        ]
    const newsletterHeading = props.newsletterHeading ?? 'Newsletter'
    const newsletterText =
      props.newsletterText ??
      'Subscribe for seasonal offers, private events, and stories from the coast.'
    const newsletterCta = props.newsletterCta ?? 'Subscribe'
    const copyrightSuffix = props.copyrightSuffix ?? ''
    const note = props.note ?? 'All rights reserved.'
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    const homeTarget = props.homeTarget ?? brand
    const year = new Date().getFullYear()
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none font-serif',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )
    return (
      <SiteFooter
        className={cn(
          'relative overflow-hidden border-t-0 bg-foreground text-background',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[0.16em] -left-[0.03em] select-none font-serif text-[24vw] font-normal leading-none tracking-tighter text-background/[0.04]"
        >
          {brand.split(' ')[0]}
        </span>
        <FooterContent className="relative">
          <FooterGrid>
            <FooterBrand
              brand={brand}
              brandMark={
                <LogoMark className="size-9 bg-background text-base text-foreground" />
              }
              brandClassName="font-serif text-xl font-normal tracking-tight text-background"
            >
              <FooterTagline className="text-background/60">
                {about}
              </FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-background/60 hover:text-background"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>

            <FooterColumn>
              <FooterColumnTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background/50">
                {exploreHeading}
              </FooterColumnTitle>
              <FooterColumnList>
                {exploreLinks.map((link) => (
                  <li key={link}>
                    <FooterLink className="block w-fit text-background/60 hover:text-background">
                      {link}
                    </FooterLink>
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>

            <FooterColumn>
              <FooterColumnTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background/50">
                {contactHeading}
              </FooterColumnTitle>
              <FooterColumnList>
                {contactLines.map((line, i) => (
                  <li key={line}>
                    {i < 2 ? (
                      <span className="block text-sm text-background/60">
                        {line}
                      </span>
                    ) : (
                      <a
                        href={
                          line.includes('@')
                            ? `mailto:${line}`
                            : `tel:${line.replace(/[^\d+]/g, '')}`
                        }
                        className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-background/60 transition-colors hover:text-background"
                      >
                        {line}
                      </a>
                    )}
                  </li>
                ))}
              </FooterColumnList>
            </FooterColumn>

            <FooterColumn>
              <FooterColumnTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-background/50">
                {newsletterHeading}
              </FooterColumnTitle>
              <p className="mt-3 text-sm leading-relaxed text-background/60">
                {newsletterText}
              </p>
              <NewsletterSubscribeForm
                lakebed={lakebed}
                source={brand}
                buttonLabel={newsletterCta}
                pendingLabel="Sending"
                placeholder="you@example.com"
                emailLabel="Email address"
                className="mt-4 flex flex-col gap-2 sm:flex-row"
                inputClassName="min-h-11 w-full rounded-none border border-background/25 bg-transparent px-3 text-sm text-background outline-none transition-colors placeholder:text-background/40 focus:border-background"
                buttonClassName="inline-flex min-h-11 items-center justify-center rounded-none bg-background px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-foreground transition-[background-color,transform] duration-150 hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
                statusClassName="text-background/40"
              />
            </FooterColumn>
          </FooterGrid>
          <FooterBottom className="border-background/15">
            <FooterCopyright className="text-background/50">
              © {year}{' '}
              <FooterLink
                href={homeTarget}
                className="text-background/50 hover:text-background"
              >
                {brand}
              </FooterLink>
              {copyrightSuffix ? ` ${copyrightSuffix}` : ''}. {note}
            </FooterCopyright>
            <FooterLegal>
              {legalLinks.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-background/50 hover:text-background"
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
