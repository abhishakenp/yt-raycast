import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * GovernmentPortalFaq — formal citizen-services / information accordion for a
 * classic Indian-government / public-sector (PSU) portal. Each item expands a
 * Q&A on common civic topics — RTI applications, grievance redressal, how to
 * apply, e-tender help, public-services help — toggled via useState. Gov-blue
 * question rows (#3346B5) with #640032 active accents and #333 answer body.
 * Use for the official FAQ / citizen-help / RTI / grievance-info section of any
 * government, civic, municipal, PSU, utility or public-sector portal.
 */
export const GovernmentPortalFaq = defineCapsule({
  name: 'GovernmentPortalFaq',
  description:
    'Formal citizen-services / information accordion for a classic Indian-government / public-sector (PSU) portal: Q&A on common civic topics — RTI applications, grievance redressal, how to apply, e-tender help, public-service queries — each row toggled via useState. Gov-blue #3346B5 question rows with #640032 active accents and #333 answer body. Use for the official FAQ, citizen-help, RTI, grievance-information or how-to-apply section of any classic government, civic, municipal, PSU, utility or public-sector portal.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Optional short intro line under the heading. */
    intro: z.string().optional(),
    /** Accordion Q&A items. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? 'Citizen Services — Frequently Asked Questions'
    const intro =
      props.intro ??
      'Answers to common queries on public services, RTI, grievance redressal and e-procurement.'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'How do I file an RTI application?',
            a: 'Submit your Right to Information request in writing to the designated Public Information Officer (PIO) along with the prescribed application fee. Applications may be filed online through the RTI portal or by post to the Head Office. The PIO is required to respond within 30 days as mandated under the RTI Act, 2005.',
          },
          {
            q: 'How can I lodge a grievance and track its redressal?',
            a: 'Register your grievance through the public grievance portal (CPGRAMS) or by submitting a written complaint at any regional office. Each grievance is assigned a unique registration number which can be used to track its status online until final disposal by the concerned department.',
          },
          {
            q: 'How do I apply for tenders / participate in e-procurement?',
            a: 'All tenders are published on the official e-procurement portal. Vendors must complete one-time online registration with a valid Digital Signature Certificate (DSC), download the tender document, and submit technical and financial bids before the last date and time of submission specified in the Notice Inviting Tender (NIT).',
          },
          {
            q: 'What documents are required to apply for public services?',
            a: 'Required documents vary by service but typically include valid photo identification, address proof, the duly filled application form and any service-specific certificates. The exact checklist is listed under each service in the Citizen Services section and on the respective application form.',
          },
          {
            q: 'Who do I contact for e-tender technical help?',
            a: 'For technical assistance with digital signatures, bid submission or portal access, contact the e-procurement help desk during office hours on the published helpline number, or email the technical support cell listed on the tenders page. Bidders are advised to complete registration well before the bid deadline.',
          },
        ]

    const [open, setOpen] = useState<number | null>(0)

    return (
      <section
        className={cn('px-6 py-12 lg:px-8', props.className)}
        style={{ fontFamily: '"Open Sans", "Alegreya Sans", sans-serif' }}
        aria-label={heading}
      >
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            title={heading}
            subtitle={intro}
            align="left"
            titleClassName="text-2xl font-semibold text-[#3346B5]"
            className="mb-6"
          />
          <div className="divide-y divide-[#dfdfdf] rounded-sm border border-[#dfdfdf] bg-white shadow-sm">
            {items.map((item, i) => {
              const isOpen = open === i
              return (
                <div key={`${item.q}-${i}`}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[15px] font-medium transition-colors',
                      isOpen
                        ? 'bg-[#f4f7fa] text-[#350788]'
                        : 'text-[#3346B5] hover:bg-[#f4f7fa]',
                    )}
                  >
                    <span>{item.q}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className={cn(
                        'size-5 shrink-0 text-[#640032] transition-transform',
                        isOpen ? 'rotate-180' : '',
                      )}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {isOpen ? (
                    <div className="px-4 pb-4 text-[14px] leading-[22px] text-[#333]">
                      {item.a}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  },
})
