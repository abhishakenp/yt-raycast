import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * YogaStudioNavbar — warm, grounded top navigation for a yoga-studio site. Thin
 * configuration over the shared `SiteNav` composite: a clean bordered-bottom bar
 * with a wordmark on the left, a centered set of nav links (Classes / Schedule /
 * Teachers / Pricing), a filled primary "Start Free Trial" CTA on the right, and
 * a real mobile drawer (Sheet) on small screens. The wordmark and every nav item
 * route through useNavigate. Use as the opening site navigation for yoga
 * studios, movement spaces, pilates studios, and mindfulness centers. Renders
 * fully with no props via baked-in defaults.
 */
export const YogaStudioNavbar = defineComponent({
  name: 'YogaStudioNavbar',
  description:
    "Warm, grounded top navigation for a yoga-studio site built on the shared SiteNav composite: a clean bordered-bottom bar with a wordmark on the left, centered nav links (Classes / Schedule / Teachers / Pricing), a filled primary 'Start Free Trial' CTA on the right, and a real mobile drawer. The wordmark and links route through useNavigate. Use as the opening site navigation for yoga studios, movement spaces, pilates studios, and mindfulness centers.",
  props: z.object({
    /** Wordmark / brand name on the left. */
    brand: z.string().optional(),
    /** Center nav link labels. */
    links: z.array(z.string()).optional(),
    /** Primary trial CTA label. */
    cta: z.string().optional(),
    /** Route label the CTA navigates to. */
    ctaTarget: z.string().optional(),
    /** Route label the wordmark navigates to. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const links = props.links?.length
      ? props.links
      : ['Classes', 'Schedule', 'Teachers', 'Pricing']
    return (
      <SiteNav
        brand={props.brand ?? 'Grove Yoga'}
        brandClassName="text-xl font-bold tracking-tight"
        nav={links}
        cta={{
          label: props.cta ?? 'Start Free Trial',
          target: props.ctaTarget ?? 'Trial',
        }}
        homeTarget={props.homeTarget ?? 'Home'}
        className={props.className}
      />
    )
  },
})
