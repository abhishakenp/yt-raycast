import {
  existsSync,
} from 'node:fs'
import { join } from 'node:path'
import {
  createSession as createServerSession,
  getAllSessions as getServerSessions,
  getSession as getServerSession,
  initSessionDir,
  readAnonOwnerSecret,
} from '../server/sessions.js'

const DEFAULT_SESSIONS_DIR = join(process.cwd(), 'sessions')

function countDoneTasks(tasks) {
  return tasks.filter((task) => task?.status === 'DONE' || task?.status === 'FAILED').length
}

export function toSessionDTO(session) {
  if (!session) return null
  const tasks = Array.isArray(session.tasks) ? session.tasks : []
  const taskCount = Number.isFinite(Number(session.taskCount)) ? Number(session.taskCount) : tasks.length
  const done = Number.isFinite(Number(session.done)) ? Number(session.done) : countDoneTasks(tasks)
  const openuiReady =
    session.openuiReady !== undefined
      ? Boolean(session.openuiReady)
      : Boolean(session.workspace && existsSync(join(session.workspace, 'home.openui')))
  return {
    id: session.id,
    prompt: session.prompt || '',
    workspace: session.workspace || '',
    userId: session.userId ?? null,
    owner: session.userId ? { type: 'user', id: session.userId } : { type: 'anonymous' },
    createdAt: session.createdAt ?? null,
    homepageReady: Boolean(session.homepageReady),
    openuiReady,
    siteSpecReady: Boolean(session.siteSpecReady),
    status: session.lastStatus || null,
    elapsed: session.elapsed ?? null,
    cost: session.cost ?? null,
    taskCount,
    done,
    preferredExportTarget: session.preferredExportTarget || 'html',
    preferredLanguage: session.preferredLanguage || 'en',
    isPrivate: Boolean(session.isPrivate),
    deployment: session.deployment || null,
    themeOverride: session.themeOverride || null,
    hasAnonymousOwnerSecret: !session.userId && Boolean(readAnonOwnerSecret(session.workspace)),
  }
}

export function createFilesystemSessionRepository({ sessionsDir = DEFAULT_SESSIONS_DIR } = {}) {
  initSessionDir(sessionsDir)

  return {
    create(input) {
      const session = createServerSession(
        sessionsDir,
        input.prompt,
        input.userId ?? null,
        input.options || {},
      )
      return toSessionDTO(session)
    },

    get(id) {
      return toSessionDTO(getServerSession(id))
    },

    list({ userId } = {}) {
      return getServerSessions(userId).map((session) =>
        toSessionDTO({
          ...session,
          userId: userId ?? session.userId ?? null,
          tasks: Array.from({ length: session.taskCount || 0 }, (_, index) => ({
            id: `task-${index}`,
            status: index < (session.done || 0) ? 'DONE' : 'PENDING',
          })),
        }),
      )
    },

    readiness(id) {
      const session = toSessionDTO(getServerSession(id))
      if (!session) return null
      return {
        id: session.id,
        homepageReady: Boolean(session.homepageReady),
        openuiReady: Boolean(session.openuiReady),
        siteSpecReady: Boolean(session.siteSpecReady),
        generated: Boolean(session.homepageReady || session.openuiReady || session.siteSpecReady),
        taskCount: session.taskCount,
        done: session.done,
        elapsed: session.elapsed ?? null,
      }
    },
  }
}
