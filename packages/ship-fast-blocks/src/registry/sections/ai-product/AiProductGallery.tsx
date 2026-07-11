import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * AiProductGallery — a product-screenshot showcase grid for a clean, light AI
 * SaaS / product page. A centered heading + paragraph above a responsive
 * 1 → 2 → 3 column grid of bordered cards, each a clickable tile with a 4:3
 * alt-driven image, a bold title, and a short caption, lifting on hover. Each
 * card routes through useNavigate. Use to surface real in-app screenshots or
 * feature highlights for AI tools, SaaS apps, editors, dashboards, or any
 * product worth showing visually. Renders fully with no props via six built-in
 * feature tiles.
 */
export const AiProductGallery = defineCapsule({
  name: 'AiProductGallery',
  description:
    'Product-screenshot showcase grid for a clean, light AI SaaS / product page: a centered heading and paragraph above a responsive 1 → 2 → 3 column grid of bordered cards, each a clickable tile with a 4:3 alt-driven image, a bold title, and a short caption, lifting with a shadow on hover. Each card routes through useNavigate. Use to surface real in-app screenshots or feature highlights for AI tools, SaaS apps, editors, dashboards, or any product worth showing visually.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Gallery tiles (title drives the image alt + caption). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'See WriteFlow in action'
    const description =
      props.description ??
      'Real screenshots from the app showing powerful features that transform your writing workflow.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Distraction-free editor',
            description: 'Clean interface that keeps you focused on writing.',
          },
          {
            title: 'Real-time collaboration',
            description: 'Work together with your team in real-time.',
          },
          {
            title: 'Writing analytics',
            description: 'Track productivity and improvement over time.',
          },
          {
            title: 'Template library',
            description: '200+ templates to jumpstart any writing project.',
          },
          {
            title: 'Idea capture',
            description: 'Quick capture tools for inspiration anywhere.',
          },
          {
            title: 'Export anywhere',
            description: 'Publish to Word, PDF, or Markdown.',
          },
        ]

    return (
      <section className={cn('py-20 lg:py-32', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => go(item.title)}
                className="group block w-full overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    alt={item.title}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-1 font-semibold text-card-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
