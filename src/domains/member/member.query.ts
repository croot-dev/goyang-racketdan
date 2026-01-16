/**
 * Member 데이터 액세스 레이어
 * SQL 쿼리만 담당
 */

import 'server-only'
import { sql } from '@/lib/db.server'
import {
  Member,
  CreateMemberDto,
  MemberWithRole,
  UpdateMemberDto,
  MemberListResult,
} from './member.model'
import { MEMBER_ROLE, MEMBER_STATUS } from '@/constants'

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
    SELECT * FROM member WHERE member_id = ${id}
  `) as Member[]
  return Array.isArray(result) ? result[0] : null
}

/**
 * 회원 전체 조회
 * @returns
 */
export async function getMemberList(
  page: number = 1,
  limit: number = 10
): Promise<MemberListResult> {
  const offset = (page - 1) * limit

  const [members, countResult] = (await Promise.all([
    sql`
    SELECT *
    FROM member
    WHERE 1=1
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*) as total
      FROM bbs_post
      WHERE 1=1
    `,
  ])) as [Member[], { total: number }[]]

  return {
    members,
    total: Number(countResult[0].total),
    totalPages: Math.ceil(Number(countResult[0].total) / limit),
  }
}

/**
 * ID로 회원 조회
 */
export async function getMemberByIdWithRole(
  id: string
): Promise<MemberWithRole | null> {
  const result = (await sql`
    SELECT 
      m.*,
      r.code AS role_code,
      r.name AS role_name 
    FROM member m
    JOIN member_role mr 
        ON m.seq = mr.member_seq 
    JOIN role r
        ON mr.role_seq = r.seq
    WHERE member_id = ${id}
  `) as MemberWithRole[]
  return Array.isArray(result) ? result[0] : null
}

/**
 * 회원 생성
 */
export async function createMember(
  data: CreateMemberDto
): Promise<MemberWithRole> {
  const {
    member_id,
    name,
    nickname,
    gender,
    ntrp,
    email,
    password_hash,
    phone,
  } = data

  const memberResult = (await sql`
  WITH inserted_member AS (
    INSERT INTO member (
        member_id,
        name,
        nickname,
        gender,
        ntrp,
        email,
        password_hash,
        phone,
        status,
        created_at,
        updated_at
    )
    VALUES (
        ${member_id},
        ${name},
        ${nickname},
        ${gender},
        ${ntrp},
        ${email},
        ${password_hash},
        ${phone || null},
        ${MEMBER_STATUS.ACTIVE},
        NOW(),
        NOW()
    )
    RETURNING
        seq,
        member_id,
        email,
        name,
        nickname,
        ntrp,
        gender,
        phone,
        status,
        created_at,
        updated_at
  ),
  guest_role AS (
      SELECT seq
      FROM role
      WHERE code = ${MEMBER_ROLE.GUEST}
      LIMIT 1
  ),
  inserted_member_role AS (
      INSERT INTO member_role (
          member_seq,
          role_seq,
          assigned_at
      )
      SELECT
          im.seq,
          gr.seq,
          NOW()
      FROM inserted_member im
      CROSS JOIN guest_role gr
  )
  SELECT
      member_id,
      email,
      name,
      nickname,
      ntrp,
      gender,
      phone,
      status,
      created_at,
      updated_at
  FROM inserted_member;
  `) as MemberWithRole[]

  return memberResult[0]
}

/**
 * 회원 수정
 */
export async function updateMember(data: UpdateMemberDto): Promise<Member> {
  const { member_id, name, nickname, gender, ntrp, phone } = data

  const memberResult = (await sql`
  WITH updated_member AS (
    UPDATE member
    SET
        name       = ${name},
        nickname   = ${nickname},
        gender     = ${gender},
        ntrp       = ${ntrp},
        phone      = ${phone || null},
        updated_at = NOW()
    WHERE member_id = ${member_id}
      AND deleted_at IS NULL
    RETURNING
        seq,
        member_id,
        name,
        nickname,
        gender,
        ntrp,
        email,
        phone,
        status,
        created_at,
        updated_at
  )
  SELECT
      member_id,
      name,
      nickname,
      gender,
      ntrp,
      email,
      phone,
      status,
      created_at,
      updated_at
  FROM updated_member;
  `) as Member[]

  return memberResult[0]
}
