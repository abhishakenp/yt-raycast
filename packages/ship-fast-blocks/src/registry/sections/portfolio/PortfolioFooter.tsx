import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteFooter } from "#/section-kit/SiteFooter.tsx"

/**
 * PortfolioFooter — a rich, multi-column closing footer for a creative-individual
 * portfolio. Thin configuration over the shared `SiteFooter` composite: a bold
 * wordmark, a tagline, a social row (Instagram, Behance, LinkedIn), and a
 * responsive grid of link columns (Explore, Services, Contact) where contact
 * details fold in as links. The bottom bar carries an auto-updating copyright
 * line. Use as the site-wide footer for a 3D artist, motion designer, art
 * director, or freelance creative site. Renders fully with no props via baked-in
 * "Kaelen Vance" defaults.
 */
export const PortfolioFooter = defineComponent({
  name: "PortfolioFooter",
  description:
    "Rich, multi-column closing footer for a creative-individual portfolio built on the shared SiteFooter composite: a bold wordmark + tagline + social row (Instagram, Behance, LinkedIn), a responsive grid of link columns (Explore, Services, Contact) with contact details folded in as links, and a bordered-top bottom bar with an auto-updating copyright line. Every brand, social, and column link routes through useNavigate. Use as the site-wide footer for a 3D artist, motion designer, art director, or freelance creative site.",
  props: z.object({
    /** Brand / person name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Explore, Services, Contact, …), each a title + labels. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: "Instagram" }, { label: "Behance" }, { label: "LinkedIn" }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Explore",
            links: ["Work", "About", "Services", "Contact"],
          },
          {
            title: "Services",
            links: ["Art Direction", "Motion Design", "3D & CGI", "Branding"],
          },
          {
            title: "Contact",
            links: [
              "hello@kaelenvance.com",
              "Based in Berlin · Working worldwide",
              "Get in touch",
            ],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? "Kaelen Vance"}
        brandClassName="text-xl font-bold tracking-tight"
        tagline={
          props.tagline ??
          "Motion designer and art director crafting dimensional stories that move."
        }
        social={social}
        columns={columns}
        note={props.note ?? "All rights reserved."}
        className={props.className}
      />
    )
  },
})
