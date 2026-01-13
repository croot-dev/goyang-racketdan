import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// JWT 시크릿 키 (환경 변수에서 가져오기)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

const ACCESS_TOKEN_EXPIRY = '15m' // 15분
const REFRESH_TOKEN_EXPIRY = '7d' // 7일

export interface TokenPayload {
  userId: string
  email?: string
  name?: string
}

/**
 * Access Token 생성
 */
export async function createAccessToken(
  payload: TokenPayload
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

/**
 * Refresh Token 생성
 */
export async function createRefreshToken(
  payload: TokenPayload
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET)
}

/**
 * Token 검증
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // payload에서 필요한 필드만 추출하여 TokenPayload로 변환
    if (payload && typeof payload.userId === 'string') {
      return {
        userId: payload.userId,
        email: payload.email as string | undefined,
        name: payload.name as string | undefined,
      }
    }

    return null
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Request에서 Access Token 가져오기
 */
export function getAccessTokenFromRequest(request: Request): string | null {
  // Authorization 헤더에서 Bearer token 추출
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 쿠키에서 토큰 가져오기 (fallback)
  const cookieToken = request.headers.get('cookie')
  if (cookieToken) {
    const match = cookieToken.match(/accessToken=([^;]+)/)
    if (match) {
      return match[1]
    }
  }

  return null
}

/**
 * Request에서 인증된 사용자 정보 가져오기
 */
export async function getAuthUser(
  request: Request
): Promise<TokenPayload | null> {
  const token = getAccessTokenFromRequest(request)
  if (!token) {
    return null
  }

  return await verifyToken(token)
}

/**
 * 쿠키에 토큰 설정
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies()

  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15분
    path: '/',
  })

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: '/',
  })
}

/**
 * 쿠키에서 토큰 제거
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}

/**
 * Refresh Token으로 새로운 Access Token 발급
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  const payload = await verifyToken(refreshToken)
  if (!payload) {
    return null
  }

  return await createAccessToken(payload)
}

/**
 * NextRequest에서 인증된 사용자 정보 가져오기
 */
export async function getAuthUserFromNextRequest(
  request: Request
): Promise<TokenPayload | null> {
  // 쿠키에서 accessToken 가져오기
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    return null
  }

  const match = cookieHeader.match(/accessToken=([^;]+)/)
  if (!match) {
    return null
  }

  const token = match[1]
  return await verifyToken(token)
}
