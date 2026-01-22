import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import {
  getEventAbsenceListService,
  createEventAbsenceService,
} from '@/domains/event_absence'
import { getMemberById } from '@/domains/member'
import { parsePaginationParams } from '@/lib/query.utils'

/**
 * 불참 기록 목록 조회
 * GET /api/event-absence?page=1&limit=10
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    try {
      const { searchParams } = new URL(authenticatedReq.url)
      const { page, limit } = parsePaginationParams(
        searchParams.get('page'),
        searchParams.get('limit')
      )

      const result = await getEventAbsenceListService(page, limit)

      return NextResponse.json({
        ...result,
        page,
        limit,
      })
    } catch (error) {
      console.error('불참 기록 목록 조회 에러:', error)
      return handleApiError(error, '불참 기록 목록 조회 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 불참 기록 생성
 * POST /api/event-absence
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const body = await authenticatedReq.json()
      const { event_id, member_seq, absence_type, reason, late_minutes } = body

      // 신고자 정보 조회
      const reporter = await getMemberById(user.memberId)
      if (!reporter) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const absence = await createEventAbsenceService(
        {
          event_id,
          member_seq,
          absence_type,
          reason,
          late_minutes,
        },
        reporter.seq
      )

      return NextResponse.json(absence, { status: 201 })
    } catch (error) {
      console.error('불참 기록 생성 에러:', error)
      return handleApiError(error, '불참 기록 생성 중 오류가 발생했습니다.')
    }
  })
}
