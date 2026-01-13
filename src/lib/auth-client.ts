// 클라이언트 사이드 인증 헬퍼 함수
// JWT 토큰은 HttpOnly 쿠키로 관리되며, CSRF 토큰만 localStorage 사용

export interface User {
  id: string
  email?: string
  name?: string
  nickname?: string
  ntrp: string
  phone?: string
}

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

/**
 * 서버에서 현재 사용자 정보 가져오기
 * HttpOnly 쿠키의 JWT를 사용하여 인증 상태 확인
 */
export async function getUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null

  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include', // HttpOnly 쿠키 포함
    })

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

  // CSRF 토큰 및 임시 데이터 제거
  clearCsrfToken()
  localStorage.removeItem('kakaoUserTemp')

  window.location.href = '/'
}

/**
 * 인증된 fetch 요청
 * 쿠키에 있는 JWT 토큰이 자동으로 포함됨
 * CSRF 토큰을 헤더에 추가
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

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // 쿠키 포함
  })

  // 401 에러 시 로그아웃 처리
  if (response.status === 401) {
    await logout()
  }

  return response
}
