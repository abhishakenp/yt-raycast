import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteNav } from '#/section-kit/SiteNav.tsx'

/**
 * PropertyListingNavbar — clean top navigation for a property marketplace /
 * search portal. A sticky bordered-bottom bar holds a logo-tile + wordmark on
 * the left, an inline nav (For Sale / For Rent / New / Agents) in the middle on
 * desktop, and a filled "Post Listing" primary CTA on the right. Wordmark, nav
 * items, and CTA route through useNavigate. Use as the site header for property
 * search portals, listing marketplaces, and rental sites. Renders fully with no
 * props via baked defaults.
 */
export const PropertyListingNavbar = defineComponent({
  name: 'PropertyListingNavbar',
  description:
    "Clean sticky top navigation for a property marketplace / search portal: a logo-tile + wordmark on the left, an inline For Sale / For Rent / New / Agents nav in the middle on desktop, and a filled 'Post Listing' primary CTA on the right. Wordmark, nav items, and CTA route through useNavigate. Use as the site header for property search portals, listing marketplaces, and rental sites.",
  props: z.object({
    /** Brand wordmark beside the logo tile. */
    brand: z.string().optional(),
    /** Primary navigation labels. */
    links: z.array(z.string()).optional(),
    /** Filled primary CTA label. */
    cta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nestable'
    const nav = props.links?.length
      ? props.links
      : ['For Sale', 'For Rent', 'New', 'Agents']
    const cta = props.cta ?? 'Post Listing'
    const ctaTarget = props.ctaTarget ?? 'Post'

    return (
      <SiteNav
        brand={brand}
        nav={nav}
        homeTarget="Home"
        sticky
        cta={{ label: cta, target: ctaTarget, variant: 'primary' }}
        className={props.className}
      />
    )
  },
})
