import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

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

  return NextResponse.json({
    token: tokenData,
    user: userData,
    existingUser, // 기존 사용자 정보 (있으면 반환, 없으면 null)
    isNewUser: !existingUser, // 신규 사용자 여부
  })
}
