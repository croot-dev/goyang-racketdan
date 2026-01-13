import { NextRequest, NextResponse } from 'next/server'
import { registerService } from '@/services/auth.service'
import { createAccessToken, createRefreshToken } from '@/lib/jwt'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, gender, nickname, ntrp, phone } = body

    // 서비스 레이어를 통해 회원가입 처리
    const user = await registerService({
      email,
      name,
      gender,
      nickname,
      ntrp,
      phone,
    })

    console.log('회원가입 성공:', {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    })

    // JWT 토큰 생성
    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
    })

    const refreshToken = await createRefreshToken({
      userId: user.id,
      email: user.email,
    })

    // 쿠키 설정
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          ntrp: user.ntrp,
          sex: user.sex,
          phone: user.phone,
        },
        accessToken,
      },
      { status: 201 }
    )

    // HttpOnly 쿠키로 토큰 설정
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
