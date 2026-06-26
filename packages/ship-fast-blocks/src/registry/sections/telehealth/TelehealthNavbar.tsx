import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

export const TelehealthNavbar = defineComponent({
  name: 'TelehealthNavbar',
  description:
    "Sticky top navigation header for a telehealth / virtual care site, built on the shared SiteNav composite. Renders a calm medical brand mark (heart-pulse glyph in primary), the brand name, a row of section links (How it works, Services, Pricing, Reviews, FAQ), an optional click-to-call phone number, and a prominent 'Book a Visit' CTA that routes to the contact page. Includes a real mobile drawer for small screens. Use as the first band of any telehealth page so visitors can immediately reach booking, pricing, or support.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'MendWell'
    const nav = props.nav?.length
      ? props.nav
      : ['How it works', 'Services', 'Pricing', 'Reviews', 'FAQ']
    const phone = props.phone ?? '(800) 555-0142'
    const ctaLabel = props.ctaLabel ?? 'Book a Visit'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const homeTarget = props.homeTarget ?? 'Home'

    const brandMark = (
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
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
      <SiteNav
        brand={brand}
        brandMark={brandMark}
        nav={nav}
        phone={phone}
        cta={{ label: ctaLabel, target: ctaTarget, variant: 'primary' }}
        homeTarget={homeTarget}
        className={props.className}
      />
    )
  },
})
