import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteFooter } from "#/section-kit/SiteFooter.tsx"

/**
 * SubscriptionBoxFooter — site footer for a subscription-box brand built on the
 * shared SiteFooter composite. A gift-box wordmark + ribboned mark, a playful
 * tagline, link columns (Shop, Company, Support, Legal), a social row, and a
 * bottom note. Theme-token only and renders complete with no props. Use as the
 * footer for any curated-box, recurring-delivery, or membership-kit page.
 */
const GiftBoxMark = ({ className }: { className?: string }) => (
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
    <path d="M20 12v9H4v-9" />
    <path d="M2 7h20v5H2z" />
    <path d="M12 22V7" />
    <path d="M12 7C12 7 11 3 8.5 3S5 5 5 5s1.5 2 4 2" />
    <path d="M12 7c0 0 1-4 3.5-4S19 5 19 5s-1.5 2-4 2" />
  </svg>
)

export const SubscriptionBoxFooter = defineComponent({
  name: "SubscriptionBoxFooter",
  description:
    "Site footer for a subscription-box brand built on the shared SiteFooter composite: gift-box wordmark + ribboned mark, a playful tagline, link columns (Shop, Company, Support, Legal), a social row, and a bottom note. Use as the footer for any curated-box, recurring-delivery, or membership-kit page.",
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    legal: z.array(z.string()).optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? "BoxJoy"
    const tagline =
      props.tagline ??
      "A little box of joy, delivered to your door every single month."
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Shop",
            links: ["Boxes", "Pricing", "Gift a box", "Past boxes"],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press"],
          },
          {
            title: "Support",
            links: ["How it works", "FAQ", "Shipping", "Contact"],
          },
          {
            title: "Legal",
            links: ["Privacy", "Terms", "Cookies"],
          },
        ]
    const social = props.social?.length
      ? props.social
      : [
          { label: "Instagram" },
          { label: "TikTok" },
          { label: "Pinterest" },
        ]
    const legal = props.legal?.length
      ? props.legal
      : ["Privacy", "Terms", "Cookies"]
    const note = props.note ?? "Unbox the joy."

    return (
      <SiteFooter
        brand={brand}
        brandMark={<GiftBoxMark className="size-7 text-primary" />}
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
