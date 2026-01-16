import 'server-only'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, verifyToken, TokenPayload } from '@/lib/jwt.server'

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload
}

/**
 * 인증 미들웨어
 * 요청에서 사용자 정보를 추출하고 검증
 */
export async function withAuth(
  request: NextRequest,
  handler: (
    req: AuthenticatedRequest,
    user: TokenPayload
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getAuthUser(request)

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  // request 객체에 user 정보 추가
  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.user = user

  return handler(authenticatedRequest, user)
}

/**
 * 선택적 인증 미들웨어
 * 인증되지 않은 경우에도 요청을 처리하지만, 인증 정보가 있으면 추가
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (
    req: AuthenticatedRequest,
    user: TokenPayload | null
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = await getAuthUser(request)

  const authenticatedRequest = request as AuthenticatedRequest
  if (user) {
    authenticatedRequest.user = user
  }

  return handler(authenticatedRequest, user)
}

/**
 * 페이지에서 현재 인증된 사용자 정보 가져오기
 * 쿠키의 accessToken을 검증하여 TokenPayload 반환
 */
export async function getAuthSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  if (!token) {
    return null
  }

  return await verifyToken(token)
}
