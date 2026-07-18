import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * ManufacturingFooter — a dark four-column site footer for a precision-
 * manufacturing site. On a foreground-colored band: a brand column (initials
 * tile + wordmark + about blurb), a services link list, an industries link list,
 * and a contact column (address, linked phone + email, social icon buttons),
 * over a bottom bar with copyright and legal links. Every link routes through
 * useNavigate. Clean, neutral, industrial. Use as the closing footer on machine-
 * shop, fabricator or contract-manufacturer pages. Renders fully with no props
 * via baked-in "Vertex Manufacturing" defaults.
 */
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
export const ManufacturingFooter = defineCapsule({
  name: 'ManufacturingFooter',
  description:
    'A dark four-column site footer for a precision-manufacturing site: on a foreground-colored band, a brand column (initials tile + wordmark + about blurb), a services link list, an industries link list, and a contact column (address, linked phone + email, social icon buttons), over a bottom bar with copyright and legal links. Every link routes through useNavigate. Clean, neutral, industrial. Use as the closing footer on machine-shop, fabricator or contract-manufacturer pages.',
  props: z.object({
    /** Brand / company name shown in the footer; initials tile derives from it. */
    brand: z.string().optional(),
    /** Navigation target for the brand button (defaults to "Capabilities"). */
    homeTarget: z.string().optional(),
    about: z.string().optional(),
    servicesTitle: z.string().optional(),
    services: z.array(z.string()).optional(),
    industriesTitle: z.string().optional(),
    industries: z.array(z.string()).optional(),
    contactTitle: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    /** Social icon links shown in the contact column. */
    socials: z.array(z.string()).optional(),
    legal: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Vertex Manufacturing'
    const homeTarget = props.homeTarget ?? 'Capabilities'
    const about =
      props.about ??
      'Precision CNC machining, sheet metal fabrication, and industrial engineering services. ISO 9001:2015 and AS9100D certified.'
    const servicesTitle = props.servicesTitle ?? 'Services'
    const services = props.services?.length
      ? props.services
      : [
          'CNC Machining',
          'Sheet Metal',
          'Wire EDM',
          'Grinding & Finishing',
          'Quality Inspection',
        ]
    const industriesTitle = props.industriesTitle ?? 'Industries'
    const industries = props.industries?.length
      ? props.industries
      : ['Aerospace', 'Automotive', 'Medical Devices', 'Oil & Gas', 'Defense']
    const contactTitle = props.contactTitle ?? 'Contact'
    const address =
      props.address ?? '2400 West Valley Highway N, Kent, WA 98032'
    const phone = props.phone ?? '(206) 555-1234'
    const email = props.email ?? 'quotes@vertexmfg.com'
    const socials = props.socials?.length
      ? props.socials
      : ['LinkedIn', 'Twitter']
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Supplier Portal']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Solutions. All rights reserved.`
    const brandInitials = brand
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('')
    const socialIcon = (name: string) => {
      if (name === 'Twitter') {
        void go
        void homeTarget
        void servicesTitle
        void industriesTitle
        void industries
        void contactTitle
        void address
        void phone
        void email
        void brandInitials
        void socialIcon
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      }
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      )
    }
    void services
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{about}</FooterTagline>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
