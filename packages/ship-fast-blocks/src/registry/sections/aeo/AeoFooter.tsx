import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteFooter } from "#/section-kit/SiteFooter.tsx"

/**
 * AeoFooter — multi-column site footer for an Answer-Engine-Optimization (AEO)
 * SaaS. Thin configuration over the shared SiteFooter composite: a citation-spark
 * brand block with tagline, a social row, link columns (Product, Resources,
 * Company, Legal), a bottom note, and legal links. All links route through
 * useNavigate. Use as the closing footer on AEO, generative-search visibility,
 * or brand-citation analytics sites. Renders fully with no props.
 */
const BrandMark = () => (
  <span
    className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground"
    aria-hidden="true"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" />
    </svg>
  </span>
)

export const AeoFooter = defineComponent({
  name: "AeoFooter",
  description:
    "Multi-column site footer for an Answer-Engine-Optimization (AEO) product built on the shared SiteFooter composite: a citation-spark brand block with tagline and social row, link columns (Product, Resources, Company, Legal), a bottom note, and legal links. All links route through useNavigate. Use as the closing footer on AEO, generative-search visibility, or brand-citation analytics sites.",
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    social: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().optional(),
        }),
      )
      .optional(),
    legal: z.array(z.string()).optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? "Citeable"
    const columns = props.columns?.length
      ? props.columns
      : [
          { title: "Product", links: ["Features", "How it works", "Pricing", "FAQ"] },
          { title: "Resources", links: ["AEO Guide", "Blog", "Benchmarks", "API Docs"] },
          { title: "Company", links: ["About", "Customers", "Careers", "Contact"] },
          { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: "X" },
          { label: "LinkedIn" },
          { label: "GitHub" },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ["Privacy", "Terms", "Cookies"]

    return (
      <SiteFooter
        brand={brand}
        brandMark={<BrandMark />}
        tagline={
          props.tagline ??
          "Get cited by AI answers. Track, optimize, and prove your visibility across every answer engine."
        }
        columns={columns}
        social={social}
        legal={legal}
        note={props.note ?? "Win the AI answer."}
        className={props.className}
      />
    )
  },
})
