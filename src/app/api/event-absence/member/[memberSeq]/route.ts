import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import {
  getEventAbsencesByMemberService,
  getMemberAbsenceStatsService,
} from '@/domains/event_absence'

interface RouteParams {
  params: Promise<{ memberSeq: string }>
}

/**
 * 특정 회원의 불참 기록 목록 조회
 * GET /api/event-absence/member/:memberSeq
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  return withAuth(req, async (authenticatedReq) => {
    try {
      const { memberSeq } = await params
      const memberSeqNum = parseInt(memberSeq)

      const { searchParams } = new URL(authenticatedReq.url)
      const includeStats = searchParams.get('stats') === 'true'

      const absences = await getEventAbsencesByMemberService(memberSeqNum)

      if (includeStats) {
        const stats = await getMemberAbsenceStatsService(memberSeqNum)
        return NextResponse.json({ absences, stats })
      }

      return NextResponse.json({ absences })
    } catch (error) {
      console.error('회원 불참 기록 조회 에러:', error)
      return handleApiError(error, '회원 불참 기록 조회 중 오류가 발생했습니다.')
    }
  })
}
