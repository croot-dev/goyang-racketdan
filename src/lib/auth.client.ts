// 클라이언트 사이드 인증 헬퍼 함수
// JWT 토큰은 HttpOnly 쿠키로 관리되며, CSRF 토큰만 localStorage 사용

import { Member } from '@/domains/member'
import 'client-only'

/**
 * CSRF 토큰 가져오기
 */
export function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('csrf-token')
}

/**
 * CSRF 토큰 저장
 */
export function setCsrfToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('csrf-token', token)
}

/**
 * CSRF 토큰 제거
 */
export function clearCsrfToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('csrf-token')
}

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
 * 토큰 갱신 시도
 */
async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    return response.ok
  } catch (error) {
    console.error('Token refresh failed:', error)
    return false
  }
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

/**
 * 로그아웃
 */
export async function logout() {
  if (typeof window === 'undefined') return

  try {
    // 서버에 로그아웃 요청 (쿠키 삭제)
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Logout error:', error)
  }

  // 인증 관련 데이터 제거
  clearCsrfToken()
  clearAuthFlag()
  localStorage.removeItem('kakaoUserTemp')

  window.location.href = '/'
}

/**
 * 인증된 fetch 요청
 * 쿠키에 있는 JWT 토큰이 자동으로 포함됨
 * CSRF 토큰을 헤더에 추가
 * 401 에러 시 자동으로 토큰 갱신 시도
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers)

  // POST, PUT, DELETE 등 상태 변경 요청에 CSRF 토큰 추가
  if (
    options.method &&
    !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())
  ) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken)
    }
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // 쿠키 포함
  })

  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401) {
    const refreshed = await refreshToken()

    if (refreshed) {
      // 토큰 갱신 성공 시 원래 요청 재시도
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      })

      // 재시도 후에도 401이면 로그아웃
      if (response.status === 401) {
        await logout()
      }
    } else {
      // 토큰 갱신 실패 시 로그아웃 처리
      await logout()
    }
  }

  return response
}
