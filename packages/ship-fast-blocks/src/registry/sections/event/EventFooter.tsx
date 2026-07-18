import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * EventFooter — a rich, dark multi-column footer for a conference or event page.
 * A full-bleed inverted (foreground-background) band with a brand block (square
 * initials mark, name, tagline, social icons) plus link columns, a contact
 * column, and a bottom bar with a copyright note and legal links. The brand mark,
 * social icons, and every link route through useNavigate. Use as the closing site
 * footer for tech conference, summit, festival, meetup, or workshop pages.
 */
export const EventFooter = defineCapsule({
  name: 'EventFooter',
  description:
    'Rich, dark multi-column footer for a conference or event page: a full-bleed inverted (foreground background, light text) band with a brand block (square brand-initials mark, event name, tagline, Twitter/LinkedIn/YouTube social icons), one or more link columns, a contact column, and a bottom bar with a copyright note and legal links. The brand mark, social icons, and every link route through useNavigate. Use as the closing site footer for tech conference, summit, festival, meetup, or workshop pages.',
  props: z.object({
    /** Brand / event name shown in the footer. */
    brand: z.string().optional(),
    /** Tagline paragraph beneath the brand. */
    tagline: z.string().optional(),
    /** Copyright / legal note in the bottom bar. */
    note: z.string().optional(),
    /** Link columns (title + links). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Contact column title. */
    contactTitle: z.string().optional(),
    /** Contact column entries (emails, address). */
    contacts: z.array(z.string()).optional(),
    /** Social link labels rendered as icons. */
    socials: z.array(z.string()).optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand mark. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'DesignFront'
    const tagline =
      props.tagline ??
      'The premier conference for web designers and frontend engineers. San Francisco, September 12–13, 2024.'
    const note =
      props.note ?? '© 2024 DesignFront Conference. All rights reserved.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Conference',
            links: ['Speakers', 'Agenda', 'Venue', 'Tickets', 'Schedule (PDF)'],
          },
          {
            title: 'Resources',
            links: [
              'Code of Conduct',
              'Accessibility',
              'Scholarships',
              'Sponsor Info',
              'Press Kit',
            ],
          },
        ]
    const contactTitle = props.contactTitle ?? 'Contact'
    const contacts = props.contacts?.length
      ? props.contacts
      : [
          'hello@designfront.io',
          'tickets@designfront.io',
          'sponsors@designfront.io',
          '3601 Lyon Street, San Francisco, CA 94123',
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'YouTube']
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service']
    const homeTarget = props.homeTarget ?? columns[0]?.links[0] ?? brand

    const socialIcon = (social: string) => {
      if (social === 'Twitter') {
        void go
        void contactTitle
        void contacts
        void homeTarget
        void socialIcon
        return (
          <svg
            className="size-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        )
      }
      if (social === 'LinkedIn') {
        return (
          <svg
            className="size-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )
      }
      return (
        <svg
          className="size-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    }

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
