import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

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

export const SalonBarberNavbar = defineComponent({
  name: "SalonBarberNavbar",
  description:
    "Sticky barbershop / salon header built on the shared SiteNav composite. Renders a confident grooming brand with a scissors brand mark, desktop nav links, a tap-to-call phone number, and a primary booking CTA, plus a real mobile drawer. Use it as the top-of-page header for any barbershop, salon, or men's grooming site, or as the global nav band when composing a multi-page grooming experience.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    homeTarget: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length ? props.nav : ["Services", "Gallery", "Team", "Pricing"]
    return (
      <SiteNav
        brand={props.brand ?? "Fade & Co."}
        brandMark={<Mark className="size-8 text-primary" />}
        brandClassName="text-xl font-semibold tracking-tight"
        nav={nav}
        phone={props.phone ?? "(212) 555-0147"}
        cta={{ label: props.ctaLabel ?? "Book Now", target: props.ctaTarget ?? "Pricing" }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
