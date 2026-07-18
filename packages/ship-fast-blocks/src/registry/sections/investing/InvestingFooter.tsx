import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * InvestingFooter — rich multi-column footer for an investing / fintech site. A
 * muted, bordered-top footer: a brand block (trend-line logo tile + name,
 * tagline, and a row of social-initial buttons) beside a responsive grid of
 * link columns, above a divider row carrying an auto-updating copyright line and
 * a small FINRA/SIPC-style legal disclosure. The brand button, social buttons
 * and every link route through useNavigate. Use as the closing site footer for
 * a brokerage, trading app, robo-advisor or crypto exchange. Renders fully with
 * no props via baked-in "Vestora" defaults.
 */
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'
export const InvestingFooter = defineCapsule({
  name: 'InvestingFooter',
  description:
    'Rich multi-column footer for an investing / fintech site: a muted bordered-top footer with a brand block (trend-line logo tile + name, tagline, and a row of social-initial buttons) beside a responsive grid of link columns, above a divider row carrying an auto-updating copyright line and a small FINRA/SIPC-style legal disclosure. The brand button, social buttons and every link route through useNavigate. Use as the closing site footer for a brokerage, trading app, robo-advisor or crypto exchange.',
  props: z.object({
    /** Brand / platform name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Tagline beneath the brand. */
    tagline: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright line (auto-built from brand + year if omitted). */
    copyright: z.string().optional(),
    /** Small legal disclosure line. */
    disclosure: z.string().optional(),
    /** Social link labels (rendered as initial buttons). */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Vestora'
    const homeTarget = props.homeTarget ?? 'Features'
    const tagline =
      props.tagline ??
      'Modern investing for everyone. Trade stocks, ETFs, options, and crypto with zero commission.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Pricing', 'Mobile App', 'API'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Press', 'Blog'],
          },
          {
            title: 'Resources',
            links: [
              'Help Center',
              'Investing 101',
              'Market News',
              'Tax Center',
            ],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Disclosures', 'FINRA'],
          },
        ]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Inc. All rights reserved.`
    const disclosure =
      props.disclosure ??
      `Securities trading offered through ${brand} Securities LLC, member FINRA/SIPC. Crypto trading offered through ${brand} Crypto LLC. Investing involves risk, including loss of principal.`
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'Instagram']
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[62%]"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </span>
    )
    void homeTarget
    void disclosure
    return (
      <SiteFooter
        brand={brand}
        brandMark={<LogoMark />}
        tagline={tagline}
        columns={columns}
        social={socials.map((s) => ({ label: s }))}
        note={copyright}
        className={props.className}
      />
    )
  },
})
