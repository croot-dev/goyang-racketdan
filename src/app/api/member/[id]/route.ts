import { NextRequest, NextResponse } from 'next/server'
import { getMemberByIdWithRole, modifyMemberService } from '@/domains/member'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'

// 멤버 상세 조회 API
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const { id } = await params
      const result = await getMemberByIdWithRole(id)

      return NextResponse.json(result)
    } catch (error) {
      console.error('멤버 상세 조회 에러:', error)
      return handleApiError(error, '멤버 상세 조회 중 오류가 발생했습니다.')
    }
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const { id: member_id } = await params
      const body = await authenticatedReq.json()
      const { name, gender, nickname, ntrp, phone } = body

      const updatedUser = await modifyMemberService({
        member_id,
        requester_id: user.memberId,
        name,
        nickname,
        gender,
        ntrp,
        phone: phone || null,
      })

      return NextResponse.json(updatedUser)
    } catch (error) {
      console.error('회원정보 수정 에러:', error)
      return handleApiError(error, '회원정보 수정 처리 중 오류가 발생했습니다.')
    }
  })
}
