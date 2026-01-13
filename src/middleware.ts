import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyCsrfToken, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/lib/csrf'

/**
 * CSRF 보호가 필요한 경로들
 * POST, PUT, DELETE 등 상태를 변경하는 요청에 적용
 */
const PROTECTED_PATHS = [
  '/api/auth/register',
  '/api/notice',
  '/api/post',
  // 추가적인 보호 경로들을 여기에 추가
]

/**
 * CSRF 검증이 필요 없는 경로들
 * 로그인/회원가입 등 토큰이 없는 상태에서 호출되는 경로
 */
const CSRF_EXEMPT_PATHS = ['/api/auth/kakao', '/api/auth/sign-in']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // GET, HEAD, OPTIONS 요청은 CSRF 검증 스킵
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return NextResponse.next()
  }

  // CSRF 검증 면제 경로 체크
  const isExempt = CSRF_EXEMPT_PATHS.some((path) => pathname.startsWith(path))
  if (isExempt) {
    return NextResponse.next()
  }

  // 보호된 경로에 대해서만 CSRF 검증
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  if (!isProtected) {
    return NextResponse.next()
  }

  // CSRF 토큰 검증
  const csrfTokenFromHeader = request.headers.get(CSRF_HEADER_NAME)
  const csrfTokenFromCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value

  if (!verifyCsrfToken(csrfTokenFromHeader, csrfTokenFromCookie || null)) {
    return NextResponse.json({ error: 'CSRF 토큰 검증 실패' }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
