import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

function UniversityBrandMark() {
  return (
    <svg
      className="size-6 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
      <path d="M22 10v6" />
    </svg>
  )
}

export const UniversityFooter = defineCapsule({
  name: 'UniversityFooter',
  description:
    'Prestigious collegiate site footer for the University page family. Composes the shared SiteFooter kit composite with a serif wordmark and graduation-cap brand mark, an institutional tagline, four link columns (Academics, Admissions, Campus, About), a social row, and a legal note. Use as the closing band of any university homepage or as the persistent footer across a multi-page campus site.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    legal: z.array(z.string()).optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Whitmore University'
    const tagline =
      props.tagline ?? 'Lux et Veritas — light and truth since 1887.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Academics',
            links: [
              'Colleges & Schools',
              'Majors',
              'Graduate Programs',
              'Libraries',
            ],
          },
          {
            title: 'Admissions',
            links: ['Apply', 'Visit', 'Financial Aid', 'Transfer Students'],
          },
          {
            title: 'Campus',
            links: ['Campus Life', 'Housing', 'Athletics', 'Dining'],
          },
          {
            title: 'About',
            links: ['Our History', 'Leadership', 'News', 'Contact'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: 'Instagram' },
          { label: 'LinkedIn' },
          { label: 'YouTube' },
          { label: 'X' },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Accessibility', 'Title IX', 'Nondiscrimination']
    const note = props.note ?? 'All rights reserved.'

    return (
      <SiteFooter
        brand={brand}
        brandMark={<UniversityBrandMark />}
        brandClassName="font-serif"
        tagline={tagline}
        columns={columns}
        social={social}
        legal={legal}
        note={note}
        className={props.className}
      />
    )
  },
})
