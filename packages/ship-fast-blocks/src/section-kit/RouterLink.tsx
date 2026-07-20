import * as React from 'react'
import { Link, useRouter } from '@tanstack/react-router'

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

    // Outside a TanStack RouterProvider (SSR, export, tests), `useRouter`
    // returns undefined and `Link` crashes on the missing router, so fall
    // back to a plain anchor.
    const router = useRouter({ warn: false })
    if (!router) {
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
