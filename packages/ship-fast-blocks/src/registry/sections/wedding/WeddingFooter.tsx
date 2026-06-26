import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

const Mark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="9" cy="13" r="5" />
    <circle cx="15" cy="13" r="5" />
    <path d="M9 8c0-2 1.3-3.5 3-3.5S15 6 15 8" />
  </svg>
)

export const WeddingFooter = defineComponent({
  name: 'WeddingFooter',
  description:
    'Elegant wedding site footer built on the shared SiteFooter composite: a serif couple wordmark with an interlocking-rings mark, a warm tagline, the wedding day details, explore links, and a questions/contact column. Use as the closing band of a wedding invitation or celebration page.',
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
      : [{ label: 'Instagram' }, { label: '#AvaAndLiam' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'The Day',
            links: [
              'September 14, 2025',
              'Willowbrook Gardens',
              'Napa Valley, CA',
            ],
          },
          {
            title: 'Explore',
            links: ['Story', 'Gallery', 'Details', 'RSVP'],
          },
          {
            title: 'Questions?',
            links: ['hello@avaandliam.com', 'FAQ', 'Travel & Stay'],
          },
        ]
    return (
      <SiteFooter
        brand={props.brand ?? 'Ava & Liam'}
        brandMark={<Mark className="size-7 text-primary" />}
        brandClassName="font-serif text-lg font-medium"
        tagline={props.tagline ?? "Can't wait to celebrate with you."}
        social={social}
        columns={columns}
        note={props.note ?? 'With love.'}
        className={props.className}
      />
    )
  },
})
