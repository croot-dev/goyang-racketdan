import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromNextRequest } from '@/lib/jwt.server'
import { sql } from '@/lib/db.server'

/**
 * 현재 로그인한 사용자 정보 조회 API
 * GET /api/auth/me
 */
export async function GET(req: NextRequest) {
  try {
    // 쿠키에서 인증된 사용자 정보 가져오기
    const tokenPayload = await getAuthUserFromNextRequest(req)

    if (!tokenPayload) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 데이터베이스에서 사용자 정보 조회
    const users = await sql`
      SELECT member_id, email, name, nickname, ntrp, gender, phone, status
      FROM member
      WHERE member_id = ${tokenPayload.memberId}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const user = users[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        ntrp: user.ntrp,
        gender: user.gender,
        phone: user.phone,
        status: user.status,
      },
    })
  } catch (error) {
    console.error('사용자 정보 조회 에러:', error)
    return NextResponse.json(
      { error: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
