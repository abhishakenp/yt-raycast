import { afterEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createFilesystemSessionRepository } from './filesystem-session-repository.js'

let tmpRoot = null

afterEach(() => {
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

function makeRepository() {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-session-domain-'))
  return createFilesystemSessionRepository({ sessionsDir: tmpRoot })
}

describe('filesystem session repository', () => {
  it('creates anonymous sessions through a storage-neutral DTO', () => {
    const repository = makeRepository()

    const session = repository.create({
      prompt: 'a warm homepage for a florist',
      userId: null,
      options: { preferredLanguage: 'fr' },
    })

    expect(session.id).toMatch(/^[a-f0-9]{12}$/)
    expect(session.prompt).toBe('a warm homepage for a florist')
    expect(session.owner).toEqual({ type: 'anonymous' })
    expect(session.preferredLanguage).toBe('fr')
    expect(session.hasAnonymousOwnerSecret).toBe(true)
    expect(existsSync(session.workspace)).toBe(true)
  })

  it('recovers generated readiness from existing filesystem sessions', () => {
    const repository = makeRepository()
    const id = 'abc123def456'
    const workspace = join(tmpRoot, id)
    mkdirSync(workspace, { recursive: true })
    writeFileSync(join(workspace, 'prompt.txt'), 'a generated bakery website')
    writeFileSync(join(workspace, 'createdAt.txt'), '1700000000000')
    writeFileSync(join(workspace, 'index.html'), '<!doctype html><h1>Bakery</h1>')
    writeFileSync(join(workspace, 'home.openui'), '$page = "Home"')
    writeFileSync(
      join(workspace, 'tasks.json'),
      JSON.stringify({ tasks: [{ id: 'home.openui', status: 'DONE' }] }),
    )

    const session = repository.get(id)
    const readiness = repository.readiness(id)

    expect(session.homepageReady).toBe(true)
    expect(session.openuiReady).toBe(true)
    expect(session.taskCount).toBe(1)
    expect(session.done).toBe(1)
    expect(readiness).toMatchObject({
      id,
      homepageReady: true,
      openuiReady: true,
      generated: true,
      taskCount: 1,
      done: 1,
    })
  })

  it('lists sessions without exposing transport-specific websocket state', () => {
    const repository = makeRepository()
    repository.create({ prompt: 'one', userId: 'user-1' })
    repository.create({ prompt: 'two', userId: 'user-2' })

    const sessions = repository.list({ userId: 'user-1' })

    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toMatchObject({
      prompt: 'one',
      owner: { type: 'user', id: 'user-1' },
    })
    expect(sessions[0]).not.toHaveProperty('wsClients')
  })
})
