import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

function UniversityBrandMark() {
  return (
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
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
      <path d="M22 10v6" />
    </svg>
  )
}

export const UniversityNavbar = defineComponent({
  name: "UniversityNavbar",
  description:
    "Prestigious collegiate site header for the University page family. Composes the shared SiteNav kit composite with a serif wordmark, a graduation-cap brand mark, academic nav links, an optional admissions phone line, and a prominent 'Apply' call to action targeting the Admissions page. Use as the top band of any university homepage or as the persistent header across a multi-page campus site.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    homeTarget: z.string().optional(),
    sticky: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? "Whitmore University"
    const nav = props.nav?.length
      ? props.nav
      : ["Academics", "Admissions", "Campus Life", "Research", "About"]
    const phone = props.phone ?? "Admissions: (800) 555-0142"
    const ctaLabel = props.ctaLabel ?? "Apply"
    const ctaTarget = props.ctaTarget ?? "Admissions"

    return (
      <SiteNav
        brand={brand}
        brandMark={<UniversityBrandMark />}
        brandClassName="font-serif"
        nav={nav}
        phone={phone}
        cta={{ label: ctaLabel, target: ctaTarget }}
        homeTarget={props.homeTarget ?? nav[0]}
        sticky={props.sticky}
        className={props.className}
      />
    )
  },
})
