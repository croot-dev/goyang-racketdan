import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { getEventAbsencesByEventService } from '@/domains/event_absence'

interface RouteParams {
  params: Promise<{ eventId: string }>
}

/**
 * 특정 이벤트의 불참 기록 목록 조회
 * GET /api/event-absence/event/:eventId
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  return withAuth(req, async () => {
    try {
      const { eventId } = await params
      const eventIdNum = parseInt(eventId)

      const absences = await getEventAbsencesByEventService(eventIdNum)

      return NextResponse.json({ absences })
    } catch (error) {
      console.error('이벤트 불참 기록 조회 에러:', error)
      return handleApiError(error, '이벤트 불참 기록 조회 중 오류가 발생했습니다.')
    }
  })
}
