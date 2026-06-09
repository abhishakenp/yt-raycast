import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildFallbackSiteSpec } from '../spec/defaults.js'
import {
  createSession,
  initSessionDir,
  readAnonOwnerSecret,
  setMedusaConfig,
  setSanityConfig,
} from '../server/sessions.js'
import {
  provisionStartMedusa,
  provisionStartSanity,
  readStartCmsState,
} from './session-cms.js'

let tmpRoot = null

function createCmsSession() {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-start-cms-'))
  initSessionDir(tmpRoot)
  const session = createSession(tmpRoot, 'A boutique ecommerce site for Atlas Goods', null)
  mkdirSync(session.workspace, { recursive: true })
  const siteSpec = buildFallbackSiteSpec({
    prompt: session.prompt,
    ctx: {
      project_name: 'Atlas Goods',
      site_type: 'ecommerce',
      tagline: 'Useful desk objects for focused teams',
    },
    siteType: 'ecommerce',
  })
  siteSpec.brand = 'Atlas Goods'
  siteSpec.slug = 'atlas-goods'
  siteSpec.pages = [
    {
      id: 'home',
      renderBlueprint: {
        bodyHtml:
          '<article><h3>Launch Notebook</h3><p>A notebook for launch planning.</p><span>$24</span><img src="/notebook.jpg"></article>',
      },
    },
  ]
  writeFileSync(join(session.workspace, 'site-spec.json'), JSON.stringify(siteSpec, null, 2))
  session.siteSpecReady = true
  return session
}

afterEach(() => {
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

describe('Start CMS adapter', () => {
  it('reports existing Sanity and Medusa state', async () => {
    const session = createCmsSession()
    await setSanityConfig(session.id, {
      projectId: 'abc123',
      dataset: 'production',
      apiVersion: '2024-01-01',
      provisionedAt: '2026-06-08T10:00:00.000Z',
      token: 'hidden',
    })
    await setMedusaConfig(session.id, {
      adminBaseUrl: 'http://127.0.0.1:9000',
      adminEmail: 'admin@example.com',
      adminPassword: 'secret',
      productsSyncedAt: '2026-06-08T10:00:00.000Z',
    })

    const state = readStartCmsState(session.id, { sessionsDir: tmpRoot })

    expect(state).toMatchObject({
      sessionId: session.id,
      ownerSecretRequired: true,
      authenticatedProvisionRequired: false,
      sanity: {
        configured: true,
        config: {
          projectId: 'abc123',
          dataset: 'production',
          apiVersion: '2024-01-01',
          provisionedAt: '2026-06-08T10:00:00.000Z',
        },
      },
      medusa: {
        configured: true,
      },
    })
    expect(state.sanity.config.token).toBeUndefined()
  })

  it('protects anonymous Sanity provisioning and surfaces not-configured state', async () => {
    const session = createCmsSession()

    await expect(
      provisionStartSanity(session.id, {
        sessionsDir: tmpRoot,
        ownerSecret: 'wrong',
      }),
    ).rejects.toThrow('Anonymous owner secret is required')

    await expect(
      provisionStartSanity(session.id, {
        sessionsDir: tmpRoot,
        ownerSecret: readAnonOwnerSecret(session.workspace),
        isSanityProvisionable: () => false,
      }),
    ).rejects.toThrow('Sanity provisioning not configured')
  })

  it('provisions Sanity through injected legacy service functions', async () => {
    const session = createCmsSession()
    const state = await provisionStartSanity(session.id, {
      sessionsDir: tmpRoot,
      ownerSecret: readAnonOwnerSecret(session.workspace),
      isSanityProvisionable: () => true,
      provisionSanityForSession: async () => ({
        projectId: 'new123',
        dataset: 'production',
        apiVersion: '2024-01-01',
        provisionedAt: '2026-06-08T11:00:00.000Z',
      }),
    })

    expect(state).toMatchObject({
      success: true,
      sanity: { configured: true },
      config: {
        projectId: 'new123',
        dataset: 'production',
      },
    })
  })

  it('provisions Medusa and syncs extracted products when available', async () => {
    const session = createCmsSession()
    let syncedProducts = null
    const state = await provisionStartMedusa(session.id, {
      sessionsDir: tmpRoot,
      ownerSecret: readAnonOwnerSecret(session.workspace),
      isMedusaProvisionable: () => true,
      provisionMedusaForSession: async () => ({
        adminBaseUrl: 'http://127.0.0.1:9000',
        adminEmail: 'admin@example.com',
        adminPassword: 'secret',
      }),
      syncProductsToMedusa: async (products) => {
        syncedProducts = products
        return { synced: products.length, errors: [] }
      },
    })

    expect(syncedProducts?.map((product) => product.title)).toContain('Launch Notebook')
    expect(state).toMatchObject({
      success: true,
      medusa: { configured: true },
      config: {
        adminBaseUrl: 'http://127.0.0.1:9000',
        productsSyncedCount: 1,
      },
      sync: { synced: 1, errors: [] },
    })
  })

  it('returns already-provisioned Medusa state and syncs unsynced tenants', async () => {
    const session = createCmsSession()
    await setMedusaConfig(session.id, {
      adminBaseUrl: 'http://127.0.0.1:9000',
      adminEmail: 'admin@example.com',
      adminPassword: 'secret',
    })

    const state = await provisionStartMedusa(session.id, {
      sessionsDir: tmpRoot,
      ownerSecret: readAnonOwnerSecret(session.workspace),
      syncProductsToMedusa: async (products) => ({ synced: products.length, errors: [] }),
    })

    expect(state).toMatchObject({
      success: true,
      alreadyProvisioned: true,
      sync: { synced: 1, errors: [] },
      config: { productsSyncedCount: 1 },
    })
  })

  it('allows user-owned CMS provisioning for the matching authenticated user', async () => {
    const session = createCmsSession()
    session.userId = 'user_clerk_1'
    writeFileSync(join(session.workspace, 'user.txt'), 'user_clerk_1')

    expect(readStartCmsState(session.id, { sessionsDir: tmpRoot })).toMatchObject({
      ownerSecretRequired: false,
      authenticationRequired: true,
      authenticatedProvisionRequired: false,
    })
    await expect(
      provisionStartSanity(session.id, {
        sessionsDir: tmpRoot,
        authUser: { uid: 'user_clerk_2' },
      }),
    ).rejects.toThrow('belongs to another user')

    const state = await provisionStartSanity(session.id, {
      sessionsDir: tmpRoot,
      authUser: { uid: 'user_clerk_1' },
      isSanityProvisionable: () => true,
      provisionSanityForSession: async () => ({
        projectId: 'new123',
        dataset: 'production',
        apiVersion: '2024-01-01',
        provisionedAt: '2026-06-08T11:00:00.000Z',
      }),
    })

    expect(state).toMatchObject({
      success: true,
      sanity: { configured: true },
    })
  })
})
