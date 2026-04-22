import type { NextConfig } from 'next'

const backend = (process.env.SF_BACKEND_ORIGIN ?? 'http://127.0.0.1:7420').replace(/\/+$/, '')
const backendWsHost = (() => {
  try {
    return new URL(backend).host
  } catch {
    return '127.0.0.1:7420'
  }
})()

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SF_BACKEND_WS_HOST: backendWsHost,
    NEXT_PUBLIC_SF_HOME_WS_RELOAD: process.env.NEXT_PUBLIC_SF_HOME_WS_RELOAD ?? '1',
  },
  async redirects() {
    return [{ source: '/index.html', destination: '/', permanent: true }]
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/js/script.js', destination: `${backend}/js/script.js` },
      { source: '/session/:id', destination: `${backend}/session/:id` },
      { source: '/preview/:path*', destination: `${backend}/preview/:path*` },
      { source: '/llms.txt', destination: `${backend}/llms.txt` },
      { source: '/studio', destination: `${backend}/studio` },
      { source: '/studio/:path*', destination: `${backend}/studio/:path*` },
      { source: '/static/:path*', destination: `${backend}/static/:path*` },
    ]
  },
}

export default nextConfig
