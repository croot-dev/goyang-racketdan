import { MEMBER_ROLE } from '@/constants'
import { getAuthSession } from '@/lib/auth.server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/member', '/member/:path*'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/member')) {
    const session = await getAuthSession()

    if (!session) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    // ADMIN이 아니고, 본인 프로필 경로가 아닌 경우에만 리다이렉트
    if (
      session.roleCode !== MEMBER_ROLE.ADMIN &&
      !pathname.startsWith(`/member/${session.memberId}`)
    ) {
      return NextResponse.redirect(
        new URL(`/member/${session.memberId}`, request.url)
      )
    }
  }

  return NextResponse.next()
}
