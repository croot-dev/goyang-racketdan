// 클라이언트 사이드 인증 헬퍼 함수
// JWT 토큰은 HttpOnly 쿠키로 관리 (SameSite: lax로 CSRF 보호)

import { Member } from '@/domains/member'
import { refreshToken } from '@/lib/api.client'
import 'client-only'

const AUTH_FLAG_KEY = 'has-auth-session'

/**
 * 인증 세션 플래그 설정 (로그인 성공 시 호출)
 */
export function setAuthFlag() {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_FLAG_KEY, 'true')
}

/**
 * 인증 세션 플래그 확인
 */
export function hasAuthFlag(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(AUTH_FLAG_KEY) === 'true'
}

/**
 * 인증 세션 플래그 제거
 */
export function clearAuthFlag() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_FLAG_KEY)
}

/**
 * 서버에서 현재 사용자 정보 가져오기
 * HttpOnly 쿠키의 JWT를 사용하여 인증 상태 확인
 * 401 에러 시 인증 플래그가 있을 때만 토큰 갱신 시도
 */
export async function getUser(): Promise<Member | null> {
  if (typeof window === 'undefined') return null

  // 인증 플래그가 없으면 비로그인 상태로 간주 (불필요한 API 호출 방지)
  if (!hasAuthFlag()) {
    return null
  }

  try {
    let response = await fetch('/api/auth/me', {
      credentials: 'include', // HttpOnly 쿠키 포함
    })

    // 401 에러 시 토큰 갱신 시도
    if (response.status === 401) {
      const refreshed = await refreshToken()

      if (refreshed) {
        // 토큰 갱신 성공 시 재시도
        response = await fetch('/api/auth/me', {
          credentials: 'include',
        })
      } else {
        // 토큰 갱신 실패 = 세션 만료, 플래그 제거
        clearAuthFlag()
        return null
      }
    }

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
}
