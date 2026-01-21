import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { getMyEvents } from '@/domains/event'
import { getMemberById } from '@/domains/member'

/**
 * 내가 참여한 이벤트 목록 조회
 * GET /api/event/my?limit=5
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const { searchParams } = new URL(authenticatedReq.url)
      const limit = parseInt(searchParams.get('limit') || '5')

      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const events = await getMyEvents(member.seq, limit)

      return NextResponse.json({ events })
    } catch (error) {
      console.error('내 이벤트 목록 조회 에러:', error)
      return handleApiError(error, '내 이벤트 목록 조회 중 오류가 발생했습니다.')
    }
  })
}
