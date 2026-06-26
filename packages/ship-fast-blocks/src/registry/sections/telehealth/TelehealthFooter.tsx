import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

export const TelehealthFooter = defineComponent({
  name: 'TelehealthFooter',
  description:
    'Site footer for a telehealth / virtual care brand, built on the shared SiteFooter composite. Renders a calm medical brand mark and name, a short tagline, multiple link columns (Services, Company, Support, Legal), a social row, and a bottom bar with copyright and a compliance note. Fully theme-tokened and responsive. Use as the final band of any telehealth page to provide navigation, trust links, and legal context.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'MendWell'
    const tagline =
      props.tagline ??
      'Calm, board-certified virtual care for you and your family — whenever you need it.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Services',
            links: [
              'Primary Care',
              'Mental Health',
              'Prescriptions',
              'Urgent Care',
            ],
          },
          {
            title: 'Company',
            links: ['About', 'How it works', 'Careers', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Contact', 'Insurance', 'FAQ'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'HIPAA Notice', 'Accessibility'],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'Instagram' }, { label: 'LinkedIn' }]
    const note = props.note ?? 'Not for medical emergencies — call 911.'

    const brandMark = (
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12h4l2 5 4-12 2 7h6" />
        </svg>
      </span>
    )

    return (
      <SiteFooter
        brand={brand}
        brandMark={brandMark}
        tagline={tagline}
        columns={columns}
        social={social}
        legal={['Privacy', 'Terms', 'Cookies']}
        note={note}
        className={props.className}
      />
    )
  },
})
