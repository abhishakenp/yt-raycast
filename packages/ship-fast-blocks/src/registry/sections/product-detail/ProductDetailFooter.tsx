import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteFooter } from "#/section-kit/SiteFooter.tsx"

export const ProductDetailFooter = defineComponent({
  name: "ProductDetailFooter",
  description:
    "Site footer for the Product Detail page family, wrapping the shared SiteFooter composite. Renders the Aurora brand mark and tagline, multi-column Shop / Support / Company / Legal link groups, a social row, and a bottom legal bar — tuned for a premium single-product page like the Aurora Pro Headphones. Use as the closing band of a product detail page; fully prop-driven with Aurora defaults.",
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
    const brand = props.brand ?? "Aurora"
    const tagline = props.tagline ?? "Premium audio, engineered for everyday life."
    const columns = props.columns?.length
      ? props.columns
      : [
          { title: "Shop", links: ["Aurora Pro", "Aurora Air", "Accessories", "Gift Cards"] },
          { title: "Support", links: ["Help Center", "Shipping", "Returns", "Warranty"] },
          { title: "Company", links: ["About", "Careers", "Press", "Sustainability"] },
          { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
        ]
    const social = props.social?.length
      ? props.social
      : [{ label: "Instagram" }, { label: "YouTube" }, { label: "X" }]
    const legal = props.legal?.length ? props.legal : ["Privacy", "Terms", "Accessibility"]
    const note = props.note ?? "Crafted in California."

    const mark = (
      <svg
        width={28}
        height={28}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M4 13a8 8 0 0 1 16 0" />
        <rect x="3" y="13" width="4" height="7" rx="1.4" />
        <rect x="17" y="13" width="4" height="7" rx="1.4" />
      </svg>
    )

    return (
      <SiteFooter
        brand={brand}
        brandMark={mark}
        tagline={tagline}
        columns={columns}
        social={social}
        legal={legal}
        note={note}
        className={props.className}
      />
    )
  },
})
