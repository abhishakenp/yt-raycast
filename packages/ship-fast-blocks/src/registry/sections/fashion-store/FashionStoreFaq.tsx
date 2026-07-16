import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'

/**
 * FashionStoreFaq — native disclosure FAQ accordion for a minimalist fashion
 * store. A subtle muted-band, narrow centered section with an eyebrow + serif
 * heading above a stack of bordered <details> cards (question summary with a
 * chevron that rotates on open, revealing one or more body paragraphs), closed
 * by a centered footer note and an underlined "Contact Customer Care" link.
 * The footer link routes through useNavigate. Use to answer shipping, returns,
 * sizing and materials questions for clothing brands, boutiques, or apparel
 * shops.
 */
export const FashionStoreFaq = defineCapsule({
  name: 'FashionStoreFaq',
  description:
    "Native disclosure FAQ accordion for a minimalist fashion store: a subtle muted-band, narrow centered section with an eyebrow + serif heading above a stack of bordered <details> cards (question summary with a chevron that rotates on open, revealing one or more body paragraphs), closed by a centered footer note and an underlined 'Contact Customer Care' link that routes through useNavigate. Use to answer shipping, returns, sizing and materials questions for clothing brands, boutiques, or apparel and accessories shops.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    items: z
      .array(z.object({ q: z.string(), a: z.array(z.string()) }))
      .optional(),
    footerNote: z.string().optional(),
    footerCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const faqEyebrow = props.eyebrow ?? 'Questions'
    const faqHeading = props.heading ?? 'Common Inquiries'

    // Normalize LLM-generated FAQ items that may use `question`/`answer`
    // (singular string) instead of the schema's `q`/`a` (array of strings).
    // The lakebed export strips defineCapsule (and thus sanitizeProps), so
    // the raw component must defend itself against malformed prop shapes.
    const normalizeFaqItems = (raw) => {
      if (!Array.isArray(raw)) return []
      return raw
        .map((item) => {
          if (!item || typeof item !== 'object') return null
          const rec = item as Record<string, unknown>
          const q = rec.q ?? rec.question
          const a = rec.a ?? rec.answers ?? rec.answer
          if (typeof q !== 'string' || !q.trim()) return null
          const answers = Array.isArray(a)
            ? a.filter((x) => typeof x === 'string')
            : typeof a === 'string'
              ? [a]
              : []
          return { q, a: answers }
        })
        .filter((item): item is { q: string; a: string[] } => item !== null)
    }

    const normalizedItems = normalizeFaqItems(props.items)
    const faqItems = normalizedItems.length
      ? normalizedItems
      : [
          {
            q: 'What is your shipping policy?',
            a: [
              'We offer complimentary worldwide shipping on orders over $300. Standard shipping takes 3–5 business days domestically and 5–10 business days internationally. Express 48-hour delivery is available for select countries at checkout.',
              'All orders are shipped in our signature sustainable packaging — 100% recycled and fully recyclable.',
            ],
          },
          {
            q: 'What is your return and exchange policy?',
            a: [
              'We accept returns and exchanges within 30 days of delivery. Items must be unworn, unwashed, and with all original tags attached. Undergarments and sale items are final sale.',
              'Returns are processed within 5–7 business days of receipt. Refunds are issued to the original payment method. Exchanges for size or color are always free.',
            ],
          },
          {
            q: 'How do I find my correct size?',
            a: [
              'Each product page includes detailed measurements and a fit guide. Our garments are designed with a relaxed, contemporary fit. For a more tailored look, we recommend sizing down.',
              "If you're between sizes or need personalized advice, our customer care team is available via chat or email to help you find your perfect fit.",
            ],
          },
          {
            q: 'What materials do you use?',
            a: [
              'We prioritize natural, sustainable materials: organic cotton, linen, silk, responsibly sourced wool, and cashmere. Our denim is produced using water-saving techniques, and all dyes are eco-certified.',
              'Each product page lists the exact materials used, their origin, and care instructions to help your pieces last for years.',
            ],
          },
          {
            q: 'Do you offer gift cards?',
            a: [
              'Yes, digital gift cards are available in denominations from $50 to $1,000. They never expire and can be used across our entire collection. Gift cards are delivered via email immediately after purchase and can be scheduled for future delivery.',
            ],
          },
        ]
    const faqFooterNote = props.footerNote ?? 'Still have questions?'
    const faqFooterCta = props.footerCta ?? 'Contact Customer Care'

    const eyebrowCls =
      'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'

    return (
      <section
        aria-label="Frequently asked questions"
        className={cn(
          'bg-muted pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className={cn(eyebrowCls, 'mb-3')}>{faqEyebrow}</p>
            <h2 className="font-serif text-4xl font-normal sm:text-5xl">
              {faqHeading}
            </h2>
          </div>

          <FaqAccordion variant="wide">
            {faqItems.map((item) => (
              <FaqItem key={item.q} className="bg-background">
                <FaqQuestion className="p-6">
                  <h3 className="pr-4 font-medium text-foreground">{item.q}</h3>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="space-y-3 px-6 pb-6">
                  <div>
                    {item.a.map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>

          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">{faqFooterNote}</p>
            <button
              type="button"
              onClick={() => go(faqFooterCta)}
              className="inline-flex items-center border-b border-foreground pb-1 text-sm font-medium text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground"
            >
              {faqFooterCta}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
