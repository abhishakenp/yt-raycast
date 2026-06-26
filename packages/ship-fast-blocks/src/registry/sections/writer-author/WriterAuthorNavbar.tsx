import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * WriterAuthorNavbar — sticky site header for a literary author or novelist
 * site with a serif, letterpress sensibility. Thin configuration over the
 * shared `SiteNav` composite: a serif wordmark beside an inline open-book /
 * feather mark, centered nav links on desktop, an optional press/agent phone
 * number, a "Get the Book" CTA that routes to the Books page, and a real
 * mobile drawer on small screens. Use as the header for author landing pages,
 * book-launch microsites, poets, essayists, or any writer's personal brand
 * where the new release matters. Renders fully with no props via baked-in
 * "Eleanor Vance" defaults.
 */
const FeatherMark = ({ className }: { className?: string }) => (
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
    <path d="M20 4C10 5 7 11 7 17l-3 3" />
    <path d="M20 4c0 6-3 12-13 13" />
    <path d="M11 14h5" />
    <path d="M9 18h5" />
  </svg>
)

export const WriterAuthorNavbar = defineComponent({
  name: 'WriterAuthorNavbar',
  description:
    "Sticky author / novelist site header with a serif, letterpress feel, built on the shared SiteNav composite: serif wordmark + an open-book feather mark, centered desktop nav links, an optional press phone number, a 'Get the Book' CTA routing to the Books page, and a real mobile drawer. Use as the header for author landing pages, book-launch microsites, poets, essayists, or any writer's personal brand.",
  props: z.object({
    /** Author / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Press / agent phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Books', 'About', 'Reviews', 'Newsletter']
    return (
      <SiteNav
        brand={props.brand ?? 'Eleanor Vance'}
        brandMark={<FeatherMark className="size-8 text-primary" />}
        brandClassName="font-serif text-xl font-medium"
        nav={nav}
        phone={props.phone ?? '(212) 555-0148'}
        cta={{
          label: props.ctaLabel ?? 'Get the Book',
          target: props.ctaTarget ?? 'Books',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
