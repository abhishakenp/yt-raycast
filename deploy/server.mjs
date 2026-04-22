import { createServer } from 'node:http'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import next from 'next'
import httpProxy from 'http-proxy'

const dev = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT ?? '3000', 10)
const backendOrigin = (process.env.SF_BACKEND_ORIGIN ?? 'http://localhost:7420').replace(/\/+$/, '')

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const app = next({ dev, dir: repoRoot })
const handle = app.getRequestHandler()

const proxy = httpProxy.createProxyServer({ target: backendOrigin })
proxy.on('error', (err) => console.error('[ws-proxy] error:', err.message))

await app.prepare()

const server = createServer((req, res) => handle(req, res))

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head)
})

server.listen(port, '0.0.0.0', () => {
  console.log(`> Next.js ready on http://0.0.0.0:${port}`)
})
