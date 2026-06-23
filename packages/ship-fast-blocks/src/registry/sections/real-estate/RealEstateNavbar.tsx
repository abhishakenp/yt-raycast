import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * RealEstateNavbar — confident top navigation for a premium brokerage site. A
 * sticky bordered-bottom bar holds a serif wordmark on the left, a centered
 * inline nav (Buy / Sell / Rent / Agents / Contact) on desktop, and a right
 * cluster with a phone link plus a filled "List a Property" primary CTA. The
 * wordmark, every nav item, the phone link, and the CTA all route through
 * useNavigate. Use as the site header for real-estate brokerages, agent teams,
 * and luxury property firms. Renders fully with no props via baked defaults.
 */
export const RealEstateNavbar = defineComponent({
  name: "RealEstateNavbar",
  description:
    "Confident sticky top navigation for a premium real-estate brokerage: a serif wordmark on the left, a centered Buy / Sell / Rent / Agents / Contact inline nav on desktop, and a right cluster with a phone link plus a filled 'List a Property' primary CTA. Wordmark, nav items, phone, and CTA route through useNavigate. Use as the site header for brokerages, agent teams, and luxury property firms.",
  props: z.object({
    /** Serif brand wordmark on the left. */
    brand: z.string().optional(),
    /** Primary navigation labels. */
    links: z.array(z.string()).optional(),
    /** Phone number shown on the right. */
    phone: z.string().optional(),
    /** Filled primary CTA label. */
    cta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.links?.length
      ? props.links
      : ["Buy", "Sell", "Rent", "Agents", "Contact"]

    return (
      <SiteNav
        brand={props.brand ?? "Marbury & Co."}
        brandClassName="font-serif text-xl font-semibold tracking-tight"
        nav={nav}
        phone={props.phone ?? "(415) 555-0148"}
        cta={{
          label: props.cta ?? "List a Property",
          target: props.ctaTarget ?? "List",
          variant: "primary",
        }}
        homeTarget="Home"
        className={props.className}
      />
    )
  },
})
