import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { getMemberById } from '@/domains/member'
import { createAccessToken } from '@/lib/jwt.server'

/**
 * 현재 로그인한 사용자 정보 조회 API
 * GET /api/auth/me
 *
 * DB 조회 결과와 토큰 값이 다르면 토큰을 갱신하여 동기화
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    const memberWithRole = await getMemberById(user.memberId)

    if (!memberWithRole) {
      return NextResponse.json(
        { error: '회원 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // DB 값과 토큰 값이 다르면 토큰 갱신
    const needsTokenRefresh =
      user.roleCode !== memberWithRole.role_code ||
      user.roleName !== memberWithRole.role_name ||
      user.email !== memberWithRole.email

    if (needsTokenRefresh) {
      const newPayload = {
        memberId: user.memberId,
        roleCode: memberWithRole.role_code,
        roleName: memberWithRole.role_name,
        email: memberWithRole.email,
      }

      // accessToken만 갱신 (refreshToken은 유효기간이 길어 갱신 불필요)
      const accessToken = await createAccessToken(newPayload)

      // accessToken만 쿠키에 설정
      const response = NextResponse.json(memberWithRole)
      response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 15, // 15분
        path: '/',
      })
      return response
    }

    return NextResponse.json(memberWithRole)
  })
}
