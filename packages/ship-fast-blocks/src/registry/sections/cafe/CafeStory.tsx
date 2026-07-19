import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  StorySection,
  StoryGrid,
  StoryMedia,
  StoryContent,
  StoryEyebrow,
  StoryHeading,
  StoryBody,
  StoryFooter,
  StoryImageTile,
} from '#/section-kit/StorySection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * CafeStory — split founder / origin story section for a cozy cafe / coffee
 * shop page. Left side: two vertically offset 3:4 photos in a 2-column grid.
 * Right side: an eyebrow cap, a serif heading, multiple paragraphs of narrative
 * copy, and a founder attribution row with a round avatar, name, and role.
 * No links. Use to present a cafe's origin, values, or team story. Renders
 * fully with no props via baked-in "Little Owl Coffee" defaults.
 */
export const CafeStory = defineCapsule({
  name: 'CafeStory',
  description:
    "Split founder / origin story section for a cozy cafe page: left side shows two vertically offset 3:4 photos in a 2-column grid; right side has an eyebrow cap, serif heading, multiple narrative paragraphs, and a founder attribution row with a round avatar, name, and role. No links. Use to present a cafe's origin, values, or team story.",
  props: z.object({
    /** Eyebrow / cap text. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Narrative paragraphs. */
    paragraphs: z.array(z.string()).optional(),
    /** Founder name(s). */
    founderName: z.string().optional(),
    /** Founder role. */
    founderRole: z.string().optional(),
    /** Alt text driving the founder avatar. */
    founderAvatarAlt: z.string().optional(),
    /** Alt text driving the left-top photo. */
    imageAlt1: z.string().optional(),
    /** Alt text driving the left-bottom photo. */
    imageAlt2: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const cap = props.cap ?? 'Our Story'
    const heading = props.heading ?? 'From a dream to your daily ritual'
    const paragraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          "Little Owl Coffee began in 2018 when Marcus Chen and Elena Rodriguez left their corporate jobs to pursue a shared obsession: creating a space where exceptional coffee meets genuine community. They spent six months remodeling a forgotten storefront in Portland's Pearl District, hand-pouring the concrete floors and building the communal tables themselves.",
          'The name "Little Owl" came from the Western Screech-Owl pair that nested in the oak tree outside their first apartment together. Like those owls, we believe in being quietly present, observant, and creating warmth in unexpected places.',
          'Today, we source our beans through direct trade relationships with small farms in Ethiopia, Colombia, and Guatemala. We visit at least two farms each year, building relationships that go beyond transactional. Our head roaster, James, develops profiles that honor the unique characteristics of each origin while making them approachable for everyday enjoyment.',
        ]
    const founderName = props.founderName ?? 'Marcus & Elena'
    const founderRole = props.founderRole ?? 'Founders & Co-owners'
    const founderAvatarAlt =
      props.founderAvatarAlt ??
      'Professional headshot of Marcus Chen, co-owner, a smiling man with glasses and a beard'
    const imageAlt1 =
      props.imageAlt1 ??
      'Portrait of cafe owners in the coffee shop kitchen, smiling while preparing pastries'
    const imageAlt2 =
      props.imageAlt2 ??
      'Coffee shop interior during golden hour, showing warm lighting, potted plants, and communal seating'

    return (
      <StorySection
        className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
      >
        <Container size="xl" className="px-6">
          <StoryGrid>
            <div className="order-2 lg:order-1">
              <StoryMedia>
                <StoryImageTile offset>
                  <Image
                    alt={imageAlt1}
                    w={500}
                    h={667}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </StoryImageTile>
                <StoryImageTile>
                  <Image
                    alt={imageAlt2}
                    w={500}
                    h={667}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </StoryImageTile>
              </StoryMedia>
            </div>

            <StoryContent className="order-1 lg:order-2">
              <StoryEyebrow>{cap}</StoryEyebrow>
              <StoryHeading>{heading}</StoryHeading>
              <StoryBody>
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </StoryBody>
              <StoryFooter>
                <Image
                  alt={founderAvatarAlt}
                  w={100}
                  h={100}
                  className="size-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-foreground">{founderName}</p>
                  <p className="text-sm text-muted-foreground">{founderRole}</p>
                </div>
              </StoryFooter>
            </StoryContent>
          </StoryGrid>
        </Container>
      </StorySection>
    )
  },
})
