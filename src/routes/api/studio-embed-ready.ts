import { access } from 'node:fs/promises'
import path from 'node:path'
import { createFileRoute } from '@tanstack/react-router'

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const getStudioIndexPath = () =>
  path.resolve(process.cwd(), '..', 'studio', 'dist', 'index.html')

export const Route = createFileRoute('/api/studio-embed-ready')({
  server: {
    handlers: {
      GET: async () => {
        try {
          await access(getStudioIndexPath())
          return json({ built: true })
        } catch {
          return json({ built: false })
        }
      },
    },
  },
})
