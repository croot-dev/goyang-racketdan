import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [new URL('https://k.kakaocdn.net/**')],
  },
  env: {
    KAKAO_RESTAPI_KEY: process.env.KAKAO_API_RESTAPI_KEY,
    KAKAO_REDIRECT_URI: process.env.KAKAO_API_REDIRECT_URI,
    KAKAO_CLIENT_SECRET: process.env.KAKAO_API_CLIENT_SECRET,
    NAVER_API_URL: process.env.NAVER_API_URL,
    NAVER_CLIENT_ID: process.env.NAVER_API_CLIENT_ID,
    NAVER_SECRET_KEY: process.env.NAVER_API_SECRET_KEY,
    NCP_API_URL: process.env.NCP_API_URL,
    NCP_CLIENT_ID: process.env.NCP_API_CLIENT_ID,
  },
}

export default nextConfig
