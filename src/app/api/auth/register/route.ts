import { NextRequest, NextResponse } from 'next/server'
import { registerService } from '@/domains/auth/auth.service'
import { createAccessToken, createRefreshToken } from '@/lib/jwt.server'
import {
  generateCsrfToken,
  CSRF_COOKIE_OPTIONS,
  CSRF_COOKIE_NAME,
} from '@/lib/csrf.server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { member_id, email, name, gender, nickname, ntrp, phone } = body

    if (!member_id) {
      return NextResponse.json(
        { error: '사용자 인증 정보가 없습니다.' },
        { status: 500 }
      )
    }

    // 서비스 레이어를 통해 회원가입 처리
    const user = await registerService({
      member_id,
      email,
      name,
      gender,
      nickname,
      ntrp,
      phone,
    })

    console.log(user)
    console.log('회원가입 성공:', {
      member_id: user.member_id,
      email: user.email,
      nickname: user.nickname,
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

    // CSRF 토큰 생성
    const csrfToken = generateCsrfToken()

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
        csrfToken, // 클라이언트에서 헤더로 사용
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

    // CSRF 토큰 쿠키 설정 (Double Submit Cookie 패턴)
    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, CSRF_COOKIE_OPTIONS)

    return response
  } catch (error) {
    console.error('회원가입 에러:', error)

    // 비즈니스 로직 에러 처리
    if (error instanceof Error) {
      // 중복 에러는 409 Conflict
      if (
        error.message.includes('이미 가입된') ||
        error.message.includes('이미 사용 중인')
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }

      // 유효성 검사 에러는 400 Bad Request
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
