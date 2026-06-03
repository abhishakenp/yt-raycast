import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * ElectronicsStoreFaq — a centered native-disclosure FAQ accordion for an
 * electronics storefront. A centered heading above a narrow stack of muted
 * rounded <details> rows, each a clickable question summary with a chevron that
 * rotates open to reveal a muted answer paragraph. Use to answer shipping,
 * returns, warranty, price-match and tracking questions on electronics stores,
 * gadget shops, consumer-tech retailers, or any product catalog.
 */
export const ElectronicsStoreFaq = defineComponent({
  name: "ElectronicsStoreFaq",
  description:
    "Centered native-disclosure FAQ accordion for an electronics storefront: a centered heading above a narrow stack of muted rounded details rows, each a clickable question summary with a chevron that rotates open to reveal a muted answer paragraph. Use to answer shipping, returns, warranty, price-match and tracking questions on electronics stores, gadget shops, consumer-tech retailers, or any product catalog.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Question / answer pairs. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Frequently Asked Questions"
    const items = props.items?.length
      ? props.items
      : [
          {
            q: "What shipping options are available?",
            a: "We offer free standard shipping (3-5 business days) on all orders over $75. Express shipping (1-2 business days) is available for $12.99, and overnight shipping is available for select products at $24.99. All orders ship from our warehouses in California and New Jersey.",
          },
          {
            q: "What is your return policy?",
            a: "We offer a 30-day hassle-free return policy. Items must be in original condition with all packaging and accessories. Simply initiate a return through your account dashboard, and we'll provide a prepaid shipping label. Refunds are processed within 3-5 business days after we receive your return.",
          },
          {
            q: "Are all products covered by warranty?",
            a: "Yes, all products come with the full manufacturer's warranty. Most electronics include a 1-year warranty, with some premium products offering up to 2-3 years. We also offer extended warranty plans for additional peace of mind on select items.",
          },
          {
            q: "Do you price match competitors?",
            a: "Absolutely. We offer price matching on identical items from authorized retailers. Simply contact our support team with proof of the lower price within 14 days of your purchase, and we'll refund the difference. Some exclusions apply for flash sales and clearance items.",
          },
          {
            q: "How can I track my order?",
            a: "Once your order ships, you'll receive an email with a tracking number. You can also track your order in real-time through your account dashboard or our mobile app. We partner with UPS, FedEx, and USPS to provide reliable delivery services across the United States.",
          },
        ]

    return (
      <section className={cn("py-16 lg:py-24", props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground">
            {heading}
          </h2>
          <div className="space-y-4">
            {items.map((item) => (
              <details key={item.q} className="group rounded-xl bg-muted/50">
                <summary className="flex cursor-pointer list-none items-center justify-between p-5">
                  <span className="font-medium text-foreground">{item.q}</span>
                  <svg
                    className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-muted-foreground">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
