import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { createCommentService } from '@/domains/event'
import { getEventComments } from '@/domains/event'
import { getMemberById } from '@/domains/member'

/**
 * 이벤트 댓글 목록 조회
 * GET /api/event/[id]/comment
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
    try {
      const { id } = await params
      const eventId = parseInt(id)

      if (isNaN(eventId)) {
        return NextResponse.json(
          { error: '유효하지 않은 이벤트 ID입니다.' },
          { status: 400 }
        )
      }

      const comments = await getEventComments(eventId)

      return NextResponse.json(comments)
    } catch (error) {
      console.error('댓글 목록 조회 에러:', error)
      return handleApiError(error, '댓글 목록 조회 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 댓글 작성
 * POST /api/event/[id]/comment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const { id } = await params
      const eventId = parseInt(id)

      if (isNaN(eventId)) {
        return NextResponse.json(
          { error: '유효하지 않은 이벤트 ID입니다.' },
          { status: 400 }
        )
      }

      const body = await authenticatedReq.json()
      const { content } = body

      // 회원의 seq 조회
      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }

      const comment = await createCommentService({
        event_id: eventId,
        member_seq: member.seq,
        content,
      })

      return NextResponse.json(comment, { status: 201 })
    } catch (error) {
      console.error('댓글 작성 에러:', error)
      return handleApiError(error, '댓글 작성 중 오류가 발생했습니다.')
    }
  })
}
