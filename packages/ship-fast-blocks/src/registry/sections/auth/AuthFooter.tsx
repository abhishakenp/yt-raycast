import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * AuthFooter — rich, multi-column closing footer for Authly, a developer
 * authentication product. Thin configuration over the shared `SiteFooter`
 * composite: a sharp sans wordmark beside an inline keyhole / shield mark, a
 * developer-focused tagline, a social row (GitHub, X, Discord), and a responsive
 * grid of link columns (Product, Developers, Company, Legal). The bottom bar
 * carries an auto-updating copyright note. Use as the site-wide footer for auth
 * platforms, identity APIs, login SDKs, or developer SaaS. Renders fully with no
 * props.
 */
const KeyholeMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2a7 7 0 0 0-7 7c0 2.9 1.76 5.39 4.27 6.46L8 22h8l-1.27-6.54A7 7 0 0 0 12 2Z" />
    <circle cx="12" cy="9" r="2.2" />
  </svg>
)

export const AuthFooter = defineComponent({
  name: 'AuthFooter',
  description:
    'Rich, multi-column closing footer for a developer-auth product built on the shared SiteFooter composite: a sharp sans wordmark + keyhole/shield mark, a developer-focused tagline, a social row (GitHub, X, Discord), and a responsive grid of link columns (Product, Developers, Company, Legal); a bordered-top bottom bar holds an auto-updating copyright note. Use as the site-wide footer for auth platforms, identity APIs, login SDKs, or developer SaaS landing pages.',
  props: z.object({
    /** Product / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Product, Developers, Company, Legal, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'GitHub' }, { label: 'X' }, { label: 'Discord' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Pricing', 'Customers', 'Changelog', 'Status'],
          },
          {
            title: 'Developers',
            links: ['Docs', 'API Reference', 'SDKs', 'Quickstart', 'Examples'],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Careers', 'Security', 'Contact'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'DPA', 'Compliance'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Authly'}
        brandMark={<KeyholeMark className="size-7 text-primary" />}
        brandClassName="text-xl font-semibold tracking-tight"
        tagline={
          props.tagline ??
          'Authentication for developers — secure sign-in, SSO, and MFA behind a clean API.'
        }
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
