/**
 * CSRF 토큰 관리
 * Double Submit Cookie 패턴 사용
 */

import 'server-only'
import { randomBytes } from 'crypto'

/**
 * CSRF 토큰 생성
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * CSRF 토큰 검증
 * @param headerToken - 요청 헤더의 토큰
 * @param cookieToken - 쿠키의 토큰
 */
export function verifyCsrfToken(
  headerToken: string | null,
  cookieToken: string | null
): boolean {
  if (!headerToken || !cookieToken) {
    return false
  }

  // Timing attack 방지를 위한 constant-time 비교
  if (headerToken.length !== cookieToken.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < headerToken.length; i++) {
    result |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i)
  }

  return result === 0
}

/**
 * CSRF 토큰 쿠키 옵션
 */
export const CSRF_COOKIE_OPTIONS = {
  httpOnly: false, // JavaScript에서 읽을 수 있어야 함
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24, // 24시간
  path: '/',
}

/**
 * CSRF 토큰 쿠키 이름
 */
export const CSRF_COOKIE_NAME = 'csrf-token'

/**
 * CSRF 토큰 헤더 이름
 */
export const CSRF_HEADER_NAME = 'x-csrf-token'
