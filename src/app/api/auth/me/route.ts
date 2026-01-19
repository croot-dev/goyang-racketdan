import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { getMemberByIdWithRole } from '@/domains/member'
import {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
} from '@/lib/jwt.server'

/**
 * 현재 로그인한 사용자 정보 조회 API
 * GET /api/auth/me
 *
 * DB 조회 결과와 토큰 값이 다르면 토큰을 갱신하여 동기화
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    const memberWithRole = await getMemberByIdWithRole(user.memberId)

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

      const accessToken = await createAccessToken(newPayload)
      const refreshToken = await createRefreshToken(newPayload)
      await setAuthCookies(accessToken, refreshToken)
    }

    return NextResponse.json(memberWithRole)
  })
}
