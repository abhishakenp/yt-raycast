import type { ComponentProps, ReactNode } from 'react'
import Link from 'next/link'

const PillLayers = () => (
  <>
    <span className="pill__lens" aria-hidden="true" />
    <span className="pill__fringe pill__fringe--r" aria-hidden="true" />
    <span className="pill__fringe pill__fringe--b" aria-hidden="true" />
    <span className="pill__mist" aria-hidden="true" />
    <span className="pill__iris" aria-hidden="true" />
    <span className="pill__sheen" aria-hidden="true" />
    <span className="pill__rim" aria-hidden="true" />
  </>
)

export type SfGlassPillButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  children: ReactNode
}

export const SfGlassPillButton = ({
  className = '',
  children,
  type = 'button',
  ...props
}: SfGlassPillButtonProps) => {
  const cls = ['pill', className].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} {...props}>
      <PillLayers />
      <span className="pill__body">{children}</span>
    </button>
  )
}

export type SfGlassPillLinkProps = Omit<ComponentProps<typeof Link>, 'className' | 'children'> & {
  className?: string
  children: ReactNode
}

export const SfGlassPillLink = ({ className = '', children, ...props }: SfGlassPillLinkProps) => {
  const cls = ['pill', className].filter(Boolean).join(' ')
  return (
    <Link className={cls} {...props}>
      <PillLayers />
      <span className="pill__body">{children}</span>
    </Link>
  )
}
