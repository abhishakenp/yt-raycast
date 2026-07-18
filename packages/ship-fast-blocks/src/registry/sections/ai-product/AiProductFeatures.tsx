import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * AiProductFeatures — a centered-intro feature grid for a clean, light AI SaaS /
 * product page. A heading + supporting paragraph centered above a responsive
 * 1 → 2 → 3 column grid of features, each with a rounded muted icon tile (a
 * rotating set of line glyphs that tint to accent on hover), a bold title, and a
 * relaxed description. Generous whitespace, neutral surfaces. Use to showcase a
 * product's core capabilities on AI writing assistants, AI copilots,
 * generative-AI tools, developer-AI products, or any modern SaaS site. Renders
 * fully with no props via six built-in writing-assistant features.
 */
export const AiProductFeatures = defineCapsule({
  name: 'AiProductFeatures',
  description:
    "Centered-intro feature grid for a clean, light AI SaaS / product page: a heading and supporting paragraph centered above a responsive 1 → 2 → 3 column grid of features, each with a rounded muted icon tile (rotating line glyphs that tint to accent on hover), a bold title, and a relaxed description. Generous whitespace and neutral surfaces. Use to showcase a product's core capabilities on AI writing assistants, AI copilots, generative-AI tools, developer-AI products, or any modern SaaS marketing site.",
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
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid features={items} columns={3} />
        </Container>
      </section>
    )
  },
})
