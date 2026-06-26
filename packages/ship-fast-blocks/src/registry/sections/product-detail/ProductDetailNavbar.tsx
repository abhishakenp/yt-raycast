import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

export const ProductDetailNavbar = defineComponent({
  name: 'ProductDetailNavbar',
  description:
    'Top navigation header for the Product Detail page family, wrapping the shared SiteNav composite. Renders the Aurora brand mark, a focused in-page link set (Overview, Features, Reviews, FAQ), and a cart-style primary CTA (Add to Cart) for single-product flagship pages. Use as the first band of a premium product detail page; all content is prop-driven with sensible Aurora Pro Headphones defaults.',
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    cta: z
      .object({
        label: z.string(),
        target: z.string().optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Aurora'
    const nav = props.nav?.length
      ? props.nav
      : ['Overview', 'Features', 'Reviews', 'FAQ']
    const cta = props.cta ?? { label: 'Add to Cart', target: 'Overview' }

    const mark = (
      <svg
        width={28}
        height={28}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M4 13a8 8 0 0 1 16 0" />
        <rect x="3" y="13" width="4" height="7" rx="1.4" />
        <rect x="17" y="13" width="4" height="7" rx="1.4" />
      </svg>
    )

    return (
      <SiteNav
        brand={brand}
        brandMark={mark}
        nav={nav}
        cta={cta}
        className={props.className}
      />
    )
  },
})
