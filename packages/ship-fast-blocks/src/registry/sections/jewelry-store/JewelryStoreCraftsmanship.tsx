import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  FeatureListItem,
  FeatureListItemIcon,
  FeatureListItemTitle,
  FeatureListItemDescription,
  FeatureListItemBody,
} from '#/section-kit/FeatureListItem.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  SplitStory,
  SplitStoryGrid,
  SplitStoryContent,
} from '#/section-kit/SplitStory.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * JewelryStoreCraftsmanship — split craftsmanship / values band for a luxury
 * jewelry maison on a subtle muted band. Two columns: left holds a gold
 * eyebrow, serif heading, lead paragraph, and a stacked list of value props
 * (each a circular gold icon chip + serif title + description, icons rotated
 * from a local set: check-badge, star, shield, sparkle); right holds a
 * staggered two-column photo collage of atelier images (mixed 3:4 / square
 * aspect ratios, one column nudged down). Use to communicate ethical sourcing,
 * master artisanship, lifetime warranty, and bespoke design for fine jewelers,
 * diamond houses, or high-jewelry maisons. Renders fully with no props.
 */
export const JewelryStoreCraftsmanship = defineCapsule({
  name: 'JewelryStoreCraftsmanship',
  description:
    'Split craftsmanship / values band for a luxury jewelry maison on a subtle muted band: a left column with a gold eyebrow, serif heading, lead paragraph, and a stacked list of value props (each a circular gold icon chip + serif title + description, icons rotated from a local check-badge / star / shield / sparkle set), and a right column with a staggered two-column photo collage of atelier images (mixed 3:4 / square aspect ratios, one column nudged down). Use to communicate ethical sourcing, master artisanship, lifetime warranty, and bespoke design for fine jewelers, diamond houses, or high-jewelry maisons.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    imageAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Difference'
    const heading = props.heading ?? 'Crafted Without Compromise'
    const description =
      props.description ??
      'For over 130 years, Maison Noir has upheld an unwavering commitment to excellence. Each piece that bears our name represents countless hours of meticulous craftsmanship.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Conflict-Free Guarantee',
            description:
              'Every diamond is ethically sourced and certified by the Kimberley Process. We trace each stone from mine to masterpiece.',
          },
          {
            title: 'Master Artisans',
            description:
              'Our atelier employs 47 master jewelers with a combined 840 years of experience, each trained in traditional techniques passed through generations.',
          },
          {
            title: 'Lifetime Warranty',
            description:
              'Every Maison Noir piece includes complimentary cleaning, inspection, and repairs for life. We stand behind our craft eternally.',
          },
          {
            title: 'Bespoke Design',
            description:
              'Commission a one-of-a-kind creation. Our designers will transform your vision into a timeless treasure, from sketch to finished piece.',
          },
        ]
    const imageAlts = props.imageAlts?.length
      ? props.imageAlts
      : [
          'jeweler hands using precision tools to set diamond in ring',
          'close-up of diamond grading equipment and loose diamonds on velvet',
          'goldsmith polishing finished gold ring at workbench',
          'collection of finished diamond jewelry pieces displayed on black slate',
        ]

    const CheckBadge = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    )
    const StarIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    )
    const ShieldIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.232-2.003-.777-.517-.518-.78-1.262-.78-2.003V8.6c0-.53.06-1.052.18-1.551M7 21h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
      </svg>
    )
    const SparkleIcon = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
      </svg>
    )
    const icons = [CheckBadge, StarIcon, ShieldIcon, SparkleIcon]

    return (
      <SplitStory
        variant="muted"
        className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
      >
        <Container size="xl" className="sm:px-4">
          <SplitStoryGrid className="gap-20">
            <SplitStoryContent className="space-y-0">
              <SectionHeading
                eyebrow={eyebrow}
                title={heading}
                subtitle={description}
                align="left"
                eyebrowClassName="text-primary tracking-[0.3em]"
                titleClassName="mb-4 font-serif text-4xl lg:text-5xl"
                subtitleClassName="text-lg leading-relaxed"
                className="mb-12 gap-4"
              />
              <div className="space-y-8">
                {items.map((item, i) => {
                  const Icon = icons[i % icons.length]
                  return (
                    <FeatureListItem key={item.title} className="gap-6">
                      <FeatureListItemIcon
                        shape="circle"
                        className="bg-card text-primary"
                      >
                        {<Icon />}
                      </FeatureListItemIcon>
                      <FeatureListItemBody>
                        <FeatureListItemTitle>
                          {item.title}
                        </FeatureListItemTitle>
                        <FeatureListItemDescription>
                          {item.description}
                        </FeatureListItemDescription>
                      </FeatureListItemBody>
                    </FeatureListItem>
                  )
                })}
              </div>
            </SplitStoryContent>
            <ResponsiveGrid cols="2" className="gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] overflow-hidden bg-card">
                  <Image
                    alt={imageAlts[0]}
                    w={600}
                    h={800}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden bg-card">
                  <Image
                    alt={imageAlts[1]}
                    w={600}
                    h={600}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="aspect-square overflow-hidden bg-card">
                  <Image
                    alt={imageAlts[2]}
                    w={600}
                    h={600}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden bg-card">
                  <Image
                    alt={imageAlts[3]}
                    w={600}
                    h={800}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </ResponsiveGrid>
          </SplitStoryGrid>
        </Container>
      </SplitStory>
    )
  },
})
