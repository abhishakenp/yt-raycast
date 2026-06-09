import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const sessionInput = z.object({
  sessionId: z.string().min(1),
})

const getSessionReadiness = createServerFn({ method: 'GET' })
  .validator(sessionInput)
  .handler(async ({ data }) => {
    const { createFilesystemSessionRepository } = await import(
      '../session-domain/filesystem-session-repository.js'
    )
    const repository = createFilesystemSessionRepository()
    return {
      session: repository.get(data.sessionId),
      readiness: repository.readiness(data.sessionId),
    }
  })

export const Route = createFileRoute('/session/$sessionId')({
  loader: ({ params }) => getSessionReadiness({ data: { sessionId: params.sessionId } }),
  component: SessionDetail,
})

function SessionDetail() {
  const { session, readiness } = Route.useLoaderData()

  if (!session || !readiness) {
    return (
      <main className="shell-main single-column">
        <section className="hero-panel">
          <p className="eyebrow">Session not found</p>
          <h1>This session is not in the local Shipfast repository.</h1>
          <Link className="secondary-action" to="/">Back to Start shell</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="shell-main single-column">
      <section className="hero-panel">
        <p className="eyebrow">Session {session.id}</p>
        <h1>{session.prompt || 'Untitled generation'}</h1>
        <dl className="readiness-grid">
          <div>
            <dt>Homepage</dt>
            <dd>{readiness.homepageReady ? 'Ready' : 'Pending'}</dd>
          </div>
          <div>
            <dt>OpenUI</dt>
            <dd>{readiness.openuiReady ? 'Ready' : 'Pending'}</dd>
          </div>
          <div>
            <dt>Site spec</dt>
            <dd>{readiness.siteSpecReady ? 'Ready' : 'Pending'}</dd>
          </div>
          <div>
            <dt>Tasks</dt>
            <dd>{readiness.done}/{readiness.taskCount}</dd>
          </div>
        </dl>
        <div className="hero-actions">
          <a className="primary-action" href={`http://localhost:7420/preview/${session.id}/`}>
            Open preview
          </a>
          <Link className="secondary-action" to="/">Back to sessions</Link>
        </div>
      </section>
    </main>
  )
}
