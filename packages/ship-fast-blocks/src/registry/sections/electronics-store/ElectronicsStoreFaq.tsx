import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * ElectronicsStoreFaq — a tech-brutalist native-disclosure FAQ for an electronics
 * storefront. An asymmetric 4/8 split: a sticky mono index eyebrow + extrabold
 * heading on the left beside a stack of squared border-2 <details> rows on the
 * right, each a clickable question summary prefixed by a mono Q numeral with a
 * chevron that rotates open to reveal a muted answer paragraph. Use to answer
 * shipping, returns, warranty, price-match and tracking questions on electronics
 * stores, gadget shops, consumer-tech retailers, or any product catalog.
 */
export const ElectronicsStoreFaq = defineCapsule({
  name: 'ElectronicsStoreFaq',
  description:
    'Tech-brutalist native-disclosure FAQ for an electronics storefront: an asymmetric 4/8 split with a sticky mono index eyebrow + extrabold heading on the left beside a stack of squared border-2 details rows on the right, each a clickable question summary prefixed by a mono Q numeral with a chevron that rotates open to reveal a muted answer paragraph. Use to answer shipping, returns, warranty, price-match and tracking questions on electronics stores, gadget shops, consumer-tech retailers, or any product catalog.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Question / answer pairs. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently Asked Questions'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'What shipping options are available?',
            a: 'We offer free standard shipping (3-5 business days) on all orders over $75. Express shipping (1-2 business days) is available for $12.99, and overnight shipping is available for select products at $24.99. All orders ship from our warehouses in California and New Jersey.',
          },
          {
            q: 'What is your return policy?',
            a: "We offer a 30-day hassle-free return policy. Items must be in original condition with all packaging and accessories. Simply initiate a return through your account dashboard, and we'll provide a prepaid shipping label. Refunds are processed within 3-5 business days after we receive your return.",
          },
          {
            q: 'Are all products covered by warranty?',
            a: "Yes, all products come with the full manufacturer's warranty. Most electronics include a 1-year warranty, with some premium products offering up to 2-3 years. We also offer extended warranty plans for additional peace of mind on select items.",
          },
          {
            q: 'Do you price match competitors?',
            a: "Absolutely. We offer price matching on identical items from authorized retailers. Simply contact our support team with proof of the lower price within 14 days of your purchase, and we'll refund the difference. Some exclusions apply for flash sales and clearance items.",
          },
          {
            q: 'How can I track my order?',
            a: "Once your order ships, you'll receive an email with a tracking number. You can also track your order in real-time through your account dashboard or our mobile app. We partner with UPS, FedEx, and USPS to provide reliable delivery services across the United States.",
          },
        ]

    return (
      <section className={cn('py-16 lg:py-24', props.className)}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <span className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  <span className="tabular-nums">[ 08 ]</span>
                  <span className="text-muted-foreground">Support</span>
                </span>
                <SectionHeading
                  align="left"
                  title={heading}
                  className="gap-0"
                  titleClassName="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl"
                />
              </div>
            </div>
            <div className="lg:col-span-8">
              <FaqAccordion className="space-y-0 border-t-2 border-foreground">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.q}
                    variant="muted"
                    className="rounded-none border-b-2 border-l-2 border-r-2 border-foreground bg-transparent open:bg-muted/40"
                  >
                    <FaqQuestion className="items-start gap-4 p-5">
                      <span className="flex min-w-0 items-baseline gap-3">
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] tabular-nums text-primary"
                        >
                          Q{String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-bold tracking-tight text-foreground">
                          {item.q}
                        </span>
                      </span>
                      <FaqQuestionIcon />
                    </FaqQuestion>
                    <FaqAnswer asChild className="px-5 pb-5 pl-14">
                      <div>{item.a}</div>
                    </FaqAnswer>
                  </FaqItem>
                ))}
              </FaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
