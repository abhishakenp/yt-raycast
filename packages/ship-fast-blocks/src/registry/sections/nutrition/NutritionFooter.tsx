import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

/**
 * NutritionFooter — fresh clean-editorial ledger footer for a nutrition-coaching
 * or wellness site, built on the shared SiteFooter kit composite. A hairline-
 * topped fresh-wash band with a giant ghost brand watermark bleeding off the
 * bottom edge: an asymmetric 12-column grid pairs a wide brand block (square
 * primary leaf tile + wordmark, tagline, and square mono social chips with hard
 * hover borders) with mono-labeled link columns whose links sit as block w-fit
 * rows; below, a hairline-divided bottom bar carries the closing note, mono legal
 * links and a decorative "[ EOF ]" tag. All props are optional with baked
 * defaults so it renders standalone. Use as the closing site footer on nutrition
 * coaches, registered dietitians, meal-plan subscriptions, diet / wellness
 * programs or healthy-eating apps.
 */
export const NutritionFooter = defineCapsule({
  name: 'NutritionFooter',
  description:
    'Fresh clean-editorial ledger footer for a nutrition-coaching or wellness site, built on the shared SiteFooter kit composite: a hairline-topped fresh-wash band with a giant ghost brand watermark, an asymmetric 12-column grid pairing a wide brand block (square primary leaf tile + wordmark, tagline, square mono social chips) with mono-labeled link columns of block w-fit rows, and a hairline-divided bottom bar with a closing note, mono legal links and a decorative EOF tag. Use as the closing site footer on nutrition coaches, registered dietitians, meal-plan subscriptions, diet / wellness programs or healthy-eating apps.',
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
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-none bg-primary text-primary-foreground"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="size-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </span>
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
        className={
          'relative overflow-hidden border-t border-border bg-muted/30' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Watermark className="-bottom-6 -right-2 text-[5rem] sm:text-[9rem] lg:text-[12rem]">
          {brand}
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="grid gap-10 md:grid-cols-12 lg:gap-8">
            <FooterBrand
              brand={brand}
              brandMark={LeafMark}
              className="md:col-span-4"
            >
              <FooterTagline className="max-w-sm">{tagline}</FooterTagline>
              <FooterSocial className="mt-5 gap-2">
                {social.map((s) => (
                  <FooterSocialLink
                    key={s.label}
                    className="rounded-none border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {s.label}
                  </FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title} className="md:col-span-2">
                <FooterColumnTitle className="font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                  <span aria-hidden="true" className="text-primary">
                    /{' '}
                  </span>
                  {col.title}
                </FooterColumnTitle>
                <FooterColumnList className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <FooterLink
                      key={link}
                      className="block w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <FooterCopyright className="text-sm text-muted-foreground">
              {note}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <FooterLegal className="flex flex-wrap gap-x-5 gap-y-2">
                {['Privacy', 'Terms', 'Cookies'].map((l) => (
                  <FooterLink
                    key={l}
                    className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l}
                  </FooterLink>
                ))}
              </FooterLegal>
              <MonoTag tone="faint" aria-hidden="true">
                [ EOF ]
              </MonoTag>
            </div>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
