import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * NoCodeFeatures — block-builder-kinetic collapsed-border bento for a no-code /
 * app-builder SaaS landing page. An asymmetric header (mono eyebrow tag, a
 * left-aligned heading with a tilted primary marker block behind the key word,
 * and mono meta right) sits above a sharp 12-column bento of hairline-collapsed
 * cells with varying spans (7/5, 4/8 rhythm): every cell carries a mono index
 * numeral, a bold title and description, and the two widest cells add div-built
 * builder motifs — a chunky stacked-blocks tower and a mono "[ drag → drop →
 * publish ]" pipeline strip. Cells wash to muted on hover. Use as the core
 * "everything you need" features section for a no-code / app-builder SaaS or
 * product landing page. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const NoCodeFeatures = defineCapsule({
  name: 'NoCodeFeatures',
  description:
    "Block-builder-kinetic collapsed-border bento for a no-code / app-builder SaaS landing page: an asymmetric header (mono eyebrow, marker-highlighted heading left, mono meta right) above a sharp 12-column bento of hairline-collapsed cells with varying spans, each with a mono index numeral, bold title and description; the widest cells add div-built builder motifs (a chunky stacked-blocks tower, a mono drag → drop → publish strip) and cells wash to muted on hover. Use as the core 'everything you need' features section for a no-code / app-builder SaaS or product landing page.",
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards (title + description). */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Features'
    const heading = props.heading ?? 'Everything you need to build amazing apps'
    const description =
      props.description ??
      'From drag-and-drop design to powerful integrations, Buildr gives you all the tools to bring your ideas to life.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Drag & Drop Builder',
            description:
              'Intuitive visual editor with 50+ pre-built components. Simply drag elements onto your canvas and arrange them exactly how you want.',
          },
          {
            title: '200+ Templates',
            description:
              'Start with professionally designed templates for SaaS, e-commerce, portfolios, blogs, and more. Fully customizable to match your brand.',
          },
          {
            title: 'Mobile Responsive',
            description:
              'Every app automatically adapts to any screen size. Preview and fine-tune your design for desktop, tablet, and mobile in real-time.',
          },
          {
            title: 'Lightning Fast',
            description:
              'Apps built on Buildr load instantly with global CDN delivery, automatic image optimization, and code minification built-in.',
          },
          {
            title: 'Secure by Default',
            description:
              "SSL certificates, DDoS protection, and SOC 2 compliance included. Your data and your users' data are always protected.",
          },
          {
            title: '100+ Integrations',
            description:
              'Connect with Stripe, Airtable, Zapier, Make, and more. Automate workflows and add powerful functionality without code.',
          },
        ]
    // Bento span rhythm: 7/5, 4/8, 5/7 — never 50/50.
    const spans = [
      'md:col-span-7',
      'md:col-span-5',
      'md:col-span-4',
      'md:col-span-8',
      'md:col-span-5',
      'md:col-span-7',
    ]
    const blockHeights = ['h-4', 'h-6', 'h-8', 'h-10']
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
        aria-labelledby="nc-features"
      >
        <Container>
          {/* Asymmetric header: mono eyebrow, marker heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                {eyebrow}
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 01—06
                </span>
              </MonoTag>
              <h2
                id="nc-features"
                className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              >
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] rotate-1 bg-primary"
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
              [ toolkit ] ship without code
            </p>
          </div>

          {/* Collapsed-border bento: hairline cells, asymmetric spans. */}
          <FeatureGrid className="gap-0 border-l border-t border-border [&>div]:grid [&>div]:grid-cols-1 [&>div]:gap-0 md:[&>div]:grid-cols-12">
            {items.map((f, index) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard
                  key={__iv__.title}
                  className={cn(
                    'gap-0 rounded-none border-0 border-b border-r border-border bg-card p-6 shadow-none transition-colors duration-150 hover:translate-y-0 hover:border-border hover:bg-muted/60 sm:p-8',
                    spans[index % spans.length],
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {String(index + 1).padStart(2, '0')}
                    <span className="text-primary"> /</span>
                  </span>
                  <FeatureTitle className="mt-3 text-xl font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="mt-2 max-w-md text-sm leading-6">
                    {__iv__.description}
                  </FeatureDescription>
                  {index === 0 ? (
                    <span
                      aria-hidden="true"
                      className="mt-6 flex flex-col-reverse gap-1.5"
                    >
                      {blockHeights.map((h, i) => (
                        <span
                          key={i}
                          className={cn(
                            'w-full max-w-[10rem] border',
                            h,
                            i === blockHeights.length - 1
                              ? 'border-primary bg-primary/15'
                              : 'border-border bg-foreground/[0.04]',
                          )}
                        />
                      ))}
                    </span>
                  ) : null}
                  {index === 3 ? (
                    <span
                      aria-hidden="true"
                      className="mt-6 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70"
                    >
                      [ drag → drop →{' '}
                      <span className="text-primary">publish</span> ]
                    </span>
                  ) : null}
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
