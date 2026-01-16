import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { getMemberByIdWithRole } from '@/domains/member'

/**
 * 현재 로그인한 사용자 정보 조회 API
 * GET /api/auth/me
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    const memberWithRole = await getMemberByIdWithRole(user.memberId)
    return NextResponse.json(memberWithRole)
  })
}
