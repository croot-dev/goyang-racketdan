import { refreshToken } from '@/hooks/useAuth'
import { clearAuthFlag } from './auth.client'

/**
 * 인증된 fetch 요청
 * 쿠키에 있는 JWT 토큰이 자동으로 포함됨
 * 401 에러 시 자동으로 토큰 갱신 시도
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let response = await fetch(url, {
    ...options,
    credentials: 'include',
  })

  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401) {
    const refreshed = await refreshToken()

    if (refreshed) {
      // 토큰 갱신 성공 시 원래 요청 재시도
      response = await fetch(url, {
        ...options,
        credentials: 'include',
      })

      // 재시도 후에도 401이면 플래그 제거
      if (response.status === 401) {
        clearAuthFlag()
      }
    } else {
      // 토큰 갱신 실패 시 플래그 제거
      clearAuthFlag()
    }
  }

  return response
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: unknown) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
}

export async function request<ReturnType>(
  url: string,
  customOptions?: RequestOptions
): Promise<ReturnType> {
  const options = Object.assign(
    {
      method: 'GET',
      body: null,
      auth: true,
      headers: {},
    },
    customOptions
  )

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const fetchFn = options.auth ? authenticatedFetch : fetch

  const response = await fetchFn(url, {
    method: options.method,
    headers: finalHeaders,
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  let data: ReturnType | undefined
  try {
    data = await response.json()
  } catch {
    data = undefined
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error ?? `HTTP ${response.status}`,
      response.status,
      data
    )
  }

  return data as ReturnType
}
