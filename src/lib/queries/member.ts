/**
 * 회원 데이터 액세스 레이어
 * SQL 쿼리만 담당
 */

import { sql } from '@/lib/db'

export interface Member {
  id: string
  email: string
  name: string
  nickname: string
  ntrp: string
  sex: 'male' | 'female'
  phone: string | null
  password_hash: string
  status: string
  created_at: string
  updated_at: string
}

/**
 * 이메일로 회원 조회
 */
export async function getMemberByEmail(email: string): Promise<Member | null> {
  const result = (await sql`
    SELECT * FROM member WHERE email = ${email}
  `) as Member[]
  return Array.isArray(result) ? result[0] : null
}

/**
 * 별명으로 회원 조회
 */
export async function getMemberByNickname(
  nickname: string
): Promise<Member | null> {
  const result = (await sql`
    SELECT * FROM member WHERE nickname = ${nickname}
  `) as Member[]
  return Array.isArray(result) ? result[0] : null
}

/**
 * ID로 회원 조회
 */
export async function getMemberById(id: string): Promise<Member | null> {
  const result = (await sql`
    SELECT * FROM member WHERE id = ${id}
  `) as Member[]
  return Array.isArray(result) ? result[0] : null
}

/**
 * 회원 생성
 */
export async function createMember(data: {
  email: string
  name: string
  nickname: string
  sex: 'male' | 'female'
  ntrp: string
  password_hash: string
  phone?: string | null
}): Promise<Member> {
  const { email, name, nickname, sex, ntrp, password_hash, phone } = data

  const result = (await sql`
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
      ${sex},
      ${ntrp},
      ${email},
      ${password_hash},
      ${phone || null},
      'active',
      NOW(),
      NOW()
    )
    RETURNING id, email, name, nickname, ntrp, sex, phone, password_hash, status, created_at, updated_at
  `) as Member[]

  return result[0]
}
