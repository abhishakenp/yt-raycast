import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * HealthcareServices — collapsed-border services ledger for a clinic /
 * primary-care page. An asymmetric header (left-aligned mono eyebrow + heading
 * + lede, mono index meta on the right) above a hairline collapsed-border
 * 1-to-3 column grid of square cells; each cell carries a zero-padded mono
 * index numeral, a service title, a description, and a quiet square outline
 * "book" button (its label from the item) that inverts to the foreground color
 * on hover with press feedback and writes the service to shared booking state.
 * Use for a services / "what we treat" section of a doctors' office,
 * family-medicine, women's-health, pediatric, mental-health or telehealth
 * clinic. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'
export const HealthcareServices = defineCapsule({
  name: 'HealthcareServices',
  description:
    "Collapsed-border services ledger for a clinic / primary-care page: an asymmetric header (left-aligned mono eyebrow + heading + lede, mono index meta right) above a hairline collapsed-border 1-to-3 column grid of square cells, each with a zero-padded mono index numeral, a service title, a description, and a quiet square outline book button (label from the item) that inverts on hover and writes the service to shared booking state. Use for a services / 'what we treat' section of a doctors' office, family-medicine, women's-health, pediatric, mental-health or telehealth clinic.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards: title, description, and book-link label. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          cta: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Our Services'
    const heading =
      props.heading ?? 'Comprehensive care for every stage of life'
    const description =
      props.description ??
      'From routine checkups to specialized treatments, our board-certified physicians provide personalized care tailored to your unique health needs.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Primary Care',
            description:
              'Comprehensive annual physicals, chronic disease management, and preventive screenings. We manage diabetes, hypertension, asthma, and more.',
            cta: 'Book primary care',
          },
          {
            title: 'Virtual Visits',
            description:
              'Connect with your doctor from home for follow-ups, medication refills, and minor concerns. HIPAA-compliant video appointments available same-day.',
            cta: 'Schedule virtual visit',
          },
          {
            title: "Women's Health",
            description:
              'Annual well-woman exams, Pap smears, breast health screenings, family planning, menopause management, and hormone therapy consultations.',
            cta: "Book women's health visit",
          },
          {
            title: 'Pediatrics',
            description:
              'Complete care for infants, children, and adolescents. Well-child visits, immunizations, school physicals, and developmental screenings.',
            cta: 'Schedule pediatric visit',
          },
          {
            title: 'Mental Health',
            description:
              'Integrated behavioral health services including anxiety and depression screening, counseling referrals, and medication management.',
            cta: 'Book mental health visit',
          },
          {
            title: 'Lab & Diagnostics',
            description:
              'On-site blood work, urine testing, EKGs, and rapid strep/flu tests. Most results available within 24-48 hours through your patient portal.',
            cta: 'Learn about labs',
          },
        ]
    useSyncLocalServices(
      lakebed,
      items.map((item) =>
        localServiceItem({
          name: item.title,
          summary: item.description,
        }),
      ),
    )
    return (
      <section
        className={cn('bg-muted/40 py-20 sm:py-24 lg:py-28', props.className)}
        aria-labelledby="services-heading"
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              titleId="services-heading"
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(items.length).padStart(2, '0')} / index
            </MonoTag>
          </div>

          <ServicesGrid columns={3} className="gap-0">
            <div className="col-span-full grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
              {items.map((f, i) => {
                const __iv__ = f as {
                  title: string
                  description: string
                  icon?: React.ReactNode
                  points?: string[]
                  cta?: string
                  price?: string
                  imageAlt?: string
                }
                return (
                  <ServiceCard
                    key={__iv__.title}
                    className="gap-4 rounded-none border-0 border-b border-r border-border bg-background p-6 sm:p-8"
                  >
                    <MonoTag aria-hidden="true" tone="faint">
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    {__iv__.icon && <ServiceIcon>{__iv__.icon}</ServiceIcon>}
                    <ServiceTitle className="text-xl font-bold tracking-tight">
                      {__iv__.title}
                    </ServiceTitle>
                    <ServiceDescription className="leading-relaxed">
                      {__iv__.description}
                    </ServiceDescription>
                    {__iv__.cta ? (
                      <LocalServiceBookingButton
                        lakebed={lakebed}
                        intentLabel={__iv__.cta}
                        service={__iv__.title}
                        source="services"
                        pendingChildren={
                          <>
                            <LocalServiceMutationSpinner className="size-4" />
                            Booking
                          </>
                        }
                        className="mt-auto inline-flex w-fit items-center justify-center gap-2 rounded-none border border-foreground/25 bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                      >
                        {__iv__.cta}
                      </LocalServiceBookingButton>
                    ) : null}
                  </ServiceCard>
                )
              })}
            </div>
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
