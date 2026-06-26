import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * LinkInBioFooter — a bold, mobile-first closing footer for a "link in bio" /
 * single-page link hub (Linktree / Bento style personal landing). Thin
 * configuration over the shared `SiteFooter` composite: a creator wordmark
 * beside an inline spark mark, a short tagline, a social row, and a couple of
 * compact link columns (Links, More) folded into the responsive grid, plus a
 * bordered-top bottom bar with an auto-updating copyright line and legal links.
 * Use to close a creator/influencer link hub, freelancer bio link, or personal
 * landing page. Renders fully with no props via baked-in "Sarah Chen" defaults.
 */
const SparkMark = ({ className }: { className?: string }) => (
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
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" />
  </svg>
)

export const LinkInBioFooter = defineComponent({
  name: 'LinkInBioFooter',
  description:
    'Bold, mobile-first closing footer for a LINK-IN-BIO / single-page link hub (Linktree / Bento style personal landing): a creator wordmark beside an inline spark mark, a short tagline, a social row (Twitter, Instagram, GitHub, LinkedIn), and a couple of compact link columns (Links, More) in a responsive grid; a bordered-top bottom bar holds an auto-updating copyright line plus legal links. Every brand, social, and column link routes through useNavigate. Use to close a creator/influencer link hub, freelancer bio link, or personal landing page.',
  props: z.object({
    /** Creator / person name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Compact link columns (Links, More, …), each a title + labels. */
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
      : [
          { label: 'Twitter' },
          { label: 'Instagram' },
          { label: 'GitHub' },
          { label: 'LinkedIn' },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Links',
            links: ['Portfolio', 'Newsletter', 'Shop', 'Book a Call'],
          },
          {
            title: 'More',
            links: ['About', 'Contact'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'Sarah Chen'}
        brandMark={<SparkMark className="size-7 text-primary" />}
        brandClassName="text-xl font-bold tracking-tight"
        tagline={props.tagline ?? 'Design engineer. All my links in one place.'}
        social={social}
        columns={columns}
        legal={['Privacy', 'Terms']}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
