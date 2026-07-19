import * as React from 'react'
import { Link } from '@tanstack/react-router'

type RouterLinkProps = Omit<React.ComponentProps<'a'>, 'href'> & {
  href: string
}

function isNativeHref(href: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)
}

const RouterLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ href, children, ...props }, ref) => {
    if (isNativeHref(href)) {
      return (
        <a ref={ref} href={href} {...props}>
          {children}
        </a>
      )
    }

    return (
      <Link ref={ref} to={href} {...props}>
        {children}
      </Link>
    )
  },
)
RouterLink.displayName = 'RouterLink'

export { RouterLink }
