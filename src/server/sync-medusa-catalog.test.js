import { mkdtempSync, rmSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { syncProductsToMedusa } from './sync-medusa-catalog.js'

let workspace = null

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve(server.address().port)
    })
  })
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
}

describe('syncProductsToMedusa', () => {
  afterEach(() => {
    if (workspace) rmSync(workspace, { recursive: true, force: true })
    workspace = null
  })

  it('creates products with major-unit prices and product currency', async () => {
    workspace = mkdtempSync(join(tmpdir(), 'ship-fast-medusa-sync-'))
    const created = []
    const server = createServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        res.setHeader('content-type', 'application/json')
        if (req.url === '/auth/user/emailpass' && req.method === 'POST') {
          res.end(JSON.stringify({ token: 'tok_test' }))
          return
        }
        if (req.url.startsWith('/admin/products?') && req.method === 'GET') {
          res.end(JSON.stringify({ products: [] }))
          return
        }
        if (req.url.startsWith('/admin/regions') && req.method === 'GET') {
          res.end(JSON.stringify({ regions: [{ currency_code: 'usd' }] }))
          return
        }
        if (req.url === '/admin/products' && req.method === 'POST') {
          const payload = JSON.parse(body || '{}')
          created.push(payload)
          res.end(
            JSON.stringify({
              product: { ...payload, variants: [{ id: `variant_${created.length}` }] },
            }),
          )
          return
        }
        res.statusCode = 404
        res.end(JSON.stringify({ error: 'not found' }))
      })
    })

    const port = await listen(server)
    try {
      const result = await syncProductsToMedusa(
        [
          { id: 'glow-serum', title: 'Glow Serum', handle: 'glow-serum', price: 29.99 },
          {
            id: 'repair-balm',
            title: 'Repair Balm',
            handle: 'repair-balm',
            price: 1499,
            currency: 'INR',
          },
        ],
        {
          backendUrl: `http://127.0.0.1:${port}`,
          email: 'admin@example.com',
          password: 'password',
          workspace,
        },
      )

      expect(result.synced).toBe(2)
      expect(result.errors).toEqual([])
      expect(created[0].variants[0].prices).toEqual([{ currency_code: 'usd', amount: 2999 }])
      expect(created[1].variants[0].prices).toEqual([{ currency_code: 'inr', amount: 149900 }])
      await expect(readFile(join(workspace, 'medusa-variants.json'), 'utf8')).resolves.toContain(
        'variant_2',
      )
    } finally {
      await close(server)
    }
  })
})
