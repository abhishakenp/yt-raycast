import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

const brandMark = (
  <span
    className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
    aria-hidden="true"
  >
    <svg
      width="60%"
      height="60%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  </span>
)

export const PetVeterinaryNavbar = defineComponent({
  name: "PetVeterinaryNavbar",
  description:
    "Warm, caring navigation header for a veterinary clinic / pet-healthcare site, composing the shared SiteNav kit composite. Renders a friendly paw-glyph brand mark in a rounded primary tile, the clinic wordmark, a desktop link row (Services, Pricing, Our Team, Reviews, Contact), an optional click-to-call phone number, and a filled primary 'Book Appointment' CTA — with a real mobile drawer on small screens. All links and the CTA route via SiteNav's useNavigate wiring. Use it as the sticky site header for veterinary clinics, animal hospitals, pet healthcare practices, vet offices, or emergency animal care.",
  props: z.object({
    /** Clinic / brand name shown beside the paw mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Click-to-call phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Filled primary pill CTA label on the right. */
    cta: z.string().optional(),
    /** Route target for the CTA (defaults to "Contact"). */
    ctaTarget: z.string().optional(),
    /** Route target for the brand / home click. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? "Paws & Care"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Pricing", "Our Team", "Reviews", "Contact"]
    const cta = props.cta ?? "Book Appointment"
    const ctaTarget = props.ctaTarget ?? "Contact"

    return (
      <SiteNav
        brand={brand}
        brandMark={brandMark}
        brandClassName="font-semibold"
        nav={nav}
        phone={props.phone ?? "(555) 123-4567"}
        cta={{ label: cta, target: ctaTarget, variant: "primary" }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
