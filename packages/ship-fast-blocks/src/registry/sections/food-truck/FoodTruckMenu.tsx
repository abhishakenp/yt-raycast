import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FoodTruckMenu — a rotating seasonal MENU section for a food-truck / street-food
 * site. A centered eyebrow + heading + intro sits above a 2-up responsive grid of menu
 * category cards (one can span full width), each led by a rounded category photo and an
 * optional badge chip, then a list of priced items (name + optional dietary tag,
 * description, right-aligned price) separated by hairline dividers, with a centered
 * dietary-legend row beneath. Imagery uses the alt-driven Image component. Use as the
 * menu section for food trucks, taco/burger/bowl concepts, cafes or any chef-driven
 * mobile-food brand showing a priced, categorized menu.
 */
export const FoodTruckMenu = defineComponent({
  name: 'FoodTruckMenu',
  description:
    'Rotating seasonal MENU section for a food-truck / street-food site: a centered eyebrow + heading + intro above a 2-up responsive grid of menu category cards (one card can span full width), each led by a rounded category photo and an optional badge chip, then a list of priced items (name with optional V/VG/GF dietary tag, description, right-aligned price) separated by hairline dividers, with a centered dietary-legend row beneath. Imagery uses the alt-driven Image component. Use as the menu section for food trucks, taco / burger / bowl concepts, cafes, delis or any chef-driven mobile-food brand showing a priced, categorized menu.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    categories: z
      .array(
        z.object({
          title: z.string(),
          imageAlt: z.string(),
          badge: z.string().optional(),
          wide: z.boolean().optional(),
          items: z.array(
            z.object({
              name: z.string(),
              description: z.string(),
              price: z.string(),
              tag: z.string().optional(),
            }),
          ),
        }),
      )
      .optional(),
    legend: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const menuEyebrow = props.eyebrow ?? 'June Menu'
    const menuHeading = props.heading ?? "What's Cooking"
    const menuDesc =
      props.description ??
      "Our menu rotates seasonally. Here's what we're serving this month."
    const menuCategories = props.categories?.length
      ? props.categories
      : [
          {
            title: 'Signature Tacos',
            badge: 'Most Popular',
            imageAlt:
              'Korean short rib tacos with kimchi slaw on corn tortillas',
            items: [
              {
                name: 'Korean Short Rib',
                description:
                  'Braised galbi, kimchi slaw, cilantro, gochujang crema',
                price: '$14',
              },
              {
                name: 'Baja Fish',
                description: 'Crispy cod, cabbage, pico, chipotle aioli (GF)',
                price: '$12',
              },
              {
                name: 'Roasted Cauliflower',
                description:
                  'Tahini dressing, pickled onion, toasted almonds (V, GF)',
                price: '$11',
                tag: 'VG',
              },
              {
                name: 'Carnitas',
                description: 'Slow-braised pork, salsa verde, queso fresco',
                price: '$13',
              },
            ],
          },
          {
            title: 'Bowls & Salads',
            imageAlt:
              'Loaded grain bowl with quinoa, roasted vegetables, and tahini dressing',
            items: [
              {
                name: 'Mediterranean Bowl',
                description:
                  'Quinoa, falafel, hummus, cucumber, tomato, tahini (V)',
                price: '$15',
                tag: 'VG',
              },
              {
                name: 'Poke Bowl',
                description:
                  'Sushi rice, ahi tuna, avocado, edamame, spicy mayo (GF)',
                price: '$16',
              },
              {
                name: 'Grilled Chicken Caesar',
                description:
                  'Romaine, parmesan, sourdough croutons, house dressing',
                price: '$13',
              },
              {
                name: 'Grain Bowl',
                description:
                  'Farro, roasted seasonal veg, lemon herb vinaigrette (V, GF)',
                price: '$14',
                tag: 'VG',
              },
            ],
          },
          {
            title: 'Burgers & Sandwiches',
            wide: true,
            imageAlt:
              'Handheld smash burger with melted cheese and caramelized onions',
            items: [
              {
                name: 'Smash Burger',
                description:
                  'Double patty, american cheese, caramelized onions, special sauce',
                price: '$15',
              },
              {
                name: 'Fried Chicken Sandwich',
                description: 'Buttermilk brined, pickles, slaw, spicy honey',
                price: '$14',
              },
              {
                name: 'Grilled Cheese',
                description:
                  'Sourdough, aged cheddar, gruyere, tomato soup dip',
                price: '$11',
                tag: 'V',
              },
              {
                name: 'BLT',
                description:
                  'Thick-cut bacon, heirloom tomato, butter lettuce, aioli',
                price: '$13',
              },
            ],
          },
          {
            title: 'Sides & Sweets',
            imageAlt: 'Assorted cookies and brownies on a rustic wooden board',
            items: [
              {
                name: 'Truffle Fries',
                description: 'Parmesan, truffle oil, herbs (V)',
                price: '$6',
              },
              {
                name: 'Street Corn',
                description: 'Elote style, cotija, chili, lime (V, GF)',
                price: '$5',
              },
              {
                name: 'Daily Cookie',
                description: 'Baked fresh each morning (V option)',
                price: '$4',
              },
            ],
          },
        ]
    const menuLegend = props.legend?.length
      ? props.legend
      : ['VG = Vegan', 'V = Vegetarian', 'GF = Gluten-Free']

    return (
      <section className={cn('px-6 py-20', props.className)}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 space-y-4 text-center">
            <span className="text-sm uppercase tracking-widest text-muted-foreground">
              {menuEyebrow}
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">{menuHeading}</h2>
            <p className="mx-auto max-w-lg text-muted-foreground">{menuDesc}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {menuCategories.map((cat) => (
              <div key={cat.title} className={cn(cat.wide && 'md:col-span-2')}>
                <Image
                  alt={cat.imageAlt}
                  w={800}
                  h={400}
                  loading="lazy"
                  className={cn(
                    'mb-6 w-full rounded-xl object-cover',
                    cat.wide ? 'h-48' : 'h-64',
                  )}
                />
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  {cat.title}
                  {cat.badge && (
                    <span className="rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
                      {cat.badge}
                    </span>
                  )}
                </h3>
                <div
                  className={cn(
                    cat.wide ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4',
                  )}
                >
                  {(cat.items ?? []).map((item, i) => (
                    <div
                      key={item.name}
                      className={cn(
                        'flex items-start justify-between gap-4',
                        i < cat.items.length - 1 &&
                          'border-b border-border pb-4',
                      )}
                    >
                      <div>
                        <p className="font-medium">
                          {item.name}
                          {item.tag && (
                            <span className="ml-1.5 text-xs font-medium text-chart-2">
                              {item.tag}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <span className="font-semibold">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-center text-sm text-muted-foreground">
            {menuLegend.map((entry) => (
              <span key={entry} className="inline-block">
                {entry}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
