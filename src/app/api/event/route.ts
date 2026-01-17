import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { getEventListService, createEventService } from '@/domains/event'
import { getMemberById } from '@/domains/member'

/**
 * 이벤트 목록 조회
 * GET /api/event?page=1&limit=10
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    try {
      const { searchParams } = new URL(authenticatedReq.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')

      const result = await getEventListService(page, limit)

      return NextResponse.json({
        ...result,
        page,
        limit,
      })
    } catch (error) {
      console.error('이벤트 목록 조회 에러:', error)
      return handleApiError(error, '이벤트 목록 조회 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 이벤트 생성
 * POST /api/event
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const body = await authenticatedReq.json()
      const {
        title,
        description,
        start_datetime,
        end_datetime,
        location_name,
        location_url,
        max_participants,
      } = body

      // 회원의 seq 조회
      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const event = await createEventService({
        title,
        description,
        start_datetime,
        end_datetime,
        location_name,
        location_url,
        max_participants,
        host_member_seq: member.seq,
      })

      return NextResponse.json(event, { status: 201 })
    } catch (error) {
      console.error('이벤트 생성 에러:', error)
      return handleApiError(error, '이벤트 생성 중 오류가 발생했습니다.')
    }
  })
}
