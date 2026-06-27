import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * GovernmentPortalAbout — classic Indian-government / public-sector (PSU)
 * "About / Overview" band: a Managing Director / Chairman message box on the
 * left (portrait photo via Image + name + designation + message excerpt + a
 * "read more" link routed through useNavigate) beside a short formal "About /
 * Overview" prose column on the right. Gov-blue panel headers (#3346B5), the
 * leader name in #350788, body copy in #333. Use for the official leadership
 * message / about / overview section of any government, civic, municipal, PSU,
 * utility or public-sector portal.
 */
export const GovernmentPortalAbout = defineCapsule({
  name: 'GovernmentPortalAbout',
  description:
    "Classic Indian-government / public-sector (PSU) About / Overview band: a Managing Director / Chairman message box (portrait photo + name + designation + excerpt + 'read more') beside a short formal 'About / Overview' prose column. Gov-blue #3346B5 panel headers, leader name in #350788, body in #333; the read-more link routes through useNavigate. Pairs with the tender / notice board and citizen-services sections of the family. Use for the official leadership message, about, profile or organisation-overview section of any classic government, civic, municipal, PSU, utility or public-sector portal.",
  props: z.object({
    /** Optional overall band heading rendered above the grid. */
    sectionHeading: z.string().optional(),
    /** Managing Director / Chairman message box. */
    leader: z
      .object({
        name: z.string(),
        designation: z.string(),
        photo: z.string().optional(),
        message: z.string(),
        href: z.string().optional(),
      })
      .optional(),
    /** About / Overview prose column. */
    overview: z
      .object({
        heading: z.string(),
        body: z.string(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const leader = props.leader ?? {
      name: 'Sri Anil Kumar Shukla',
      designation: 'Managing Director',
      photo: undefined,
      message:
        'It gives me immense pleasure to lead an organisation that continues to power the State with reliability and an unwavering commitment to clean, efficient generation. Guided by the principles of transparency, accountability and public service, we remain dedicated to serving every citizen and stakeholder with integrity.',
      href: '/about/md-message',
    }
    const overview = props.overview ?? {
      heading: 'About / Overview',
      body: 'Established as a State Government undertaking, the organisation operates under the administrative control of the concerned Department and functions in accordance with statutory norms, public-procurement rules and citizen-service charters. Our mandate spans generation, distribution and public welfare, delivered through a network of regional offices and field units committed to good governance and the highest standards of public accountability.',
    }
    const leaderPhotoAlt = `Official portrait of ${leader.name}, ${leader.designation}`

    return (
      <section
        className={cn('px-6 py-12 lg:px-8', props.className)}
        style={{ fontFamily: '"Open Sans", "Alegreya Sans", sans-serif' }}
        aria-label={overview.heading}
      >
        {props.sectionHeading ? (
          <SectionHeading
            title={props.sectionHeading}
            align="left"
            titleClassName="text-2xl font-semibold text-[#3346B5]"
            className="mx-auto max-w-6xl mb-6"
          />
        ) : null}
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          {/* Managing Director / Chairman message box */}
          <section className="rounded-sm border border-[#dfdfdf] bg-white shadow-sm">
            <h2 className="border-b border-[#dfdfdf] bg-[#f4f7fa] px-4 py-3 text-[18px] font-medium text-[#3346B5]">
              {leader.designation}&apos;s Message
            </h2>
            <div className="flex gap-4 p-5">
              <div className="shrink-0">
                <Image
                  alt={leaderPhotoAlt}
                  w={120}
                  h={150}
                  className="h-32 w-24 rounded-sm border border-[#e5e5e5] object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-[#350788]">
                  {leader.name}
                </p>
                <p className="text-[13px] text-[#640032]">
                  {leader.designation}
                </p>
                <p className="mt-2 text-[14px] leading-[21px] text-[#333]">
                  {leader.message}
                </p>
                <button
                  type="button"
                  onClick={() => go(leader.href ?? '/about/md-message')}
                  className="mt-3 inline-block text-[14px] font-medium text-[#0792D0] transition-colors hover:underline"
                >
                  Read more...
                </button>
              </div>
            </div>
          </section>

          {/* About / Overview prose column */}
          <section className="rounded-sm border border-[#dfdfdf] bg-white shadow-sm">
            <h2 className="border-b border-[#dfdfdf] bg-[#f4f7fa] px-4 py-3 text-[18px] font-medium text-[#3346B5]">
              {overview.heading}
            </h2>
            <div className="p-5">
              <p className="text-[14px] leading-[23px] text-[#333]">
                {overview.body}
              </p>
            </div>
          </section>
        </div>
      </section>
    )
  },
})
