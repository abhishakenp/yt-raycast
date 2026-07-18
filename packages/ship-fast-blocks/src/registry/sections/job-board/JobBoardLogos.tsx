import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * JobBoardLogos — a compact "trusted by" social-proof strip for a job-board /
 * careers site. A subtle muted band with a small uppercase eyebrow heading above
 * a responsive grid of wordmark company names rendered as muted text that
 * brighten on hover; each routes through useNavigate. Use directly below a hero
 * to establish credibility on job boards, hiring marketplaces, recruiting
 * platforms or any marketing page that wants a logo cloud. Renders fully with no
 * props.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
export const JobBoardLogos = defineCapsule({
  name: 'JobBoardLogos',
  description:
    "Compact 'trusted by' social-proof strip for a job-board / careers site: a subtle muted band with a small uppercase eyebrow heading above a responsive grid of wordmark company names rendered as muted text that brighten on hover; each routes through useNavigate. Use directly below a hero to establish credibility on job boards, hiring marketplaces, recruiting platforms or any marketing page that wants a logo cloud.",
  props: z.object({
    /** Eyebrow heading above the logo grid. */
    heading: z.string().optional(),
    /** Company wordmark labels. */
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Trusted by leading companies worldwide'
    const companies = props.companies?.length
      ? props.companies
      : ['Stripe', 'Notion', 'Figma', 'Shopify', 'Webflow', 'Linear']
    return (
      <LogoStrip
        lead={heading}
        logos={companies}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn(
          'border-b border-border bg-muted/40 py-12',
          props.className,
        )}
      />
    )
  },
})
