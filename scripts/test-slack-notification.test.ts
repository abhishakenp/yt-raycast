import { spawn } from 'node:child_process'
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'

const scriptPath = new URL('./test-slack-notification.mjs', import.meta.url)

type RunResult = {
  code: number | null
  stderr: string
  stdout: string
}

function runSlackScript(env: Record<string, string | undefined>) {
  return new Promise<RunResult>((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath.pathname], {
      env: {
        ...process.env,
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => resolve({ code, stderr, stdout }))
  })
}

async function withWebhookServer(
  handler: (req: IncomingMessage, res: ServerResponse, body: string) => void,
) {
  const requests: Array<{ body: string; headers: IncomingMessage['headers'] }> =
    []
  const server = createServer((req, res) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      requests.push({ body, headers: req.headers })
      handler(req, res, body)
    })
  })
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('test webhook server did not bind to a TCP port')
  }
  return {
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()))
      }),
    requests,
    url: `http://127.0.0.1:${address.port}/slack-webhook`,
  }
}

describe('test-slack-notification script', () => {
  const servers: Array<{ close: () => Promise<void> }> = []

  afterEach(async () => {
    while (servers.length) {
      await servers.pop()?.close()
    }
  })

  it('exits nonzero and does not send a request when SLACK_WEBHOOK_URL is missing', async () => {
    const result = await runSlackScript({ SLACK_WEBHOOK_URL: '' })

    expect(result.code).toBe(1)
    expect(result.stderr).toContain('SLACK_WEBHOOK_URL is required')
    expect(result.stdout).toBe('')
  })

  it('posts the operational test notification as Slack JSON to the configured webhook', async () => {
    const server = await withWebhookServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'text/plain' })
      res.end('ok')
    })
    servers.push(server)

    const result = await runSlackScript({ SLACK_WEBHOOK_URL: server.url })

    expect(result.code).toBe(0)
    expect(server.requests).toHaveLength(1)
    expect(server.requests[0].headers['content-type']).toBe('application/json')
    expect(JSON.parse(server.requests[0].body)).toEqual({
      text: [
        'Ship Fast operational event',
        '',
        'event=test_notification',
        'session=manual_test',
        'message=Test notification from standalone script',
      ].join('\n'),
    })
    expect(result.stdout).toContain('"ok": true')
    expect(result.stdout).toContain('"status": 200')
  })

  it('exits nonzero when Slack rejects the notification', async () => {
    const server = await withWebhookServer((_req, res) => {
      res.writeHead(503, {
        'content-type': 'text/plain',
        'status-text': 'Service Unavailable',
      })
      res.end('unavailable')
    })
    servers.push(server)

    const result = await runSlackScript({ SLACK_WEBHOOK_URL: server.url })

    expect(server.requests).toHaveLength(1)
    expect(result.code).not.toBe(0)
    expect(result.stdout).toContain('"ok": false')
    expect(result.stdout).toContain('"status": 503')
  })

  it('exits nonzero when the webhook request cannot be sent', async () => {
    const result = await runSlackScript({
      SLACK_WEBHOOK_URL: 'http://127.0.0.1:1/slack-webhook',
    })

    expect(result.code).not.toBe(0)
    expect(result.stdout).toContain('"ok": false')
    expect(result.stdout).toContain('"error"')
  })
})
