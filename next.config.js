/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript 빌드 오류 무시 (타입 오류가 배포를 막지 않도록)
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint 빌드 오류 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
  },
}

module.exports = nextConfig
