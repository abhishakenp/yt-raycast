import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionFooter — four-column footer for a construction / general
 * contractor page. A multi-column layout with a brand logo tile + company
 * blurb + social buttons on the left, service links and company links in
 * the middle columns, and contact info (address, phone, email) on the right.
 * Every link and social button routes through section-kit route links. A bottom bar
 * shows copyright and legal links. Use as the closing site footer for
 * construction firms, contractors, builders, or trades businesses.
 * Renders fully with no props via baked-in defaults.
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
export const ConstructionFooter = defineCapsule({
  name: 'ConstructionFooter',
  description:
    'Four-column footer for a construction / general contractor page: a multi-column layout with a brand logo tile + company blurb + social buttons on the left, service links and company links in the middle columns, and contact info (address, phone, email) on the right. Every link and social button routes through section-kit route links. A bottom bar shows copyright and legal links. Use as the closing site footer for construction firms, contractors, builders, or trades businesses.',
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Blurb paragraph under the brand name. */
    about: z.string().optional(),
    /** Services column title. */
    servicesTitle: z.string().optional(),
    /** Services link labels. */
    servicesLinks: z.array(z.string()).optional(),
    /** Company column title. */
    companyTitle: z.string().optional(),
    /** Company link labels. */
    companyLinks: z.array(z.string()).optional(),
    /** Contact column title. */
    contactTitle: z.string().optional(),
    /** Street address. */
    address: z.string().optional(),
    /** Phone number. */
    phone: z.string().optional(),
    /** Email address. */
    email: z.string().optional(),
    /** Social link labels (first letter shown as a button). */
    socials: z.array(z.string()).optional(),
    /** Legal link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the year. */
    note: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'BuiltRight'
    const about =
      props.about ??
      'Building excellence since 1987. Commercial and residential construction across the Pacific Northwest.'
    const socials = props.socials?.length
      ? props.socials
      : ['LinkedIn', 'Instagram', 'Facebook']
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Licenses']
    const note = props.note ?? 'All rights reserved.'
    const LogoMark = ({
      className,
      tone = 'primary',
    }: {
      className?: string
      tone?: string
    }) => (
      <span
        className={cn(
          'grid place-items-center rounded-md',
          tone === 'primary'
            ? 'bg-primary text-primary-foreground'
            : 'bg-foreground text-background',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
        </svg>
      </span>
    )
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoMark />}>
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
            <FooterCopyright>{note}</FooterCopyright>
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
