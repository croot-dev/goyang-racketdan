import { NextRequest, NextResponse } from 'next/server'
import { registerService } from '@/domains/auth'
import { createAccessToken, createRefreshToken } from '@/lib/jwt.server'
import { modifyMemberService } from '@/domains/member'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { ServiceError, ErrorCode } from '@/lib/error'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: member_id } = await params
    const body = await req.json()
    const { email, name, gender, nickname, ntrp, phone } = body

    if (!member_id) {
      throw new ServiceError(
        ErrorCode.UNAUTHORIZED,
        '사용자 인증 정보가 없습니다.'
      )
    }

    const user = await registerService({
      member_id,
      email,
      name,
      gender,
      nickname,
      ntrp,
      phone,
    })

    // JWT 토큰 생성
    const accessToken = await createAccessToken({
      memberId: user.member_id,
      email: user.email,
    })

    const refreshToken = await createRefreshToken({
      memberId: user.member_id,
      email: user.email,
    })

    // 쿠키 설정
    const response = NextResponse.json(
      {
        success: true,
        user: {
          member_id: user.member_id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          ntrp: user.ntrp,
          gender: user.gender,
          phone: user.phone,
        },
        accessToken,
      },
      { status: 201 }
    )

    // HttpOnly 쿠키로 JWT 토큰 설정
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15분
      path: '/',
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return response
  } catch (error) {
    console.error('회원가입 에러:', error)
    return handleApiError(error, '회원가입 처리 중 오류가 발생했습니다.')
  }
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
