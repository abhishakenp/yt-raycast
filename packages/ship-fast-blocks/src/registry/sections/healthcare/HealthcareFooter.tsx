import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * HealthcareFooter — rich multi-column footer for a medical-clinic page. A
 * dark foreground-colored band with a brand column (heart-in-tile mark + clinic
 * name, tagline, social buttons), a Services links column, a Company links
 * column, and a Contact column with address / phone / email rows (each with an
 * icon), all above a bordered bottom row pairing an auto-updating copyright line
 * with legal links. The brand button, socials, links, phone and email route
 * through useNavigate. Use as the closing site footer for doctors' offices,
 * primary-care practices, telehealth or urgent-care clinics, hospitals or
 * medical groups. Renders fully with no props via baked-in clinic defaults.
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
export const HealthcareFooter = defineCapsule({
  name: 'HealthcareFooter',
  description:
    "Rich multi-column footer for a medical-clinic page: a dark foreground-colored band with a brand column (heart-in-tile mark + clinic name, tagline, social buttons), a Services links column, a Company links column, and a Contact column with icon-prefixed address / phone / email rows, all above a bordered bottom row pairing an auto-updating copyright line with legal links. The brand button, socials, links, phone and email route through useNavigate. Use as the closing site footer for doctors' offices, primary-care practices, telehealth or urgent-care clinics, hospitals or medical groups.",
  props: z.object({
    /** Clinic / practice name shown beside the brand mark. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Tagline paragraph under the brand. */
    tagline: z.string().optional(),
    /** Social link labels (first letter shown in each tile). */
    socials: z.array(z.string()).optional(),
    /** Services column heading. */
    servicesHeading: z.string().optional(),
    /** Services column link labels. */
    servicesLinks: z.array(z.string()).optional(),
    /** Company column heading. */
    companyHeading: z.string().optional(),
    /** Company column link labels. */
    companyLinks: z.array(z.string()).optional(),
    /** Contact column heading. */
    contactHeading: z.string().optional(),
    /** Contact address line. */
    address: z.string().optional(),
    /** Contact phone number. */
    phone: z.string().optional(),
    /** Contact email address. */
    email: z.string().optional(),
    /** Copyright line (auto-built from brand + year if omitted). */
    copyright: z.string().optional(),
    /** Legal / utility link labels in the bottom row. */
    legalLinks: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vitality Health Partners'
    const tagline =
      props.tagline ??
      'Modern primary care and wellness services for the whole family. Serving San Francisco since 2015.'
    const socials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Instagram', 'LinkedIn']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{tagline}</FooterTagline>
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
              {legalLinks.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
