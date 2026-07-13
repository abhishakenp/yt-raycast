import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { ImageTile } from '#/section-kit/ImageTile.tsx'
import { BentoTileCaption } from '#/section-kit/BentoGrid.tsx'

/**
 * CloudInfraGallery — developer-showcase image gallery for a cloud-infrastructure /
 * developer-platform SaaS landing page. A centered heading + description above a
 * responsive grid of 6 figure cards (4:3 aspect). Each figure is an alt-driven Image
 * with a caption overlay using a bottom-up gradient to foreground/80. Images zoom
 * on hover. Tokens-only. Renders fully on zero arguments.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CloudInfraGallery = defineCapsule({
  name: 'CloudInfraGallery',
  description:
    'Developer-showcase image gallery for a cloud-infrastructure / developer-platform SaaS landing page: a centered heading plus description above a responsive grid of 6 figure cards (4:3 aspect). Each figure is an alt-driven Image with a caption overlay using a bottom-up gradient to foreground/80; images zoom on hover. Tokens-only. Use for portfolio, showcase, or proof-of-work galleries on cloud hosting, IaaS, PaaS, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Gallery items: alt, title, caption. */
    items: z
      .array(
        z.object({
          alt: z.string(),
          title: z.string(),
          caption: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Built for developers, by developers'
    const description =
      props.description ??
      'See how teams use CloudShift to build, deploy, and scale their applications worldwide.'
    const items = props.items?.length
      ? props.items
      : [
          {
            alt: 'Team of software developers collaborating at a modern desk with multiple monitors showing code',
            title: 'Real-time collaboration tools',
            caption: 'Shared terminals and live code reviews',
          },
          {
            alt: 'Server room with rows of blinking LED lights on network equipment racks',
            title: 'Global data centers',
            caption: '35 regions with sub-20ms latency',
          },
          {
            alt: 'Analytics dashboard showing traffic graphs and performance metrics on a laptop screen',
            title: 'Observability dashboard',
            caption: 'Real-time metrics and alerting',
          },
          {
            alt: 'Diverse engineering team meeting in a modern office discussing architecture diagrams',
            title: 'Team workflows',
            caption: 'RBAC and environment management',
          },
          {
            alt: 'Close-up of circuit board with microprocessors and electronic components',
            title: 'Bare metal performance',
            caption: 'Dedicated instances when you need them',
          },
          {
            alt: 'Developer working late at night with code editor and terminal windows on large curved monitor',
            title: 'Developer experience first',
            caption: 'CLI, SDKs, and IDE integrations',
          },
        ]
    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ImageTile key={item.title} treatment="4-3-xl-muted">
                <Image
                  alt={item.alt}
                  w={800}
                  h={600}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <BentoTileCaption className="inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-6">
                  <p className="font-medium text-background">{item.title}</p>
                  <p className="text-sm text-background/80">{item.caption}</p>
                </BentoTileCaption>
              </ImageTile>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
