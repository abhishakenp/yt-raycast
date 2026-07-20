import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * NoCodeTestimonials — block-builder-kinetic staggered field-notes testimonial
 * wall for a no-code / app-builder SaaS landing page. An asymmetric header
 * (mono eyebrow, a left-aligned heading with a tilted primary marker block
 * behind the key word, mono meta right) sits over a giant ghost quotation mark,
 * above a 3-column grid of sharp chunky border-2 quote cards whose middle
 * column is pushed down for a staggered rhythm: each card opens with a mono
 * log-style index tag with a primary tick, carries the quote, and closes with a
 * hairline-topped mono name / role footer. Cards lift on a hard offset shadow
 * on hover. Use as the social-proof / customer-stories section on a no-code /
 * app-builder SaaS or product landing page. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const NoCodeTestimonials = defineCapsule({
  name: 'NoCodeTestimonials',
  description:
    'Block-builder-kinetic staggered field-notes testimonial wall for a no-code / app-builder SaaS landing page: an asymmetric header (mono eyebrow, marker-highlighted heading left, mono meta right) over a giant ghost quotation mark, above a 3-column grid of sharp chunky border-2 quote cards with a pushed-down middle column, each opening with a mono log-style index tag and closing with a hairline-topped mono name / role footer; cards lift on a hard offset shadow on hover. Use as the social-proof / customer-stories section on a no-code / app-builder SaaS or product landing page.',
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'Loved by creators worldwide'
    const description =
      props.description ?? 'See what our community is building with Buildr.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'I built my entire e-commerce store in a weekend without writing a single line of code. The templates are gorgeous and the editor is incredibly intuitive. Sales are up 40% since the redesign.',
            name: 'Sarah Chen',
            role: 'Founder, GreenLeaf Organics',
            avatarAlt:
              'Professional headshot of Sarah Chen, founder of GreenLeaf Organics',
          },
          {
            quote:
              'As a designer without coding skills, I was always dependent on developers. Buildr changed everything. Now I prototype and launch full products myself. The integrations with Figma are seamless.',
            name: 'Marcus Johnson',
            role: 'Product Designer, TechFlow',
            avatarAlt:
              'Professional headshot of Marcus Johnson, product designer at TechFlow',
          },
          {
            quote:
              'We migrated our entire agency workflow to Buildr and cut project delivery time by 60%. The collaboration features let our whole team work together seamlessly. Clients are amazed at the speed.',
            name: 'Elena Rodriguez',
            role: 'CEO, Brightside Agency',
            avatarAlt:
              'Professional headshot of Elena Rodriguez, CEO of Brightside Agency',
          },
        ]
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
        aria-labelledby="nc-testimonials"
      >
        <Watermark className="-top-16 left-0 font-serif text-[16rem] sm:text-[22rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          {/* Asymmetric header: mono eyebrow, marker heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · field notes
                </span>
              </MonoTag>
              <h2
                id="nc-testimonials"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ logs ] verified builders
            </p>
          </div>
          <TestimonialGrid columns={3} className="gap-5 lg:gap-6">
            {items.map((t, index) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'rounded-none border-2 border-border bg-card p-6 shadow-none transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-1 hover:border-foreground hover:shadow-[6px_6px_0_0] hover:shadow-foreground/15',
                    index % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <MonoTag className="flex items-center gap-2" tone="faint">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-primary"
                    />
                    Log {String(index + 1).padStart(2, '0')}
                  </MonoTag>
                  <TestimonialQuote className="mt-4 text-[15px] leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-6 flex-col items-start gap-0.5 border-t border-border pt-4">
                    <TestimonialName className="text-sm font-bold tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.14em]">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
