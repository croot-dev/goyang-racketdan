import { MEMBER_ROLE } from '@/constants'
import { getAuthSession } from '@/lib/auth.server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/member', '/member/:path*'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(pathname)
  if (pathname.startsWith('/member')) {
    const session = await getAuthSession()

    if (!session) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    if (session.roleCode !== MEMBER_ROLE.GUEST) {
      return NextResponse.redirect(
        new URL(`/member/${session.memberId}`, request.url)
      )
    }
  }

  return NextResponse.next()
}
