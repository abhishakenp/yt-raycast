import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
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
    const brand = props.brand ?? 'Vertex Manufacturing'
    const about =
      props.about ??
      'Precision CNC machining, sheet metal fabrication, and industrial engineering services. ISO 9001:2015 and AS9100D certified.'
    const socials = props.socials?.length
      ? props.socials
      : ['LinkedIn', 'Twitter']
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Supplier Portal']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Solutions. All rights reserved.`
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
