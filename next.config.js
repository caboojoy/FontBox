/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Node.js 전용 패키지 — webpack 번들링 제외 (서버에서 직접 require)
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
  },
}

module.exports = nextConfig
