import type { ReactNode } from 'react'
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import startShellCss from '../start/start-shell.css?url'
import AppClerkProvider from '../integrations/clerk/provider'
import HeaderUser from '../integrations/clerk/header-user'
import AppConvexProvider from '../integrations/convex/provider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Ship Fast' },
      {
        name: 'description',
        content: 'Generate and manage your Ship Fast website sessions.',
      },
    ],
    links: [{ rel: 'stylesheet', href: startShellCss }],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppClerkProvider>
          <AppConvexProvider>
            <div className="start-shell">
              <header className="shell-nav">
                <Link to="/" className="shell-brand" aria-label="Ship Fast Start shell home">
                  <span className="shell-bolt" aria-hidden="true">S</span>
                  <span>Ship Fast</span>
                </Link>
                <nav aria-label="Main navigation">
                  <a href="http://localhost:7420/">Generator</a>
                  <a href="/pricing">Pricing</a>
                  <HeaderUser />
                </nav>
              </header>
              {children}
            </div>
          </AppConvexProvider>
        </AppClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
