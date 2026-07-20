import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

const ScissorsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
    aria-hidden="true"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M8.12 8.12 20 20" />
    <path d="M8.12 15.88 20 4" />
  </svg>
)

const DropletIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
    aria-hidden="true"
  >
    <path d="M12 2.7 6.3 9.2a7.5 7.5 0 1 0 11.4 0Z" />
  </svg>
)

const RazorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
    aria-hidden="true"
  >
    <path d="M3 13 13 3l4 4-10 10H3Z" />
    <path d="M14 6l4 4" />
    <path d="M17 9l4 4-3 3" />
  </svg>
)

const SparkleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
    aria-hidden="true"
  >
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="m6.3 6.3 2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" />
  </svg>
)

const ICONS = [
  <ScissorsIcon />,
  <DropletIcon />,
  <RazorIcon />,
  <SparkleIcon />,
]

export const SalonBarberServices = defineCapsule({
  name: 'SalonBarberServices',
  description:
    "Services band for a barbershop or salon rendered as a vintage-lite editorial ledger: an asymmetric header pairs a mono index eyebrow and serif heading with a mono count on the right, over a faint serif ghost watermark, above a collapsed-border grid of numbered service cells (mono index numeral, small hairline-framed grooming glyph, serif title, and a short confident description). Use it directly under the hero to lay out the menu of services on a barbershop, salon, or men's grooming page.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    services: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Our Services'
    const subheading = props.subheading ?? 'What we do best'
    const services = props.services?.length
      ? props.services
      : [
          {
            title: 'Haircuts & Fades',
            description:
              'Skin fades, tapers, scissor cuts and classic styles dialed in to your head shape and hair type.',
          },
          {
            title: 'Color & Highlights',
            description:
              'Single-process color, gray blending, and natural-looking highlights applied with a careful, modern hand.',
          },
          {
            title: 'Beard & Grooming',
            description:
              'Hot-towel beard shaping, straight-razor line-ups, and grooming that finishes the whole look.',
          },
          {
            title: 'Styling & Treatments',
            description:
              'Wash, scalp treatments, and product styling so you walk out camera-ready and easy to maintain.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-top-6 right-[-2%] font-serif text-[7rem] italic tracking-tight text-foreground/[0.04] sm:text-[10rem] lg:text-[14rem]">
          Craft
        </Watermark>

        <Container className="relative">
          {/* Asymmetric header — mono eyebrow + serif heading left, mono count right. */}
          <div className="flex flex-col gap-5 border-b border-foreground/15 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <MonoTag tone="primary">{subheading}</MonoTag>
              <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
            </div>
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              {String(services.length).padStart(2, '0')} / the menu
            </MonoTag>
          </div>

          {/* Collapsed-border numbered service ledger. */}
          <div className="grid grid-cols-1 border-l border-t border-foreground/15 sm:grid-cols-2">
            {services.map((service, i) => (
              <article
                key={service.title}
                className="group flex flex-col gap-4 border-r border-b border-foreground/15 bg-card p-7 transition-colors duration-200 hover:bg-muted/40 sm:p-9"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-9 place-items-center border border-foreground/20 text-foreground transition-colors duration-200 group-hover:border-primary group-hover:text-primary"
                  >
                    {ICONS[i % ICONS.length]}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
