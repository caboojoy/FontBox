/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
  // 자체 제작 웹폰트: 다른 사이트의 @font-face 에서도 불러올 수 있게 허용
  async headers() {
    return [{
      source: '/webfonts/:file*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Cache-Control', value: 'public, max-age=604800' },
      ],
    }]
  },
}

module.exports = nextConfig

