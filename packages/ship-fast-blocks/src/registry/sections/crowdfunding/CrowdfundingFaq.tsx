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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CrowdfundingFaq — a playful-bold native-disclosure FAQ for a crowdfunding /
 * campaign landing page. An asymmetric 4:8 split under a giant ghost "?"
 * watermark: on the left a sticky header rail with a mono eyebrow, extrabold
 * tight-tracked heading, and a mono "[ backer desk ]" tag; on the right a
 * stack of sharp 2px-bordered <details> cards, each summary pairing a rotated
 * mono "Q1"-style index chip with the bold question and a plus icon that
 * rotates to an × when open, above a muted answer body. No JS required (uses
 * the browser <details> element). Use to answer shipping, fulfillment,
 * sourcing, refund and other backer questions on a Kickstarter/Indiegogo-style
 * raise, pre-order, or fundraiser.
 */
export const CrowdfundingFaq = defineCapsule({
  name: 'CrowdfundingFaq',
  description:
    "A playful-bold native-disclosure FAQ for a crowdfunding / campaign landing page: an asymmetric 4:8 split under a giant ghost '?' watermark with a sticky header rail (mono eyebrow, extrabold heading, mono '[ backer desk ]' tag) on the left and a stack of sharp 2px-bordered details cards on the right, each summary pairing a rotated mono 'Q1'-style index chip with the bold question and a plus icon rotating to an × when open, above a muted answer body. No JS required (uses the browser details element). Use to answer shipping, fulfillment, sourcing, refund and other backer questions on a Kickstarter/Indiegogo-style raise, pre-order, or fundraiser.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqEyebrow = props.eyebrow ?? 'FAQ'
    const faqHeading = props.heading ?? 'Frequently Asked Questions'
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            q: 'When will EcoBrush ship?',
            a: "We expect to begin shipping in June 2026. This timeline accounts for tooling finalization, production ramp-up, and quality control. VIP Founder backers will receive their orders first, followed by Family Pack, Couple Bundle, and Single EcoBrush backers in that order. We'll send monthly updates to all backers throughout the production process.",
          },
          {
            q: 'How do I dispose of EcoBrush when it reaches end of life?',
            a: 'Disposal is simple and designed for circularity. First, separate the brush head from the handle—the aluminum ferrule and plant-based bristles can go in your recycling bin. Next, use the included tool to remove the small motor assembly from the bamboo handle. Send the motor back to us for recycling through our Take-Back Program (we provide a prepaid envelope). Finally, the bamboo handle can be composted in your home compost bin or municipal compost program—it will break down completely in 4-6 months.',
          },
          {
            q: 'Is the bamboo sustainably sourced?',
            a: 'Yes, absolutely. We use Moso bamboo (Phyllostachys edulis) harvested from FSC-certified forests in Zhejiang Province, China. Moso bamboo is not a food source for pandas and grows incredibly fast—up to 1 meter per day—making it highly renewable. Our supplier has been certified by the Forest Stewardship Council since 2018 and undergoes annual third-party audits for environmental and labor practices.',
          },
          {
            q: 'Does EcoBrush work with braces or dental work?',
            a: 'EcoBrush is safe for use with braces, crowns, veneers, and implants. We recommend the "Sensitive" mode for those with orthodontic work—it\'s gentler but still effective. The plant-based bristles are softer than typical nylon but engineered to clean thoroughly around brackets and wires. As always, check with your dentist if you have specific concerns about your dental work.',
          },
          {
            q: 'What is your refund policy?',
            a: 'Crowdfunding pledges can be cancelled and fully refunded for any reason before the campaign ends on March 15, 2026. After the campaign closes and funds are transferred to production, refunds will be available if we encounter delays exceeding 6 months from the estimated ship date, or if the project cannot be completed. Once your EcoBrush ships, our standard 2-year warranty applies, which covers defects in materials and workmanship.',
          },
          {
            q: 'Do you ship internationally?',
            a: 'Yes, we ship to 47 countries. Shipping is free to the US, UK, EU, Canada, Australia, and New Zealand. For other destinations, shipping is calculated at checkout based on your location. Please note that international backers may be responsible for import duties and taxes, which vary by country and are not included in the pledge amount. Due to shipping regulations, we cannot ship to PO boxes.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-card py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-8 top-4 font-serif text-[10rem] sm:text-[14rem] lg:text-[18rem]">
          ?
        </Watermark>
        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <SectionHeading
                  eyebrow={faqEyebrow}
                  title={faqHeading}
                  align="left"
                  className="gap-3"
                  eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
                  titleClassName="text-3xl font-extrabold leading-[1.02] tracking-tighter sm:text-4xl"
                />
                <MonoTag
                  aria-hidden="true"
                  tone="faint"
                  className="mt-4 inline-block"
                >
                  [ backer desk ]
                </MonoTag>
              </div>
            </div>

            <FaqAccordion className="space-y-4 lg:col-span-8">
              {faqItems.map((item, i) => (
                <FaqItem
                  key={item.q}
                  variant="overflow-bordered"
                  className="rounded-none border-2 border-foreground/25 bg-background transition-colors open:border-foreground"
                >
                  <FaqQuestion className="gap-3 bg-background p-5 transition-colors hover:bg-muted/60 active:translate-y-px sm:p-6">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'inline-flex shrink-0 rounded-full border-2 border-foreground/60 bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em]',
                          i % 2 === 0 ? '-rotate-2' : 'rotate-2',
                        )}
                      >
                        Q{i + 1}
                      </span>
                      <span className="font-bold tracking-tight">{item.q}</span>
                    </span>
                    <FaqQuestionIcon variant="plus" />
                  </FaqQuestion>
                  <FaqAnswer
                    asChild
                    className="border-t-2 border-foreground/10 px-5 pb-6 pt-4 sm:px-6"
                  >
                    <div>{item.a}</div>
                  </FaqAnswer>
                </FaqItem>
              ))}
            </FaqAccordion>
          </div>
        </Container>
      </section>
    )
  },
})
