import { afterEach, describe, expect, it } from 'vitest'
import { createServer } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import WebSocket from 'ws'

import { createSession, initSessionDir, makeSessionState } from './sessions.js'
import { setupWebSocket } from './websocket.js'

let tmpRoot = null
let httpServer = null
let wss = null
let clients = []

const listen = (server) =>
  new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, () => {
      server.off('error', reject)
      resolve(server.address().port)
    })
  })

const waitForOpen = (ws) =>
  new Promise((resolve, reject) => {
    ws.once('open', resolve)
    ws.once('error', reject)
  })

const waitForClose = (ws) =>
  new Promise((resolve) => {
    ws.once('close', (code, reason) => resolve({ code, reason: reason.toString() }))
  })

const withTimeout = (promise, ms = 500) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))])

const closeServer = async () => {
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.terminate()
  }
  if (wss) {
    for (const ws of wss.clients) ws.terminate()
  }
  clients = []
  await withTimeout(new Promise((resolve) => (wss ? wss.close(resolve) : resolve())))
  await withTimeout(
    new Promise((resolve) => (httpServer?.listening ? httpServer.close(resolve) : resolve())),
  )
  wss = null
  httpServer = null
}

afterEach(async () => {
  await closeServer()
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

describe('setupWebSocket', () => {
  it('accepts concurrent clients across sessions and broadcasts only to the matching session', async () => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-ws-sessions-'))
    initSessionDir(tmpRoot)

    const sessionA = createSession(tmpRoot, 'session A prompt', 'user-a')
    const sessionB = createSession(tmpRoot, 'session B prompt', 'user-b')
    makeSessionState(sessionA).setTasks([{ id: 'a-task', title: 'A task', status: 'DONE' }])
    makeSessionState(sessionB).setTasks([{ id: 'b-task', title: 'B task', status: 'DONE' }])

    httpServer = createServer()
    wss = setupWebSocket(httpServer)
    const port = await listen(httpServer)

    const messages = new Map()
    const openClient = async (sessionId, index) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}?session=${sessionId}`)
      clients.push(ws)
      const key = `${sessionId}:${index}`
      messages.set(key, [])
      ws.on('message', (data) => messages.get(key).push(JSON.parse(data.toString())))
      await waitForOpen(ws)
      return { ws, key }
    }

    const sessionAClients = await Promise.all(
      Array.from({ length: 8 }, (_, index) => openClient(sessionA.id, index)),
    )
    const sessionBClients = await Promise.all(
      Array.from({ length: 6 }, (_, index) => openClient(sessionB.id, index)),
    )

    await new Promise((resolve) => setTimeout(resolve, 50))

    for (const { key } of sessionAClients) {
      expect(messages.get(key).some((msg) => msg.type === 'prompt' && msg.text === 'session A prompt')).toBe(true)
      expect(messages.get(key).some((msg) => msg.type === 'tasks_loaded' && msg.tasks?.[0]?.id === 'a-task')).toBe(true)
      expect(messages.get(key).some((msg) => msg.type === 'tasks_loaded' && msg.tasks?.[0]?.id === 'b-task')).toBe(false)
    }
    for (const { key } of sessionBClients) {
      expect(messages.get(key).some((msg) => msg.type === 'prompt' && msg.text === 'session B prompt')).toBe(true)
      expect(messages.get(key).some((msg) => msg.type === 'tasks_loaded' && msg.tasks?.[0]?.id === 'b-task')).toBe(true)
      expect(messages.get(key).some((msg) => msg.type === 'tasks_loaded' && msg.tasks?.[0]?.id === 'a-task')).toBe(false)
    }

    makeSessionState(sessionA).broadcast({ type: 'status', message: 'A only', phase: 'verify' })
    await new Promise((resolve) => setTimeout(resolve, 50))

    for (const { key } of sessionAClients) {
      expect(messages.get(key).some((msg) => msg.type === 'status' && msg.message === 'A only')).toBe(true)
    }
    for (const { key } of sessionBClients) {
      expect(messages.get(key).some((msg) => msg.type === 'status' && msg.message === 'A only')).toBe(false)
    }
  })

  it('closes invalid session connections with an explicit application close code', async () => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-ws-sessions-'))
    initSessionDir(tmpRoot)
    httpServer = createServer()
    wss = setupWebSocket(httpServer)
    const port = await listen(httpServer)

    const ws = new WebSocket(`ws://127.0.0.1:${port}?session=missing-session`)
    clients.push(ws)
    await waitForOpen(ws)
    await expect(waitForClose(ws)).resolves.toMatchObject({ code: 4001, reason: 'Invalid session' })
  })
})
