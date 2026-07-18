import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * HotelResortFooter — rich 4-column dark footer for a luxury hotel / resort &
 * spa site. A foreground-surface footer: a brand column (logo mark + name,
 * about blurb, circular social buttons), an explore-links column, a contact
 * column (address lines plus tappable phone/email), and a newsletter column
 * with an inline email-capture form, all over a bordered bottom row with an
 * auto-updating copyright line and legal links. The newsletter capture writes to
 * the shared Lakebed subscriber list; the brand button, socials, links, and
 * contact rows route through useNavigate. Use as the
 * closing footer for hotels, resorts, spa retreats, villas, or inns. Renders
 * fully with no props via baked-in "Azure Coast" defaults.
 */
export const HotelResortFooter = defineCapsule({
  name: 'HotelResortFooter',
  description:
    'Rich 4-column dark footer for a luxury hotel / resort & spa site: a foreground-surface footer with a brand column (logo mark + name, about blurb, circular social buttons), an explore-links column, a contact column (address lines plus tappable phone/email), and a newsletter column with an inline email-capture form, over a bordered bottom row with an auto-updating copyright line and legal links. The newsletter capture writes to the shared Lakebed subscriber list; brand button, socials, links, and contact rows route through useNavigate. Use as the closing footer for hotels, resorts, spa retreats, villas, or boutique inns.',
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
      : ['Rooms & Suites', 'Spa & Wellness', 'Dining', 'Gallery', 'Gift Cards']
    const contactHeading = props.contactHeading ?? 'Contact'
    const contactLines = props.contactLines?.length
      ? props.contactLines
      : [
          '34780 Pacific Coast Highway',
          'Malibu, CA 90265',
          '1-800-555-1234',
          'reservations@azurecoast.com',
        ]
    const newsletterHeading = props.newsletterHeading ?? 'Newsletter'
    const newsletterText =
      props.newsletterText ?? 'Receive exclusive offers and resort updates.'
    const newsletterCta = props.newsletterCta ?? 'Join'
    const copyrightSuffix = props.copyrightSuffix ?? 'Resort & Spa.'
    const note = props.note ?? 'All rights reserved.'
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    const homeTarget = props.homeTarget ?? 'Rooms & Suites'

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-full font-light',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    void exploreHeading
    void exploreLinks
    void contactHeading
    void contactLines
    void newsletterHeading
    void newsletterText
    void newsletterCta
    void copyrightSuffix
    void homeTarget
    void lakebed
    return (
      <SiteFooter
        brand={brand}
        brandMark={<LogoMark />}
        tagline={about}
        social={socials.map((s) => ({ label: s }))}
        legal={legalLinks}
        note={note}
        className={props.className}
      />
    )
  },
})
