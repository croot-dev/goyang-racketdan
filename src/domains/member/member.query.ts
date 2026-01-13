/**
 * Member 데이터 액세스 레이어
 * SQL 쿼리만 담당
 */

import 'server-only'
import { sql } from '@/lib/db.server'
import { Member, CreateMemberDto } from './member.model'

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
export async function createMember(data: CreateMemberDto): Promise<Member> {
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
