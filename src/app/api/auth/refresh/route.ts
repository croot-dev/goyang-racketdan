import { NextRequest, NextResponse } from 'next/server'
import { refreshAccessToken, verifyToken } from '@/lib/jwt.server'
import { cookies } from 'next/headers'

/**
 * 토큰 갱신 API
 * HttpOnly 쿠키에서 refreshToken을 읽어서 새로운 accessToken 발급
 */
export async function POST(req: NextRequest) {
  try {
    // 쿠키에서 refreshToken 가져오기
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token이 필요합니다.' },
        { status: 400 }
      )
    }

    // Refresh token 검증
    const payload = await verifyToken(refreshToken)
    if (!payload) {
      return NextResponse.json(
        { error: '유효하지 않은 refresh token입니다.' },
        { status: 401 }
      )
    }

    // 새로운 access token 발급
    const newAccessToken = await refreshAccessToken(refreshToken)
    if (!newAccessToken) {
      return NextResponse.json(
        { error: '토큰 갱신에 실패했습니다.' },
        { status: 500 }
      )
    }

    // Response 생성
    const response = NextResponse.json({
      success: true,
    })

    // 새로운 accessToken을 쿠키에 설정
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15분
      path: '/',
    })

    return response

  } catch (error) {
    console.error('토큰 갱신 에러:', error)
    return NextResponse.json(
      { error: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
