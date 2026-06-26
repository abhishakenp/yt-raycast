import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

const Mark = ({ className }: { className?: string }) => (
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
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M8.12 8.12 20 20" />
    <path d="M8.12 15.88 20 4" />
    <line x1="14.8" y1="14.8" x2="20" y2="20" />
  </svg>
)

export const SalonBarberFooter = defineComponent({
  name: 'SalonBarberFooter',
  description:
    "Barbershop / salon site footer built on the shared SiteFooter composite. Renders a grooming brand with a scissors brand mark, a tagline, social links, and columns for hours, location, services, and quick links. Use it as the closing footer on any barbershop, salon, or men's grooming site to surface hours, address, and contact details below the fold.",
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    social: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().optional(),
        }),
      )
      .optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: 'TikTok' }, { label: 'Facebook' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Hours',
            links: [
              'Mon–Fri · 9am–8pm',
              'Saturday · 9am–6pm',
              'Sunday · 11am–5pm',
            ],
          },
          {
            title: 'Visit',
            links: [
              '88 Barber Lane, New York, NY 10012',
              '(212) 555-0147',
              'hello@fadeandco.com',
            ],
          },
          {
            title: 'Services',
            links: ['Haircuts', 'Color', 'Beard & Grooming', 'Styling'],
          },
          {
            title: 'More',
            links: ['Gallery', 'Pricing', 'Team', 'Book Now'],
          },
        ]
    return (
      <SiteFooter
        brand={props.brand ?? 'Fade & Co.'}
        brandMark={<Mark className="size-7 text-primary" />}
        tagline={props.tagline ?? 'Modern barbering for the well-groomed.'}
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
