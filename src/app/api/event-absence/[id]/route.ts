import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import {
  getEventAbsenceDetailService,
  updateEventAbsenceService,
  deleteEventAbsenceService,
} from '@/domains/event_absence'
import { getMemberById } from '@/domains/member'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * 불참 기록 상세 조회
 * GET /api/event-absence/:id
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  return withAuth(req, async () => {
    try {
      const { id } = await params
      const absenceId = parseInt(id)

      const absence = await getEventAbsenceDetailService(absenceId)

      return NextResponse.json(absence)
    } catch (error) {
      console.error('불참 기록 상세 조회 에러:', error)
      return handleApiError(error, '불참 기록 조회 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 불참 기록 수정
 * PUT /api/event-absence/:id
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const { id } = await params
      const absenceId = parseInt(id)
      const body = await authenticatedReq.json()
      const { absence_type, reason, late_minutes } = body

      // 요청자 정보 조회
      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const absence = await updateEventAbsenceService(
        {
          id: absenceId,
          absence_type,
          reason,
          late_minutes,
        },
        member.seq
      )

      return NextResponse.json(absence)
    } catch (error) {
      console.error('불참 기록 수정 에러:', error)
      return handleApiError(error, '불참 기록 수정 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 불참 기록 삭제
 * DELETE /api/event-absence/:id
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const { id } = await params
      const absenceId = parseInt(id)

      // 요청자 정보 조회
      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      await deleteEventAbsenceService(absenceId, member.seq)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('불참 기록 삭제 에러:', error)
      return handleApiError(error, '불참 기록 삭제 중 오류가 발생했습니다.')
    }
  })
}
