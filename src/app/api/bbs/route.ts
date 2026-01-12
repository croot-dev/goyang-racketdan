import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, gender, nickname, ntrp, phone } = body

    // 필수 필드 검증
    if (!email || !name || !gender || !nickname || !ntrp) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUserByEmail = await sql`
      SELECT * FROM member WHERE email = ${email}
    `

    if (existingUserByEmail.length > 0) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다.' },
        { status: 409 }
      )
    }

    // 별명 중복 확인
    const existingUserByNickname = await sql`
      SELECT * FROM member WHERE nickname = ${nickname}
    `

    if (existingUserByNickname.length > 0) {
      return NextResponse.json(
        { error: '이미 사용 중인 별명입니다.' },
        { status: 409 }
      )
    }

    // 카카오 로그인이므로 비밀번호는 랜덤 해시값 생성
    const randomPassword = Math.random().toString(36).slice(-8)
    const passwordHash = await bcrypt.hash(randomPassword, 12)

    // gender 변환: M -> male, F -> female
    const sexValue = gender === 'M' ? 'male' : 'female'

    // 데이터베이스에 사용자 저장
    const newUser = await sql`
      INSERT INTO member (
        name,
        nickname,
        sex,
        ntrp,
        email,
        password_hash,
        phone,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${name},
        ${nickname},
        ${sexValue},
        ${ntrp},
        ${email},
        ${passwordHash},
        ${phone || null},
        'active',
        NOW(),
        NOW()
      )
      RETURNING id, email, name, nickname, ntrp, sex, phone, status, created_at
    `

    const user = newUser[0]

    console.log('회원가입 성공:', {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    })

    // TODO: JWT 토큰 생성 및 쿠키 설정
    // 임시로 간단한 토큰 생성
    const mockToken = `token_${user.id}_${Date.now()}`

    return NextResponse.json(
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
        token: mockToken,
      },
      {
        status: 201,
        headers: {
          'Set-Cookie': `auth-token=${mockToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`, // 30일
        },
      }
    )
  } catch (error) {
    console.error('회원가입 에러:', error)
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
