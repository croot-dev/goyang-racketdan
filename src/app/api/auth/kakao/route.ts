import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { createAccessToken, createRefreshToken } from '@/lib/jwt'
import {
  generateCsrfToken,
  CSRF_COOKIE_OPTIONS,
  CSRF_COOKIE_NAME,
} from '@/lib/csrf'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const redirectUri = req.nextUrl.searchParams.get('redirect_uri') // ✅ 쿼리에서 가져오기

  if (!code) {
    return NextResponse.json({ error: 'No code' }, { status: 400 })
  }
  if (!redirectUri) {
    return NextResponse.json({ error: 'No redirect_uri' }, { status: 400 })
  }

  const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.NEXT_PUBLIC_KAKAO_RESTAPI_KEY!,
      client_secret: process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET!, // secret 안 쓰면 제거
      redirect_uri: redirectUri, // ✅ 쿼리에서 받은 값 사용
      code,
    }),
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error) {
    return NextResponse.json(tokenData, { status: 400 })
  }

  // 사용자 정보 요청
  const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
  })

  const userData = await userRes.json()
  const email = userData.kakao_account?.email

  // 이메일로 기존 사용자 확인
  let existingUser = null
  if (email) {
    const users = await sql`
      SELECT id, email, name, nickname, ntrp, sex, phone, status
      FROM member
      WHERE email = ${email}
      LIMIT 1
    `
    existingUser = users.length > 0 ? users[0] : null
  }

  // 기존 사용자인 경우 JWT 토큰 생성 및 쿠키 설정
  if (existingUser) {
    const accessToken = await createAccessToken({
      userId: existingUser.id,
      email: existingUser.email,
    })

    const refreshToken = await createRefreshToken({
      userId: existingUser.id,
      email: existingUser.email,
    })

    // CSRF 토큰 생성
    const csrfToken = generateCsrfToken()

    const response = NextResponse.json({
      token: tokenData,
      user: userData,
      existingUser,
      isNewUser: false,
      accessToken,
      csrfToken, // 클라이언트에서 헤더로 사용
    })

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
  }

  // 신규 사용자인 경우 토큰 없이 반환
  return NextResponse.json({
    token: tokenData,
    user: userData,
    existingUser: null,
    isNewUser: true,
  })
}
