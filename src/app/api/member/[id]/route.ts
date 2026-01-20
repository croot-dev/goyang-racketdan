import { NextRequest, NextResponse } from 'next/server'
import {
  getMemberByIdWithRole,
  modifyMemberService,
  withdrawMemberService,
} from '@/domains/member'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { MEMBER_ROLE } from '@/constants'
import { ErrorCode, ServiceError } from '@/lib/error'

// 멤버 상세 조회 API
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async () => {
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
      const { name, gender, birthdate, nickname, ntrp, phone } = body

      if (member_id !== user.memberId && user.roleCode !== MEMBER_ROLE.ADMIN) {
        throw new ServiceError(
          ErrorCode.NOT_OWNER,
          '멤버 정보를 수정할 권한이 없습니다.'
        )
      }

      const updatedUser = await modifyMemberService({
        member_id,
        requester_id: user.memberId,
        name,
        birthdate,
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

// 회원 탈퇴 API
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(req, async (_authenticatedReq, user) => {
    try {
      const { id: memberId } = await params

      await withdrawMemberService(memberId, user.memberId)

      return NextResponse.json({ success: true, message: '회원 탈퇴가 완료되었습니다.' })
    } catch (error) {
      console.error('회원 탈퇴 에러:', error)
      return handleApiError(error, '회원 탈퇴 처리 중 오류가 발생했습니다.')
    }
  })
}
