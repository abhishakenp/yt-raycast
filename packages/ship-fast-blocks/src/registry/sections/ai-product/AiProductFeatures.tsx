import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

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

    const featureIcons: ReactNode[] = [
      // bolt
      <svg
        key="bolt"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      // check-circle
      <svg
        key="check-circle"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // chat
      <svg
        key="chat"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>,
      // layout
      <svg
        key="layout"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>,
      // users
      <svg
        key="users"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>,
      // code
      <svg
        key="code"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
    ]

    return (
      <section className={cn('py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {items.map((item, i) => (
              <div key={item.title} className="group">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
