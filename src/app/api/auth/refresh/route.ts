import { NextRequest, NextResponse } from 'next/server'
import { refreshAccessToken, verifyToken, setAuthCookies } from '@/lib/jwt'

/**
 * 토큰 갱신 API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { refreshToken } = body

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

    // 쿠키에 새 토큰 설정
    await setAuthCookies(newAccessToken, refreshToken)

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken,
    })

  } catch (error) {
    console.error('토큰 갱신 에러:', error)
    return NextResponse.json(
      { error: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
