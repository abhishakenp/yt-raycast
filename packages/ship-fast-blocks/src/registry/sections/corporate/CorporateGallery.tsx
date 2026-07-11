import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * CorporateGallery — global office / presence gallery for an enterprise /
 * corporate B2B site. A centered section heading above a responsive 2/3-column
 * grid of image cards with gradient-caption overlays; each card has a hover
 * scale effect and is clickable via useNavigate. Use to showcase global
 * presence, workspace culture, or location hubs for large organizations.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CorporateGallery = defineCapsule({
  name: 'CorporateGallery',
  description:
    'Global office / presence gallery for an enterprise / corporate B2B site: centered heading above a responsive 2/3-column grid of image cards with gradient-caption overlays, hover scale effect, and clickable buttons via useNavigate. Use to showcase global presence, workspace culture, or location hubs for large organizations.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Office cards: title, caption, and image alt text. */
    items: z
      .array(
        z.object({
          title: z.string(),
          caption: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Global presence, local expertise'
    const description =
      props.description ??
      '14 offices across 6 continents, serving clients in 47 countries with round-the-clock support.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'New York Headquarters',
            caption: 'Global HQ & Innovation Center',
            imageAlt:
              'Modern glass skyscraper corporate headquarters at sunset',
          },
          {
            title: 'London Office',
            caption: 'EMEA Regional Hub',
            imageAlt:
              'Tower Bridge and modern city skyline in London at golden hour',
          },
          {
            title: 'Tokyo Office',
            caption: 'APAC Operations Center',
            imageAlt: 'Tokyo cityscape with illuminated skyscrapers at night',
          },
          {
            title: 'Sydney Office',
            caption: 'ANZ Regional Office',
            imageAlt: 'Sydney Opera House and harbor waterfront panorama',
          },
          {
            title: 'Singapore Office',
            caption: 'Southeast Asia Hub',
            imageAlt: 'Singapore Marina Bay skyline with modern architecture',
          },
          {
            title: 'Berlin Office',
            caption: 'European Development Center',
            imageAlt:
              'Modern corporate building in Berlin with contemporary architecture',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-32', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((office) => (
              <button
                key={office.title}
                type="button"
                onClick={() => go(office.title)}
                className="group relative block overflow-hidden rounded-xl text-left"
              >
                <Image
                  alt={office.imageAlt}
                  w={600}
                  h={450}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/60 to-transparent p-6">
                  <div>
                    <p className="font-semibold text-background">
                      {office.title}
                    </p>
                    <p className="text-sm text-background/80">
                      {office.caption}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
