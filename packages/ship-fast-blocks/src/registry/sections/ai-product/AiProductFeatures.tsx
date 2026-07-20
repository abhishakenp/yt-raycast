import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * AiProductFeatures — kinetic tech-editorial capability index for an AI SaaS /
 * product page. An asymmetric header (left-aligned oversized tight heading +
 * supporting paragraph, mono "[ 01 / capabilities ]" meta on the right) above
 * a collapsed-border editorial grid
 * (1 → 2 → 3 columns, hairline-celebrated cells). Each cell leads with a giant
 * ghost mono index numeral, then a bold tight title and relaxed description;
 * on hover the cell washes muted and its numeral inks to primary. A giant
 * "fn()" watermark ghosts behind the grid. Use to showcase a product's core
 * capabilities on AI writing assistants, AI copilots, generative-AI tools,
 * developer-AI products, or any modern SaaS site. Renders fully with no props
 * via six built-in writing-assistant features.
 */
export const AiProductFeatures = defineCapsule({
  name: 'AiProductFeatures',
  description:
    "Kinetic tech-editorial capability index for an AI SaaS / product page: an asymmetric header (left-aligned oversized tight heading and supporting paragraph, mono capability meta right) above a collapsed-border editorial grid of 1 → 2 → 3 column hairline cells, each led by a giant ghost mono index numeral over a bold tight title and relaxed description, washing muted with a primary-inked numeral on hover, with a giant 'fn()' watermark ghosting behind. Use to showcase a product's core capabilities on AI writing assistants, AI copilots, generative-AI tools, developer-AI products, or any modern SaaS marketing site.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards (title + description). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to write better'
    const description =
      props.description ??
      'From first draft to final polish, WriteFlow accelerates every step of your writing workflow.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'AI-Powered Suggestions',
            description:
              'Get intelligent completions, rewrites, and tone adjustments as you type. Trained on millions of professional documents to match your style.',
          },
          {
            title: 'Grammar & Clarity',
            description:
              'Catch grammar errors, awkward phrasing, and unclear sentences before you publish. Our AI explains every suggestion so you learn as you edit.',
          },
          {
            title: 'Tone & Voice Control',
            description:
              'Switch between professional, casual, persuasive, or friendly tones with one click. Perfect for adapting content for different audiences.',
          },
          {
            title: 'Templates Library',
            description:
              'Start with 200+ professionally crafted templates for emails, blog posts, social media, proposals, and more. Customizable to your brand voice.',
          },
          {
            title: 'Team Collaboration',
            description:
              'Share documents, leave comments, and maintain a consistent brand voice across your entire team with shared style guides and approval workflows.',
          },
          {
            title: 'API & Integrations',
            description:
              'Connect WriteFlow to your existing tools with our REST API and native integrations for VS Code, Chrome, Slack, Notion, and Google Docs.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden py-16 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-6 bottom-0 font-mono text-[8rem] sm:text-[16rem]">
          fn()
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-4"
              titleClassName="text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[0.95] tracking-tighter"
              subtitleClassName="max-w-xl text-base sm:text-lg"
            />
            <MonoTag aria-hidden="true" className="shrink-0">
              [ 01 / capabilities ]
            </MonoTag>
          </div>
          <div className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {items.map((f, i) => {
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
                <div
                  key={__iv__.title}
                  className="group relative grid grid-cols-[auto_1fr] items-start gap-x-4 border-b border-r border-border p-5 transition-colors duration-150 hover:bg-muted/40 sm:block sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-3xl font-bold leading-none text-foreground/10 transition-colors duration-150 group-hover:text-primary sm:text-5xl"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    {__iv__.icon && (
                      <span className="block text-foreground sm:mt-4">
                        {__iv__.icon}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold tracking-tight text-foreground sm:mt-4">
                      {__iv__.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {__iv__.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
