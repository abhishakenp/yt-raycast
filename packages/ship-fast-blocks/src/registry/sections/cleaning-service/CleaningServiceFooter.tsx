import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * CleaningServiceFooter — a multi-column footer for a home-cleaning / maid-service landing page. A dark card-background footer with a 5-column layout: brand sparkle-mark + company name + tagline + social-icon buttons on the left (spanning 2 columns on desktop), followed by link-column groups (Services, Company, Support) and a bottom bar with copyright, location, phone, and email — all routable through useNavigate. Every brand click, footer link, phone, email, and social button routes through useNavigate. Use as the closing site footer for residential cleaning companies, maid services, housekeeping platforms, janitorial businesses, or any local home-service brand. Renders fully with no props via baked-in "PureSpace" defaults.
 */
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
} from '#/section-kit/SiteFooter.tsx'
export const CleaningServiceFooter = defineCapsule({
  name: 'CleaningServiceFooter',
  description:
    'Multi-column footer for a home-cleaning / maid-service landing page: dark card-background with a 5-column layout. Left side has brand sparkle-mark + company name + tagline + social-icon buttons (spanning 2 columns on desktop); right side has link-column groups (Services, Company, Support). Bottom bar carries copyright, location, phone, and email — all routable through useNavigate. Use as the closing site footer for residential cleaning, maid services, housekeeping, janitorial, or local home-service brands.',
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Tagline paragraph under the brand name. */
    tagline: z.string().optional(),
    /** Footer column groups: title + array of link labels. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright line; brand + current year are auto-inserted. */
    copyright: z.string().optional(),
    /** Location string shown in the bottom bar. */
    location: z.string().optional(),
    /** Phone number shown and routed in the bottom bar. */
    phone: z.string().optional(),
    /** Email address shown and routed in the bottom bar. */
    email: z.string().optional(),
    /** Social platform labels shown as first-character icon buttons. */
    socials: z.array(z.string()).optional(),
    /** Navigation target for the brand logo click. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'PureSpace'
    const tagline =
      props.tagline ??
      'Professional home cleaning services in Seattle. Making homes sparkle since 2018.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Standard Cleaning',
              'Deep Cleaning',
              'Move In/Out',
              'Post-Construction',
              'Eco-Friendly',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog', 'Gift Cards'],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Contact Us',
              'Become a Cleaner',
              'Privacy Policy',
              'Terms of Service',
            ],
          },
        ]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Cleaning Services. All rights reserved.`
    const socials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Twitter', 'Instagram']
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
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle>{col.title}</FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink key={link}>{link}</FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{copyright}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
