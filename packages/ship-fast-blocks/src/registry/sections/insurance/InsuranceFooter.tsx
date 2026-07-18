import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

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
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'
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
    const go = useNavigate()
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
    const contactTitle = props.contactTitle ?? 'Contact'
    const phone = props.phone ?? '1-800-555-0199'
    const email = props.email ?? 'support@securelife.com'
    const address = props.address ?? '500 Insurance Plaza, New York, NY 10004'
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Insurance. All rights reserved.`
    const socials = props.socials?.length
      ? props.socials
      : ['Facebook', 'Twitter', 'LinkedIn']
    const badges = props.badges?.length
      ? props.badges
      : [
          'Better Business Bureau A+ rating badge',
          'Norton Secured SSL certificate badge',
        ]
    const homeTarget = props.homeTarget ?? brand
    const Shield = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </span>
    )
    const Phone = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
    void go
    void contactTitle
    void phone
    void email
    void address
    void badges
    void homeTarget
    void Shield
    void Phone
    return (
      <SiteFooter
        brand={brand}
        tagline={tagline}
        columns={columns}
        social={socials.map((s) => ({ label: s }))}
        note={copyright}
        className={props.className}
      />
    )
  },
})
