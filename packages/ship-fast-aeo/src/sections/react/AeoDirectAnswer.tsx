import type { ReactNode } from 'react'

type Props = {
  answer: string
  whoFor?: string
  heading?: string
  className?: string
}

export const AeoDirectAnswer = ({ answer, whoFor, heading, className = '' }: Props) => (
  <section className={`border-b border-border bg-background py-10 sm:py-12 ${className}`} aria-label="Overview">
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      {heading ? <h2 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">{heading}</h2> : null}
      <p className="text-base leading-relaxed text-foreground sm:text-lg">{answer}</p>
      {whoFor ? (
        <p className="mt-4 text-sm text-muted-foreground">
          <strong className="text-foreground">Who this is for:</strong> {whoFor}
        </p>
      ) : null}
    </div>
  </section>
)

export type { Props as AeoDirectAnswerProps, ReactNode }
