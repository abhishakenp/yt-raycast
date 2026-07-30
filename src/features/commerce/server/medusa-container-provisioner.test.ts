import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type ProvisionerTestController = {
  execCommands: Array<string>
  infraOk: boolean
  portFree: boolean
  runningInspectStdout: string
  runningInspectThrows: boolean
}

const controller = vi.hoisted<ProvisionerTestController>(() => ({
  // Controls the fake `docker inspect` for the shared Postgres container.
  infraOk: true,
  // Controls the fake `docker inspect` output for findRunningSessionContainer.
  runningInspectStdout: 'true:9100',
  runningInspectThrows: false,
  // Controls whether isPortFree reports the port as free.
  portFree: true,
  // Recorded exec commands for assertions.
  execCommands: [],
}))

// Mock node:child_process exec. Node's `promisify(exec)` uses a custom
// promisify symbol (promisify.custom) to resolve with { stdout, stderr };
// a plain vi.fn lacks it, so generic promisify would resolve with an array.
// We attach promisify.custom so `promisify(exec)` returns our controlled
// promise-returning function.
vi.mock('node:child_process', async () => {
  const { promisify } = await import('node:util')

  function execImpl(
    _cmd: string,
    opts: unknown,
    cb?:
      | ((err: Error | null, stdout: string, stderr: string) => void)
      | undefined,
  ): void {
    // Callback-style path (not used by the provisioner, but kept for safety).
    const callback = typeof opts === 'function' ? opts : cb
    callback?.(null, '', '')
  }

  function custom(cmd: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      controller.execCommands.push(cmd)

      // Shared infra check.
      if (cmd.includes('docker inspect medusa-postgres-1')) {
        if (controller.infraOk) {
          resolve({ stdout: '', stderr: '' })
          return
        }
        reject(new Error('no such container'))
        return
      }

      // findRunningSessionContainer inspect.
      if (
        cmd.startsWith('docker inspect medusa-session-') &&
        cmd.includes('--format')
      ) {
        if (controller.runningInspectThrows) {
          reject(new Error('no such container'))
          return
        }
        resolve({ stdout: controller.runningInspectStdout, stderr: '' })
        return
      }

      // All other docker commands (rm, run, exec psql, logs) succeed.
      resolve({ stdout: '', stderr: '' })
    })
  }

  Object.defineProperty(execImpl, promisify.custom, { value: custom })
  return { exec: execImpl }
})

// Mock node:net so isPortFree resolves based on controller.portFree.
vi.mock('node:net', () => {
  type FakeServer = {
    close: (cb?: () => void) => void
    listen: (opts: unknown) => void
    once: (event: string, cb: () => void) => void
    unref: () => FakeServer
  }

  function createServer(): FakeServer {
    const handlers = new Map<string, (() => void)[]>()
    const server: FakeServer = {
      unref() {
        return server
      },
      once(event, cb) {
        const list = handlers.get(event) ?? []
        list.push(cb)
        handlers.set(event, list)
      },
      close(cb) {
        cb?.()
      },
      listen(_opts) {
        process.nextTick(() => {
          const event = controller.portFree ? 'listening' : 'error'
          handlers.get(event)?.forEach((cb) => cb())
        })
      },
    }
    return server
  }
  return { default: { createServer } }
})

import {
  findRunningSessionContainer,
  provisionSessionMedusaContainer,
} from './medusa-container-provisioner'

const SESSION_ID = 'my-session-123'

function createHealthyFetchMock(): typeof fetch {
  return vi.fn(() => Promise.resolve(Response.json({ ok: true })))
}

describe('provisionSessionMedusaContainer', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    controller.infraOk = true
    controller.portFree = true
    controller.execCommands = []
    process.env.MEDUSA_DB_PASSWORD = 'test-secure-password'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('provisions a container with derived names, port, and urls', async () => {
    const fetchImpl = createHealthyFetchMock()

    const result = await provisionSessionMedusaContainer(SESSION_ID, {
      adminEmail: 'admin@example.com',
      adminPassword: 'hunter2',
      fetch: fetchImpl,
    })

    // shortToken(slugify('my-session-123'), 16) → 'my-session-123'
    expect(result.containerName).toBe('medusa-session-my-session-123')
    // dbToken('my-session-123') → 'my_session_123'
    expect(result.databaseName).toBe('medusa_session_my_session_123')
    expect(result.port).toBe(9100)
    expect(result.backendUrl).toBe('http://localhost:9100')
    expect(result.adminUrl).toBe('http://localhost:9100/app')
    expect(result.storefrontUrl).toBe('http://localhost:9100')
  })

  it('runs the tenant container with the derived database name and port', async () => {
    const fetchImpl = createHealthyFetchMock()

    await provisionSessionMedusaContainer(SESSION_ID, {
      adminEmail: 'admin@example.com',
      adminPassword: 'hunter2',
      fetch: fetchImpl,
    })

    const runCmd = controller.execCommands.find((c) =>
      c.startsWith('docker run -d'),
    )
    expect(runCmd).toBeDefined()
    expect(runCmd).toContain('medusa-session-my-session-123')
    expect(runCmd).toContain('medusa_session_my_session_123')
    expect(runCmd).toContain('-p 9100:9100')
    expect(runCmd).toContain(
      'DATABASE_URL=postgres://medusa:test-secure-password@postgres:5432/medusa_session_my_session_123',
    )
  })

  it('creates the session database before starting the container', async () => {
    const fetchImpl = createHealthyFetchMock()

    await provisionSessionMedusaContainer(SESSION_ID, {
      adminEmail: 'admin@example.com',
      adminPassword: 'hunter2',
      fetch: fetchImpl,
    })

    const dbCmd = controller.execCommands.find((c) =>
      c.includes('CREATE DATABASE medusa_session_my_session_123'),
    )
    expect(dbCmd).toBeDefined()
  })

  it('throws when the shared Postgres container is not running', async () => {
    controller.infraOk = false
    const fetchImpl = createHealthyFetchMock()

    await expect(
      provisionSessionMedusaContainer(SESSION_ID, {
        adminEmail: 'admin@example.com',
        adminPassword: 'hunter2',
        fetch: fetchImpl,
      }),
    ).rejects.toThrow(/Shared Postgres container/)
  })

  it('requires explicit admin credentials before starting the tenant container', async () => {
    const fetchImpl = createHealthyFetchMock()

    await expect(
      provisionSessionMedusaContainer(SESSION_ID, {
        fetch: fetchImpl,
      }),
    ).rejects.toThrow(/Medusa admin email is required/)
    expect(
      controller.execCommands.some((cmd) => cmd.startsWith('docker run -d')),
    ).toBe(false)
  })

  it('seeds the admin user with provided credentials via env flags', async () => {
    const fetchImpl = createHealthyFetchMock()

    await provisionSessionMedusaContainer(SESSION_ID, {
      fetch: fetchImpl,
      adminEmail: 'admin@example.com',
      adminPassword: 'hunter2',
    })

    const runCmd = controller.execCommands.find((c) =>
      c.startsWith('docker run -d'),
    )
    expect(runCmd).toContain("MEDUSA_SEED_ADMIN_EMAIL='admin@example.com'")
    expect(runCmd).toContain("MEDUSA_SEED_ADMIN_PASSWORD='hunter2'")
  })

  it('shell-quotes user credentials and passes configured Razorpay test keys', async () => {
    const fetchImpl = createHealthyFetchMock()

    await provisionSessionMedusaContainer(SESSION_ID, {
      adminEmail: 'admin@example.com',
      adminPassword: "safe'; touch /tmp/owned; echo '",
      fetch: fetchImpl,
      razorpayKeyId: 'rzp_test_ship_fast',
      razorpayKeySecret: "test-secret'quoted",
      razorpayWebhookSecret: 'webhook-test-secret',
    })

    const runCmd = controller.execCommands.find((c) =>
      c.startsWith('docker run -d'),
    )
    expect(runCmd).toContain(
      `MEDUSA_SEED_ADMIN_PASSWORD='safe'"'"'; touch /tmp/owned; echo '"'"''`,
    )
    expect(runCmd).toContain("RAZORPAY_ID='rzp_test_ship_fast'")
    expect(runCmd).toContain(`RAZORPAY_SECRET='test-secret'"'"'quoted'`)
    expect(runCmd).toContain("RAZORPAY_WEBHOOK_SECRET='webhook-test-secret'")
  })
})

describe('findRunningSessionContainer', () => {
  beforeEach(() => {
    controller.runningInspectStdout = 'true:9100'
    controller.runningInspectThrows = false
  })

  it('returns a provision when the container is running with a valid port', async () => {
    const result = await findRunningSessionContainer(SESSION_ID)

    expect(result).toBeDefined()
    expect(result?.containerName).toBe('medusa-session-my-session-123')
    expect(result?.databaseName).toBe('medusa_session_my_session_123')
    expect(result?.port).toBe(9100)
    expect(result?.backendUrl).toBe('http://localhost:9100')
    expect(result?.adminUrl).toBe('http://localhost:9100/app')
  })

  it('uses the real host port when docker inspect returns duplicated IPv4 and IPv6 bindings', async () => {
    controller.runningInspectStdout = 'true:91169116'

    const result = await findRunningSessionContainer(SESSION_ID)

    expect(result).toBeDefined()
    expect(result?.port).toBe(9116)
    expect(result?.backendUrl).toBe('http://localhost:9116')
    expect(result?.adminUrl).toBe('http://localhost:9116/app')
    expect(result?.storefrontUrl).toBe('http://localhost:9116')
  })

  it('returns undefined when the container is not running', async () => {
    controller.runningInspectStdout = 'false:9100'

    const result = await findRunningSessionContainer(SESSION_ID)
    expect(result).toBeUndefined()
  })

  it('returns undefined when docker inspect throws (no container)', async () => {
    controller.runningInspectThrows = true

    const result = await findRunningSessionContainer(SESSION_ID)
    expect(result).toBeUndefined()
  })

  it('returns undefined when the parsed port is not a finite number', async () => {
    // 'true:abc' → Number('abc') = NaN, which is not finite.
    controller.runningInspectStdout = 'true:abc'

    const result = await findRunningSessionContainer(SESSION_ID)
    expect(result).toBeUndefined()
  })
})
