import { afterEach, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  buildGenerationCostPayload,
  buildGenerationMetrics,
  finalizeGenerationMonitoring,
  sendFollowUpNotification,
} from './generation-monitoring.js'

let tmpRoot = null
const originalFetch = globalThis.fetch

afterEach(() => {
  vi.restoreAllMocks()
  globalThis.fetch = originalFetch
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

function makeSession(patch = {}) {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-generation-monitoring-'))
  const workspace = join(tmpRoot, 'session-a')
  mkdirSync(workspace, { recursive: true })
  return {
    id: 'session-a',
    workspace,
    prompt: 'a landing page for a small bakery',
    userId: 'user-a',
    elapsed: 1.2,
    cost: 0.25,
    ...patch,
  }
}

describe('generation monitoring', () => {
  it('builds a per-generation cost breakdown from session metrics', () => {
    const session = makeSession()

    const metrics = buildGenerationMetrics({
      session,
      clientIp: '1.2.3.4',
      user: { uid: 'user-a', email: 'u@example.com' },
      startedAt: 1_700_000_000_000,
      completedAt: 1_700_000_001_200,
    })

    expect(metrics.sessionId).toBe('session-a')
    expect(metrics.elapsedSeconds).toBe(1.2)
    expect(metrics.engineElapsedSeconds).toBe(1.2)
    expect(metrics.cost.totalUsd).toBe(0.25)
    expect(metrics.cost.breakdown[0]).toMatchObject({
      provider: 'openui',
      model: 'genui-orchestrator',
      costUsd: 0.25,
    })
  })

  it('uses server-measured elapsed time instead of stale engine elapsed', () => {
    const session = makeSession({ elapsed: 0.3 })

    const metrics = buildGenerationMetrics({
      session,
      startedAt: 1_700_000_000_000,
      completedAt: 1_700_000_002_400,
      engineElapsedSeconds: 0.8,
    })

    expect(metrics.elapsedSeconds).toBe(2.4)
    expect(metrics.engineElapsedSeconds).toBe(0.8)
  })

  it('sends follow-up notifications to Slack and Telegram webhooks', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }))
    globalThis.fetch = fetchMock

    const result = await sendFollowUpNotification('Ship Fast follow-up', {
      SHIP_FAST_SLACK_WEBHOOK_URL: 'https://example.test/slack',
      SHIP_FAST_TELEGRAM_BOT_TOKEN: 'telegram-token',
      SHIP_FAST_TELEGRAM_CHAT_ID: 'chat-123',
      SHIP_FAST_TELEGRAM_API_BASE: 'https://telegram.example.test/',
    })

    expect(result.every((entry) => entry.status === 'fulfilled')).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://example.test/slack',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'Ship Fast follow-up' }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://telegram.example.test/bottelegram-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          chat_id: 'chat-123',
          text: 'Ship Fast follow-up',
          disable_web_page_preview: true,
        }),
      }),
    )
  })

  it('persists metrics, appends usage, and sends threshold alert once', async () => {
    const session = makeSession({ cost: 60 })
    writeFileSync(join(session.workspace, 'elapsed.txt'), '2.4')
    const fetchMock = vi.fn(async () => ({ ok: true }))
    globalThis.fetch = fetchMock

    const first = await finalizeGenerationMonitoring({
      sessionsDir: tmpRoot,
      session,
      clientIp: '1.2.3.4',
      user: { uid: 'user-a', email: 'u@example.com' },
      startedAt: Date.UTC(2026, 5, 1),
      completedAt: Date.UTC(2026, 5, 1, 0, 0, 2),
      env: {
        SHIP_FAST_SLACK_WEBHOOK_URL: 'https://example.test/slack',
        GENERATION_COST_ALERT_USD: '100',
      },
    })

    const second = await finalizeGenerationMonitoring({
      sessionsDir: tmpRoot,
      session,
      clientIp: '1.2.3.4',
      user: { uid: 'user-a', email: 'u@example.com' },
      startedAt: Date.UTC(2026, 5, 2),
      completedAt: Date.UTC(2026, 5, 2, 0, 0, 2),
      env: {
        SHIP_FAST_SLACK_WEBHOOK_URL: 'https://example.test/slack',
        GENERATION_COST_ALERT_USD: '100',
      },
    })

    const metricsPath = join(session.workspace, 'generation-metrics.json')
    expect(existsSync(metricsPath)).toBe(true)
    expect(JSON.parse(readFileSync(metricsPath, 'utf8')).cost.totalUsd).toBe(60)
    expect(readFileSync(join(tmpRoot, 'generation-usage.jsonl'), 'utf8').trim().split('\n')).toHaveLength(2)
    expect(first.monthlyTotal).toBe(60)
    expect(second.monthlyTotal).toBe(120)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('builds a monthly cost summary from appended usage without failing on corrupt lines', () => {
    const session = makeSession()
    writeFileSync(
      join(tmpRoot, 'generation-usage.jsonl'),
      [
        JSON.stringify({
          sessionId: 's-1',
          status: 'done',
          completedAt: '2026-06-01T00:00:00.000Z',
          elapsedSeconds: 4.2,
          cost: { totalUsd: 1.5 },
          userId: 'user-a',
        }),
        '{not json',
        JSON.stringify({
          sessionId: 's-2',
          status: 'failed',
          completedAt: '2026-06-02T00:00:00.000Z',
          elapsedSeconds: 1.1,
          costUsd: 0.5,
          userId: null,
        }),
        JSON.stringify({
          sessionId: 's-old',
          status: 'done',
          completedAt: '2026-05-31T23:59:59.000Z',
          cost: { totalUsd: 99 },
        }),
      ].join('\n'),
    )
    writeFileSync(join(tmpRoot, 'generation-cost-alerts.json'), JSON.stringify({ '2026-06': true }))

    const payload = buildGenerationCostPayload({
      sessionsDir: tmpRoot,
      monthKey: '2026-06',
      sampleSize: 1,
      env: { GENERATION_COST_ALERT_USD: '3' },
    })

    expect(payload.alert).toMatchObject({
      thresholdUsd: 3,
      sentForMonth: true,
      remainingUsd: 1,
    })
    expect(payload.usage).toMatchObject({
      count: 2,
      totalUsd: 2,
      averageUsd: 1,
      statusCounts: { done: 1, failed: 1 },
    })
    expect(payload.usage.recent).toEqual([
      {
        sessionId: 's-2',
        status: 'failed',
        completedAt: '2026-06-02T00:00:00.000Z',
        elapsedSeconds: 1.1,
        costUsd: 0.5,
        userId: null,
      },
    ])
    expect(existsSync(session.workspace)).toBe(true)
  })
})
