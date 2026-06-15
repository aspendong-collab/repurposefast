import { securityHeaders } from './config/security-headers.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // ── Canonical Domain Redirects ──
  // Non-www → www 301 permanent (consolidates all indexing signals)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'saveik.com' }],
        destination: 'https://www.saveik.com/:path*',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
