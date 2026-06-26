import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * OnlineCourseFooter — a rich, multi-column closing footer for an online-course
 * / e-learning site. Thin configuration over the shared SiteFooter composite: a
 * semibold wordmark beside a book/open-pages brand mark, a tagline, a social
 * row (Twitter / LinkedIn / YouTube), and a responsive grid of link columns
 * (Learn, Platform, Company, Support). A bordered-top bottom bar carries an
 * auto-updating copyright line and legal links. Use as the site-wide footer for
 * course platforms, e-learning marketplaces, MOOCs, bootcamps, or academies.
 * Renders fully with no props.
 */
const BookMark = ({ className }: { className?: string }) => (
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
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

export const OnlineCourseFooter = defineComponent({
  name: 'OnlineCourseFooter',
  description:
    'Rich, multi-column closing footer for an online-course / e-learning site built on the shared SiteFooter composite: a brand block (semibold wordmark + book/open-pages mark + tagline + social row of Twitter/LinkedIn/YouTube) beside link columns (Learn, Platform, Company, Support), with a bordered-top bottom bar holding an auto-updating copyright line and legal links. Use as the site-wide footer for course platforms, e-learning marketplaces, MOOCs, bootcamps, or academies.',
  props: z.object({
    /** Platform / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Learn, Platform, Company, Support, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Legal links shown in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'Twitter' }, { label: 'LinkedIn' }, { label: 'YouTube' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Learn',
            links: ['Courses', 'Curriculum', 'Instructors', 'Certificates'],
          },
          {
            title: 'Platform',
            links: ['Pricing', 'Mobile app', 'For teams', 'Gift cards'],
          },
          {
            title: 'Company',
            links: ['About', 'Careers', 'Blog', 'Press'],
          },
          {
            title: 'Support',
            links: ['Help center', 'Community', 'Contact', 'FAQ'],
          },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ['Privacy', 'Terms', 'Refunds']

    return (
      <SiteFooter
        brand={props.brand ?? 'LearnSpace'}
        brandMark={<BookMark className="size-8 text-primary" />}
        brandClassName="font-semibold tracking-tight"
        tagline={
          props.tagline ??
          'Practical, project-based courses that turn curiosity into a career.'
        }
        social={social}
        columns={columns}
        legal={legal}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
