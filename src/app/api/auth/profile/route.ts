import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt.server'
import { cookies } from 'next/headers'
import { pool } from '@/lib/db.server'

/**
 * 프로필 업데이트 API
 * 사용자의 이름, 별명, NTRP, 전화번호를 수정
 */
export async function PUT(req: NextRequest) {
  try {
    // 쿠키에서 accessToken 가져오기
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 토큰 검증
    const payload = await verifyToken(accessToken)
    if (!payload) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      )
    }

    const memberId = payload.memberId

    // 요청 본문 파싱
    const body = await req.json()
    const { name, nickname, ntrp, phone } = body

    // 필수 필드 검증
    if (!name || !nickname || !ntrp) {
      return NextResponse.json(
        { error: '이름, 별명, NTRP는 필수 입력 항목입니다.' },
        { status: 400 }
      )
    }

    // DB 업데이트
    const result = await pool.query(
      `UPDATE member
       SET name = $1, nickname = $2, ntrp = $3, phone = $4, updated_at = NOW()
       WHERE member_id = $5
       RETURNING member_id, email, name, nickname, ntrp, gender, phone`,
      [name, nickname, ntrp, phone || null, memberId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const updatedUser = result.rows[0]

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        nickname: updatedUser.nickname,
        ntrp: updatedUser.ntrp,
        gender: updatedUser.gender,
        phone: updatedUser.phone,
      },
    })
  } catch (error) {
    console.error('프로필 업데이트 에러:', error)
    return NextResponse.json(
      { error: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
