import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * DevToolGallery — a 2x2 product screenshot gallery for a developer tool / API
 * platform. A centered heading + intro above a responsive 1/2-column grid of
 * figures, each a bordered dark-framed clickable image (alt-driven, zoom-on-hover)
 * with a centered title + caption beneath. Each tile routes through useNavigate.
 * Use to show dashboard, API explorer, edge network, and team workspace
 * screenshots for developer tools, API platforms, or technical SaaS.
 */
export const DevToolGallery = defineCapsule({
  name: 'DevToolGallery',
  description:
    '2x2 product screenshot gallery for a developer tool / API platform: a centered heading + intro above a responsive 1/2-column grid of figures, each a bordered dark-framed clickable image (alt-driven, zoom-on-hover) with a centered title + caption beneath. Each tile routes through useNavigate. Use to show dashboard, API explorer, edge network, and team workspace screenshots for developer tools, API platforms, or technical SaaS.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), caption: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Built for modern teams'
    const description =
      props.description ??
      'From the dashboard to your IDE, every touchpoint is designed for developer productivity.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Analytics Dashboard',
            caption: 'Real-time metrics and request logs',
          },
          {
            title: 'API Explorer',
            caption: 'Interactive documentation and testing',
          },
          {
            title: 'Global Edge Network',
            caption: '250+ locations worldwide',
          },
          {
            title: 'Team Workspaces',
            caption: 'Collaborate with your entire engineering team',
          },
        ]

    return (
      <section
        className={cn('py-20 lg:py-28', props.className)}
        aria-labelledby="gallery-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="gallery-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {items.map((item) => (
              <figure key={item.title} className="group">
                <button
                  type="button"
                  onClick={() => go(item.title)}
                  className="block w-full overflow-hidden rounded-xl border border-border bg-foreground shadow-lg"
                >
                  <Image
                    alt={item.title}
                    w={800}
                    h={500}
                    loading="lazy"
                    className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
                <figcaption className="mt-4 text-center">
                  <h3 className="font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.caption}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
