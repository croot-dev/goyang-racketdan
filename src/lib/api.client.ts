/**
 * API 요청 유틸리티
 * CSRF 토큰을 자동으로 포함하는 fetch 래퍼
 */

import 'client-only'

const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * CSRF 토큰이 포함된 fetch 래퍼
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers)

  // POST, PUT, DELETE 등 상태 변경 요청에 CSRF 토큰 추가
  if (
    options.method &&
    !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())
  ) {
    const csrfToken =
      typeof window !== 'undefined' ? localStorage.getItem('csrf-token') : null

    if (csrfToken) {
      headers.set(CSRF_HEADER_NAME, csrfToken)
    }
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // 쿠키 포함
  })
}

/**
 * JSON 응답을 반환하는 편의 메서드
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch(url, options)

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}
