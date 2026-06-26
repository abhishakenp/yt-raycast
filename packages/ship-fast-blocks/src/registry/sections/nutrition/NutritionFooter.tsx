import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * NutritionFooter — multi-column site footer for a nutrition-coaching or
 * wellness site, built on the shared SiteFooter kit composite. Renders a fresh,
 * energetic brand block (leaf mark + wordmark + tagline + social row), four link
 * columns (Programs, Company, Resources, Legal), and a bottom bar with copyright
 * and a closing note. All props are optional with baked defaults so it renders
 * standalone. Use as the closing site footer on nutrition coaches, dietitians,
 * meal-plan subscriptions, diet / wellness programs or healthy-eating apps.
 */
export const NutritionFooter = defineComponent({
  name: 'NutritionFooter',
  description:
    'Multi-column site footer for a nutrition-coaching or wellness site, built on the shared SiteFooter kit composite: a fresh, energetic brand block (leaf mark + wordmark + tagline + social row), four link columns (Programs, Company, Resources, Legal), and a bottom bar with copyright and a closing note. Use as the closing site footer on nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs or healthy-eating apps.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nourish'
    const tagline =
      props.tagline ??
      'Fresh, science-backed nutrition coaching that helps you eat well and feel energized—for life.'

    const LeafMark = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="size-7 text-primary"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    )

    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Programs',
            links: ['Meal Plans', 'Coaching', 'Recipes', 'Pricing'],
          },
          {
            title: 'Company',
            links: ['About', 'Our Coaches', 'Careers', 'Stories'],
          },
          {
            title: 'Resources',
            links: ['Blog', 'Nutrition Guides', 'FAQ', 'Support'],
          },
          {
            title: 'Legal',
            links: ['Privacy', 'Terms', 'Cookies'],
          },
        ]

    const social = props.social?.length
      ? props.social
      : [
          { label: 'Instagram', href: '#' },
          { label: 'TikTok', href: '#' },
          { label: 'YouTube', href: '#' },
        ]

    const note = props.note ?? 'Eat fresh. Feel alive.'

    return (
      <SiteFooter
        brand={brand}
        brandMark={LeafMark}
        tagline={tagline}
        columns={columns}
        social={social}
        legal={['Privacy', 'Terms', 'Cookies']}
        note={note}
        className={props.className}
      />
    )
  },
})
