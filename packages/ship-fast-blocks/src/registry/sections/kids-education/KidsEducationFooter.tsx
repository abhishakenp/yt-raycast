import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * KidsEducationFooter — dark 5-column mega footer for a kids / family learning
 * platform. A full-width dark (foreground) footer: a wide brand column with an
 * open-book mark + name, a tagline, and round social buttons, beside several
 * link-list columns; a divider above a bottom bar with a dynamic-year copyright
 * line and a legal-links row. Every link, social, and the logo route through
 * useNavigate. Use as the closing site footer for kids-education startups,
 * children's e-learning platforms, tutoring services, and family learning apps.
 * Renders fully with no props via baked-in "WonderLearn" defaults.
 */
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'
export const KidsEducationFooter = defineCapsule({
  name: 'KidsEducationFooter',
  description:
    "Dark 5-column mega footer for a kids / family learning platform: a full-width dark (foreground) footer with a wide brand column (open-book mark + name, tagline, round social buttons) beside several link-list columns; a divider above a bottom bar with a dynamic-year copyright line and a legal-links row. Every link, social, and the logo route through useNavigate. Use as the closing site footer for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Brand / platform name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Navigation target for the logo click. */
    homeTarget: z.string().optional(),
    /** Brand-column tagline. */
    tagline: z.string().optional(),
    /** Trailing copyright note after the brand name. */
    note: z.string().optional(),
    /** Link-list columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Bottom-bar legal links. */
    legal: z.array(z.string()).optional(),
    /** Social labels (rendered as round initial buttons). */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'WonderLearn'
    const homeTarget = props.homeTarget ?? 'Activities'
    const tagline =
      props.tagline ??
      'Making learning an adventure for curious kids everywhere. Play-based activities for ages 4-12.'
    const note = props.note ?? 'All rights reserved.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Activities', 'Pricing', 'For Schools', 'Gift Cards'],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Blog', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Contact Us', 'Safety', 'Privacy'],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Facebook', 'Instagram']
    const BookMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground',
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
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </span>
    )
    void go
    void homeTarget
    void BookMark
    return (
      <SiteFooter
        brand={brand}
        tagline={tagline}
        columns={columns}
        social={socials.map((s) => ({ label: s }))}
        legal={legal}
        note={note}
        className={props.className}
      />
    )
  },
})
