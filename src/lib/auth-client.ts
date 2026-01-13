// 클라이언트 사이드 인증 헬퍼 함수

export interface User {
  id: string
  email?: string
  name?: string
}

/**
 * localStorage에서 액세스 토큰 가져오기
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

/**
 * localStorage에서 리프레시 토큰 가져오기
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

/**
 * 토큰 저장
 */
export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

/**
 * 토큰 제거
 */
export function clearTokens() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

/**
 * 로그인 여부 확인
 */
export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  const accessToken = getAccessToken()
  return !!accessToken
}

/**
 * localStorage에서 사용자 정보 가져오기
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null

  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

/**
 * 사용자 정보 저장
 */
export function setUser(user: User) {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

/**
 * 로그아웃
 */
export function logout() {
  if (typeof window === 'undefined') return
  clearTokens()
  localStorage.removeItem('user')
  localStorage.removeItem('kakaoUserTemp')
  window.location.href = '/'
}

/**
 * 인증된 fetch 요청
 * 자동으로 Authorization 헤더에 토큰 추가
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken()

  const headers = {
    ...options.headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // 401 에러 시 리프레시 토큰으로 재시도
  if (response.status === 401) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      if (refreshed) {
        // 새 토큰으로 재시도
        const newAccessToken = getAccessToken()
        const retryHeaders = {
          ...options.headers,
          ...(newAccessToken
            ? { Authorization: `Bearer ${newAccessToken}` }
            : {}),
        }

        return fetch(url, {
          ...options,
          headers: retryHeaders,
        })
      }
    }

    // 리프레시 실패 시 로그아웃
    logout()
  }

  return response
}

/**
 * 액세스 토큰 갱신
 */
async function refreshAccessToken(refreshToken: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (response.ok) {
      const { accessToken, refreshToken: newRefreshToken } =
        await response.json()
      setTokens(accessToken, newRefreshToken)
      return true
    }

    return false
  } catch (error) {
    console.error('Token refresh failed:', error)
    return false
  }
}
