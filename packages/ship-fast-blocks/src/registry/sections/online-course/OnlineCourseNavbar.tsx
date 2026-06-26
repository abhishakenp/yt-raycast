import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

const brandMark = (
  <svg
    className="size-8 text-primary"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

/**
 * OnlineCourseNavbar — sticky top navigation header for an online-course /
 * e-learning platform. Composes the shared SiteNav kit composite to render a
 * book/open-pages brand mark, a wordmark, a desktop link row, and a single
 * solid primary "Enroll" call to action with a real mobile drawer. Brand,
 * links, and CTA all route through the kit's useNavigate so labels drive
 * page-switching. Use as the site header for course platforms, e-learning
 * marketplaces, MOOCs, bootcamps, academies, or training providers. Renders
 * fully with no props via baked-in "LearnSpace" defaults.
 */
export const OnlineCourseNavbar = defineComponent({
  name: 'OnlineCourseNavbar',
  description:
    "Sticky top navigation header for an online-course / e-learning platform built on the shared SiteNav kit composite: a book/open-pages brand mark, a wordmark, a desktop link row, and a single solid primary 'Enroll' CTA with a real mobile drawer. Brand, links, and CTA all route through the kit's useNavigate for page-switching. Use as the site header for course platforms, e-learning marketplaces, MOOCs, bootcamps, academies, or training providers.",
  props: z.object({
    /** Brand / platform name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Retained for backward compatibility; SiteNav exposes a single CTA, so this is not rendered separately. */
    signIn: z.string().optional(),
    /** Solid primary CTA label on the right. */
    cta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'LearnSpace'
    const nav = props.nav?.length
      ? props.nav
      : ['Courses', 'Instructors', 'Pricing', 'FAQ']

    return (
      <SiteNav
        brand={brand}
        brandMark={brandMark}
        brandClassName="font-semibold tracking-tight"
        nav={nav}
        cta={{
          label: props.cta ?? 'Enroll',
          target: props.ctaTarget ?? 'Pricing',
          variant: 'primary',
        }}
        homeTarget={nav[0]}
        className={props.className}
      />
    )
  },
})
