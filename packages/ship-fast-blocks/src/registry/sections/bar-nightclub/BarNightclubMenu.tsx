import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * BarNightclubMenu — two-column drinks menu for a cocktail-bar / nightclub
 * page. A centered eyebrow + light-weight heading + lead, then a responsive
 * two-column grid of named menu sections (e.g. house signatures / classics &
 * premium); each column has an underlined uppercase header and a list of items
 * showing a name, muted description, and right-aligned price. Closes with a
 * bordered footnote panel and a routable download-menu link. Editorial,
 * monochrome, hairline-bordered. The footnote link routes through useNavigate.
 * Use to present a cocktail / drinks list for bars, lounges, speakeasies, or
 * restaurants. Renders fully with no props via baked-in defaults.
 */
export const BarNightclubMenu = defineComponent({
  name: 'BarNightclubMenu',
  description:
    'Two-column drinks menu for a cocktail-bar / nightclub page: a centered eyebrow, light-weight heading and lead, then a responsive two-column grid of named menu sections (such as house signatures and classics & premium), each with an underlined uppercase header and a list of items showing a name, muted description, and right-aligned price. Closes with a bordered footnote panel and a routable download-menu link. Editorial, monochrome and hairline-bordered; the footnote link routes through useNavigate. Use to present a cocktail / drinks list for bars, lounges, speakeasies, or restaurants.',
  props: z.object({
    /** Wide letter-spaced uppercase eyebrow. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Menu columns, each a titled list of drinks. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          items: z
            .array(
              z.object({
                name: z.string(),
                description: z.string(),
                price: z.string(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    /** Footnote text in the closing panel. */
    footnote: z.string().optional(),
    /** Routable footnote link label (e.g. download full menu). */
    footnoteCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Drinks Menu'
    const heading = props.heading ?? 'Signature Cocktails'
    const description =
      props.description ??
      'Handcrafted by our award-winning mixologists. All cocktails available as non-alcoholic upon request.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'House Signatures',
            items: [
              {
                name: 'Midnight in Paris',
                description:
                  "Hendrick's Gin, St-Germain, blackberries, lemon, champagne float",
                price: '$18',
              },
              {
                name: 'Smoke & Mirrors',
                description:
                  'Mezcal, Aperol, smoked honey, grapefruit, habanero bitters',
                price: '$19',
              },
              {
                name: 'Velvet Underground',
                description:
                  'Bourbon, Amaro Nonino, velvet falernum, aromatic bitters',
                price: '$17',
              },
              {
                name: 'Neon Nights',
                description:
                  'Vodka, blue curaçao, coconut, lime, activated charcoal',
                price: '$16',
              },
              {
                name: 'The Nocturnal',
                description:
                  'Rye whiskey, coffee liqueur, cold brew, orange peel',
                price: '$18',
              },
              {
                name: 'Golden Hour',
                description:
                  'Tequila reposado, passion fruit, turmeric, ginger beer',
                price: '$17',
              },
            ],
          },
          {
            title: 'Classics & Premium',
            items: [
              {
                name: 'NOIR Old Fashioned',
                description:
                  'Woodford Reserve, house bitters, demerara, expressed orange',
                price: '$16',
              },
              {
                name: 'Perfect Manhattan',
                description:
                  'Rittenhouse Rye, Carpano Antica, Dolin Dry, Luxardo cherry',
                price: '$17',
              },
              {
                name: 'French 75',
                description: 'Plymouth Gin, lemon, simple syrup, Champagne',
                price: '$15',
              },
              {
                name: 'Negroni Sbagliato',
                description:
                  'Campari, sweet vermouth, Prosecco (bubbly Negroni)',
                price: '$15',
              },
              {
                name: 'Premium Whiskey Flight',
                description:
                  "1oz pours: Yamazaki 12, Macallan 18, Blanton's Single Barrel",
                price: '$45',
              },
              {
                name: 'Champagne by the Glass',
                description:
                  'Dom Pérignon 2013, Krug Grande Cuvée, Veuve Clicquot',
                price: '$28-85',
              },
            ],
          },
        ]
    const footnote =
      props.footnote ??
      'Full menu includes beer, wine, and non-alcoholic options'
    const footnoteCta = props.footnoteCta ?? 'Download Full Menu (PDF)'

    return (
      <section
        className={cn('border-t border-border py-24 lg:py-32', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-8 border-b border-border pb-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {col.title}
                </h3>
                <div className="space-y-6">
                  {(col.items ?? []).map((drink) => (
                    <div
                      key={drink.name}
                      className="flex items-start justify-between gap-4"
                    >
                      <div>
                        <h4 className="mb-1 font-medium">{drink.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {drink.description}
                        </p>
                      </div>
                      <span className="whitespace-nowrap text-muted-foreground">
                        {drink.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 border border-border p-8 text-center">
            <p className="mb-4 text-muted-foreground">{footnote}</p>
            <button
              type="button"
              onClick={() => go(footnoteCta)}
              className="border-b border-muted-foreground pb-1 text-sm tracking-wide transition-colors hover:border-foreground hover:text-foreground"
            >
              {footnoteCta}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
