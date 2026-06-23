import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * SpaWellnessNavbar — serene top navigation bar for a day-spa / wellness site.
 * Thin configuration over the shared `SiteNav` composite: a light, airy
 * bordered-bottom bar with a serif wordmark on the left, a centered set of nav
 * links (Treatments / Memberships / Gift Cards / Contact), a filled primary
 * "Book Now" CTA on the right, and a real mobile drawer (Sheet) on small
 * screens. The wordmark and every nav item route through useNavigate. Use as the
 * opening site navigation for spas, wellness retreats, massage studios,
 * bathhouses, and treatment clinics. Renders fully with no props via baked-in
 * defaults.
 */
export const SpaWellnessNavbar = defineComponent({
  name: "SpaWellnessNavbar",
  description:
    "Serene top navigation bar for a day-spa / wellness site built on the shared SiteNav composite: a light bordered-bottom bar with a serif wordmark on the left, centered nav links (Treatments / Memberships / Gift Cards / Contact), a filled primary 'Book Now' CTA on the right, and a real mobile drawer. The wordmark and links route through useNavigate. Use as the opening site navigation for spas, wellness retreats, massage studios, bathhouses, and treatment clinics.",
  props: z.object({
    /** Serif wordmark / brand name on the left. */
    brand: z.string().optional(),
    /** Center nav link labels. */
    links: z.array(z.string()).optional(),
    /** Primary booking CTA label. */
    cta: z.string().optional(),
    /** Route label the CTA navigates to. */
    ctaTarget: z.string().optional(),
    /** Route label the wordmark navigates to. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const links = props.links?.length
      ? props.links
      : ["Treatments", "Memberships", "Gift Cards", "Contact"]
    return (
      <SiteNav
        brand={props.brand ?? "Lumen Spa"}
        brandClassName="font-serif text-xl font-semibold tracking-tight"
        nav={links}
        cta={{
          label: props.cta ?? "Book Now",
          target: props.ctaTarget ?? "Booking",
        }}
        homeTarget={props.homeTarget ?? "Home"}
        className={props.className}
      />
    )
  },
})
