import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [new URL('https://k.kakaocdn.net/**')],
  },
}

export default nextConfig
