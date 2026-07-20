import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

function DotWave({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 12v0" />
      <path d="M8 9v6" />
      <path d="M12 5v14" />
      <path d="M16 8v8" />
      <path d="M20 11v2" />
    </svg>
  )
}

function Headphones({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1Z" />
      <path d="M20 14a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1Z" />
    </svg>
  )
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M12 8a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4Z" />
    </svg>
  )
}

function Mic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  )
}

function Chat({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 10h8" />
      <path d="M8 13h5" />
    </svg>
  )
}

function Music({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 18V6l11-2v12" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </svg>
  )
}

const ICONS = [DotWave, Music, Sparkle, Mic, Headphones, Chat]

export const PodcastTopics = defineCapsule({
  name: 'PodcastTopics',
  description:
    "A responsive audio-editorial grid of the Signal & Static podcast's recurring topics, built on FeatureGrid. Each square hard-shadowed cell leads with a mono track-index numeral and a small line-icon accent, then a topic title and a one-line description — episode-numbering grammar instead of uniform icon tiles. Use it to show, at a glance, what an audio show keeps returning to episode after episode.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    topics: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What we talk about'
    const subheading =
      props.subheading ??
      'Six threads we keep pulling on, episode after episode.'
    const topics = props.topics?.length
      ? props.topics
      : [
          {
            title: 'Sound Design',
            description:
              'How texture, room tone, and silence quietly shape what a scene feels like.',
          },
          {
            title: 'Music & Scoring',
            description:
              'Score cues, needle drops, and the warm low end that carries an episode.',
          },
          {
            title: 'Storytelling Craft',
            description:
              'Structure, pacing, and the small turns that keep a listener leaning in.',
          },
          {
            title: 'Behind the Mic',
            description:
              'Honest field notes on gear, takes, and the long road to a final cut.',
          },
          {
            title: 'Interviews',
            description:
              'Long, unhurried conversations with the makers behind the sounds we love.',
          },
          {
            title: 'Listener Mailbag',
            description:
              'Your questions, hot takes, and voice memos, answered on the air.',
          },
        ]
    const features = topics.map((t, i) => {
      const Icon = ICONS[i % ICONS.length]
      return {
        title: t.title,
        description: t.description,
        icon: <Icon className="size-5" />,
      }
    })
    return (
      <section
        className={cn(
          'bg-background pt-24 pb-16 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <FeatureGrid heading={heading} subheading={subheading} columns={3}>
            {features.map((f, i) => {
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
                <FeatureCard
                  key={__iv__.title}
                  className="gap-4 rounded-none border-border bg-background p-6 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-foreground hover:shadow-[6px_6px_0_0] hover:shadow-foreground/10 motion-reduce:transform-none"
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                      Track {String(i + 1).padStart(2, '0')}
                    </span>
                    {__iv__.icon && (
                      <FeatureIcon className="size-8 rounded-none bg-transparent text-foreground/60">
                        {__iv__.icon}
                      </FeatureIcon>
                    )}
                  </div>
                  <FeatureTitle className="text-xl font-extrabold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
