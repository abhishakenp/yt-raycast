import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * DentalFooter — rich 4-column footer for a dental practice site. A dark inverted
 * section on the foreground color with a brand block (mint tooth-glyph logo +
 * practice name + tagline + initial-letter social buttons), a services link
 * column, an office-hours column (day / time rows), and a contact column with
 * pinned address, click-to-call phone, and email, closed by a copyright + legal
 * bar. Every link, social, phone, and email routes through useNavigate. Use as
 * the closing footer for dentists, dental offices, orthodontists, or clinics.
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
export const DentalFooter = defineCapsule({
  name: 'DentalFooter',
  description:
    'Rich 4-column footer for a dental practice site: a dark inverted section on the foreground color with a brand block (mint tooth-glyph logo + practice name + tagline + initial-letter social buttons), a services link column, an office-hours column (day / time rows), and a contact column with pinned address, click-to-call phone, and email, closed by a copyright + legal bar. Every link, social, phone, and email routes through useNavigate. Use as the closing footer for dentists, dental offices, orthodontists, or clinics.',
  props: z.object({
    /** Practice / brand name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Small eyebrow line under the brand name. */
    brandTagline: z.string().optional(),
    /** Navigation target for the brand logo (typically the first nav item). */
    homeTarget: z.string().optional(),
    tagline: z.string().optional(),
    servicesHeading: z.string().optional(),
    serviceLinks: z.array(z.string()).optional(),
    hoursHeading: z.string().optional(),
    hours: z
      .array(
        z.object({
          day: z.string(),
          time: z.string(),
        }),
      )
      .optional(),
    contactHeading: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    socials: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Bright Smile'
    const footerTagline =
      props.tagline ??
      'Modern, compassionate dental care for the whole family. Your smile is our passion.'
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Instagram', 'Google']
    const footerCopyright =
      props.copyright ?? 'Bright Smile Dental. All rights reserved.'
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Accessibility']
    const ToothMark = () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )
    const LogoBadge = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-xl bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <ToothMark />
      </span>
    )
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand} brandMark={<LogoBadge />}>
              <FooterTagline>{footerTagline}</FooterTagline>
              <FooterSocial>
                {footerSocials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{footerCopyright}</FooterCopyright>
            <FooterLegal>
              {footerLegal.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
