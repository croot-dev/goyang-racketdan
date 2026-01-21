/**
 * 인증 리포지토리 레이어
 * 순수 DB 접근 로직만 담당
 */

import 'server-only'
import {
  getMemberByEmail,
  getMemberByNickname,
  createMember as createMemberQuery,
} from '@/domains/member/member.query'
import { Member, MemberWithRole } from '../member'

/**
 * 이메일로 회원 조회
 */
export async function findMemberByEmail(
  email: string
): Promise<Member | null> {
  return getMemberByEmail(email)
}

/**
 * 닉네임으로 회원 조회
 */
export async function findMemberByNickname(
  nickname: string
): Promise<Member | null> {
  return getMemberByNickname(nickname)
}

/**
 * 회원 생성
 */
export async function createMember(
  data: Pick<
    Member,
    | 'member_id'
    | 'email'
    | 'name'
    | 'birthdate'
    | 'nickname'
    | 'ntrp'
    | 'gender'
    | 'phone'
  > & { password_hash: string }
): Promise<MemberWithRole> {
  return createMemberQuery({
    member_id: data.member_id,
    email: data.email,
    name: data.name,
    birthdate: data.birthdate,
    nickname: data.nickname,
    gender: data.gender,
    ntrp: data.ntrp,
    password_hash: data.password_hash,
    phone: data.phone || null,
  })
}
