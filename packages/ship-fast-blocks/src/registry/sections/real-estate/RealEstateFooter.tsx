import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteFooter } from "#/section-kit/SiteFooter.tsx"

/**
 * RealEstateFooter — full sitewide footer for a premium brokerage. A top region
 * pairs a brand block (serif wordmark, blurb, office addresses, and a contact
 * line) with several labeled link columns, all over a token surface. A bordered
 * bottom row carries social links and an auto-updating copyright. The wordmark
 * and every link route through useNavigate. Use as the closing footer for a
 * real-estate brokerage or agent site. Renders fully with no props via baked
 * defaults.
 */
export const RealEstateFooter = defineComponent({
  name: "RealEstateFooter",
  description:
    "Full sitewide footer for a premium brokerage: a top region pairing a brand block (serif wordmark, blurb, office addresses, contact line) with several labeled link columns over a token surface, plus a bordered bottom row with social links and an auto-updating copyright. Wordmark and links route through useNavigate. Use as the closing footer for a real-estate brokerage or agent site.",
  props: z.object({
    /** Serif brand wordmark. */
    brand: z.string().optional(),
    /** Short blurb under the wordmark. */
    blurb: z.string().optional(),
    /** Office address lines. */
    offices: z.array(z.string()).optional(),
    /** Contact line (phone / email). */
    contact: z.string().optional(),
    /** Link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social link labels. */
    social: z.array(z.string()).optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const blurb =
      props.blurb ??
      "A full-service brokerage helping families buy, sell, and invest across the region since 1998."
    const offices = props.offices?.length
      ? props.offices
      : ["812 Linden Ave, Oak Park", "47 Harborline Dr, Bayshore"]
    const contact = props.contact ?? "(415) 555-0148 · hello@marburyco.com"
    const columns = props.columns?.length
      ? props.columns
      : [
          { title: "Buy", links: ["Search Homes", "New Listings", "Open Houses", "Mortgage"] },
          { title: "Sell", links: ["Home Valuation", "List With Us", "Seller Guide"] },
          { title: "Company", links: ["Our Agents", "About", "Careers", "Contact"] },
        ]
    const visitColumn = {
      title: "Visit",
      links: [...offices, contact],
    }
    const social = props.social?.length
      ? props.social
      : ["Instagram", "Facebook", "LinkedIn"]

    return (
      <SiteFooter
        brand={props.brand ?? "Marbury & Co."}
        brandClassName="font-serif text-xl font-semibold tracking-tight"
        tagline={blurb}
        columns={[...columns, visitColumn]}
        social={social.map((label) => ({ label }))}
        note={props.note ?? "All rights reserved."}
        className={props.className}
      />
    )
  },
})
