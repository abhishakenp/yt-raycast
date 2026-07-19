import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
/**
 * InsuranceFooter — fat 6-column dark footer for an insurance page. On a
 * foreground-colored band: a wide brand block (shield logo + name, tagline,
 * round social buttons), several link columns (products, company, resources,
 * legal), and a dedicated contact column with phone, email and address rows.
 * A bottom bar shows the copyright note beside alt-driven trust badges. Every
 * link and social routes through useNavigate; badges use the <Image> component.
 * Use as the closing site footer for insurance carriers, insurtech, brokers,
 * or financial-protection products. Renders fully with no props via defaults.
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
export const InsuranceFooter = defineCapsule({
  name: 'InsuranceFooter',
  description:
    'Fat 6-column dark footer for an insurance page on a foreground-colored band: a wide brand block (shield logo + name, tagline, round social buttons), several link columns (products, company, resources, legal), and a dedicated contact column with phone, email and address rows. A bottom bar shows the copyright note beside alt-driven trust badges. Every link and social routes through useNavigate; badges use the Image component. Use as the closing site footer for insurance carriers, insurtech startups, brokers, or financial-protection products.',
  props: z.object({
    /** Brand / company name shown beside the shield logo. */
    brand: z.string().optional(),
    /** Blurb paragraph under the brand name. */
    tagline: z.string().optional(),
    /** Link columns (title + link labels). */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Contact column title. */
    contactTitle: z.string().optional(),
    /** Phone number row. */
    phone: z.string().optional(),
    /** Email address row. */
    email: z.string().optional(),
    /** Street address row. */
    address: z.string().optional(),
    /** Copyright line in the bottom bar. */
    copyright: z.string().optional(),
    /** Social link labels (first letter shown as a button). */
    socials: z.array(z.string()).optional(),
    /** Alt strings for the bottom-bar trust badges. */
    badges: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'SecureLife'
    const tagline =
      props.tagline ??
      'Protecting what matters most for over 25 years. Licensed in all 50 states.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Products',
            links: [
              'Home Insurance',
              'Auto Insurance',
              'Life Insurance',
              'Health Insurance',
              'Renters Insurance',
            ],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'],
          },
          {
            title: 'Resources',
            links: [
              'Help Center',
              'Claims Center',
              'Agent Portal',
              'Policy Documents',
              'Insurance 101',
            ],
          },
          {
            title: 'Legal',
            links: [
              'Privacy Policy',
              'Terms of Service',
              'Cookie Policy',
              'Licenses',
              'Sitemap',
            ],
          },
        ]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Insurance. All rights reserved.`
    const socials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Twitter', 'LinkedIn']
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
