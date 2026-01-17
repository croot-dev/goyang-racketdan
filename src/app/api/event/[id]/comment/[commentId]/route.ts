import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { updateCommentService, deleteCommentService } from '@/domains/event'
import { getMemberById } from '@/domains/member'

/**
 * 댓글 수정
 * PUT /api/event/[id]/comment/[commentId]
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const { commentId } = await params
      const commentIdNum = parseInt(commentId)

      if (isNaN(commentIdNum)) {
        return NextResponse.json(
          { error: '유효하지 않은 댓글 ID입니다.' },
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

      const comment = await updateCommentService(
        commentIdNum,
        content,
        member.seq
      )

      return NextResponse.json(comment)
    } catch (error) {
      console.error('댓글 수정 에러:', error)
      return handleApiError(error, '댓글 수정 중 오류가 발생했습니다.')
    }
  })
}

/**
 * 댓글 삭제
 * DELETE /api/event/[id]/comment/[commentId]
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  return withAuth(req, async (_, user) => {
    try {
      const { commentId } = await params
      const commentIdNum = parseInt(commentId)

      if (isNaN(commentIdNum)) {
        return NextResponse.json(
          { error: '유효하지 않은 댓글 ID입니다.' },
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

      await deleteCommentService(commentIdNum, member.seq)

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('댓글 삭제 에러:', error)
      return handleApiError(error, '댓글 삭제 중 오류가 발생했습니다.')
    }
  })
}
