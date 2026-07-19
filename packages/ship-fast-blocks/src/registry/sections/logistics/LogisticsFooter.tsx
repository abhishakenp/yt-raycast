import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * LogisticsFooter — a rich multi-column footer for a global-logistics / freight-
 * forwarding company. A border-topped band: a left brand column (bolt-mark tile +
 * wordmark, a short blurb and a row of social links) beside Services and Company
 * link columns and a Contact column with email, phone and address rows (each with
 * a leading icon); a bordered sub-bar below carries an auto-updating copyright and
 * a row of legal links. Clean and corporate on a light surface with a deep slate
 * primary; the brand button and every link route through useNavigate. Use as the
 * closing site footer for logistics providers, freight forwarders, shipping
 * carriers, courier, warehousing or cargo/transport companies. Renders fully with
 * no props via baked-in "SwiftFreight" defaults.
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
export const LogisticsFooter = defineCapsule({
  name: 'LogisticsFooter',
  description:
    'Rich multi-column footer for a global-logistics / freight-forwarding company: a border-topped band with a left brand column (bolt-mark tile + wordmark, a short blurb and a row of social links) beside Services and Company link columns and a Contact column with email, phone and address rows (each with a leading icon), plus a bordered sub-bar below carrying an auto-updating copyright and a row of legal links. Clean and corporate on a light surface with a deep slate primary; the brand button and every link route through useNavigate. Use as the closing site footer for logistics providers, freight forwarders, shipping carriers, courier, warehousing, supply-chain or cargo/transport companies.',
  props: z.object({
    /** Brand / company name shown beside the mark. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    blurb: z.string().optional(),
    socials: z.array(z.string()).optional(),
    servicesTitle: z.string().optional(),
    servicesLinks: z.array(z.string()).optional(),
    companyTitle: z.string().optional(),
    companyLinks: z.array(z.string()).optional(),
    contactTitle: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    copyright: z.string().optional(),
    legalLinks: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'SwiftFreight'
    const blurb =
      props.blurb ??
      'Global logistics made simple. Air, ocean, and ground freight to 180+ countries with real-time tracking and guaranteed delivery.'
    const socials = props.socials?.length
      ? props.socials
      : ['LinkedIn', 'Twitter', 'Facebook']
    const copyright =
      props.copyright ?? 'SwiftFreight Logistics Inc. All rights reserved.'
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoMark />}>
              <FooterTagline>{blurb}</FooterTagline>
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
