import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * NoCodeFeatures — centered-header 6-up feature grid on a bright canvas. A
 * muted eyebrow, bold heading, and supporting paragraph sit above a 1-to-3
 * column grid of soft-bordered cards, each with a rounded tinted icon tile
 * (rotating token tints) that scales up on hover, a title, and a description.
 * Use as the core "everything you need" features section for a no-code builder,
 * SaaS, or product landing page. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const NoCodeFeatures = defineCapsule({
  name: 'NoCodeFeatures',
  description:
    "Centered-header 6-up feature grid on a bright canvas: a muted eyebrow, bold heading, and supporting paragraph above a 1-to-3 column grid of soft-bordered cards, each with a rounded tinted icon tile (rotating token tints) that scales up on hover, a title, and a description. Use as the core 'everything you need' features section for a no-code / app-builder SaaS or product landing page.",
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
    return (
      <section
        className={cn('bg-background py-24', props.className)}
        aria-labelledby="nc-features"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2
              id="nc-features"
              className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid columns={3}>
            {items.map((f) => {
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
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
