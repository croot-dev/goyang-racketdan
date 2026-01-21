import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { joinEvent, cancelEvent } from '@/domains/event'
import { getMemberById } from '@/domains/member'

/**
 * 이벤트 참여 신청
 * POST /api/event/[id]/join
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (_, user) => {
    try {
      const { id } = await params
      const eventId = parseInt(id)

      if (isNaN(eventId)) {
        return NextResponse.json(
          { error: '유효하지 않은 이벤트 ID입니다.' },
          { status: 400 }
        )
      }

      // 회원의 seq 조회
      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const participant = await joinEvent(
        eventId,
        member.seq
      )

      return NextResponse.json(participant, { status: 201 })
    } catch (error) {
      console.error('이벤트 참여 신청 에러:', error)
      return handleApiError(error, '이벤트 참여 신청 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 이벤트 참여 취소
 * DELETE /api/event/[id]/join
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (_, user) => {
    try {
      const { id } = await params
      const eventId = parseInt(id)

      if (isNaN(eventId)) {
        return NextResponse.json(
          { error: '유효하지 않은 이벤트 ID입니다.' },
          { status: 400 }
        )
      }

      // 회원의 seq 조회
      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      await cancelEvent(eventId, member.seq)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('이벤트 참여 취소 에러:', error)
      return handleApiError(error, '이벤트 참여 취소 중 오류가 발생했습니다.')
    }
  })
}
