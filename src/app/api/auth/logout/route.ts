import { NextRequest, NextResponse } from 'next/server'

/**
 * 로그아웃 API
 * POST /api/auth/logout
 */
export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      message: '로그아웃 되었습니다.',
    })

    // 모든 인증 관련 쿠키 삭제
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')

    return response
  } catch (error) {
    console.error('로그아웃 에러:', error)
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
